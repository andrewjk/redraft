import { badRequest, created, notFound, serverError } from "@torpor/build/response";
import { and, eq } from "drizzle-orm";
import * as v from "valibot";
import database from "../../data/database";
import { eventRsvpsTable, eventsTable, postsTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type RsvpModel from "../../types/events/RsvpModel";
import type RsvpResultModel from "../../types/events/RsvpResultModel";
import { EVENT_LINK_TYPE, RSVP_DECLINED, RSVP_GOING, RSVP_MAYBE } from "../constants";
import createNotification from "../notifications/createNotification";
import updateNotificationCounts from "../notifications/updateNotificationCounts";
import { postPublic } from "../public";
import type ActivityReceivedModel from "../../types/public/ActivityReceivedModel";
import { ACTIVITY_RECEIVED_VERSION } from "../../types/public/ActivityReceivedModel";
import getErrorMessage from "../utils/getErrorMessage";
import getRsvpCounts from "./rsvpCounts";

// The status may arrive as a number (JSON API) or a string (form submission)
const RsvpSchema = v.pipe(
	v.object({ status: v.union([v.string(), v.number()]) }),
	v.transform((o): RsvpModel => ({ status: Number(o.status) })),
	v.check(
		(o) => [RSVP_GOING, RSVP_MAYBE, RSVP_DECLINED].includes(o.status as 1 | 2 | 3),
		"Invalid RSVP status",
	),
) as unknown as v.GenericSchema<unknown, RsvpModel>;

export interface RsvpRequester {
	url: string;
	name: string;
	image: string;
	/** Empty for the event owner, set for followers */
	sharedKey: string;
}

export default async function rsvpCreate(
	request: Request,
	params: Record<string, string>,
	requester: RsvpRequester,
) {
	let errorMessage = "";

	try {
		const db = database();

		let model: RsvpModel = await request.json();
		let validated = v.safeParse(RsvpSchema, model);
		if (!validated.success) {
			return badRequest({
				message: validated.issues.map((e) => e.message).join("\n"),
				data: model,
			});
		}
		model = validated.output;

		// Load the event owner
		const owner = await db.query.usersTable.findFirst();
		if (!owner) {
			return notFound();
		}

		// Load the post and its event
		const post = await db.query.postsTable.findFirst({
			where: and(eq(postsTable.slug, params.slug), eq(postsTable.link_type, EVENT_LINK_TYPE)),
			columns: { id: true, slug: true, event_id: true },
		});
		if (!post || !post.event_id) {
			return notFound();
		}

		const event = await db.query.eventsTable.findFirst({
			where: eq(eventsTable.id, post.event_id),
		});
		if (!event) {
			return notFound();
		}

		if (!event.rsvp_enabled) {
			return badRequest({ message: "RSVPs are not enabled for this event", data: model });
		}

		if (event.rsvp_deadline && event.rsvp_deadline.getTime() < Date.now()) {
			return badRequest({ message: "RSVPs have closed for this event", data: model });
		}

		const isFollower = !!requester.sharedKey;

		// Look up the requester's existing RSVP
		const existing = await db.query.eventRsvpsTable.findFirst({
			where: and(eq(eventRsvpsTable.event_id, event.id), eq(eventRsvpsTable.url, requester.url)),
		});

		// Enforce the cap on "going" RSVPs
		if (model.status === RSVP_GOING && event.rsvp_limit) {
			const counts = await getRsvpCounts(db, event.id);
			if (counts.going >= event.rsvp_limit && existing?.status !== RSVP_GOING) {
				return badRequest({ message: "This event is full", data: model });
			}
		}

		await transaction(db, async (tx) => {
			try {
				if (existing) {
					await tx
						.update(eventRsvpsTable)
						.set({
							name: requester.name,
							image: requester.image,
							status: model.status,
							updated_at: new Date(),
							deleted_at: null,
						})
						.where(eq(eventRsvpsTable.id, existing.id));
				} else {
					await tx.insert(eventRsvpsTable).values({
						event_id: event.id,
						url: requester.url,
						name: requester.name,
						image: requester.image,
						status: model.status,
						created_at: new Date(),
						updated_at: new Date(),
					});
				}

				if (isFollower) {
					const statusText =
						model.status === RSVP_GOING
							? "is going to"
							: model.status === RSVP_MAYBE
								? "might go to"
								: "can't go to";
					await createNotification(
						tx,
						`${owner.url}events/${post.slug}`,
						`${requester.name} ${statusText} your event`,
					);

					// Send the activity off to be created in the follower's database
					const sendUrl = `${requester.url}api/public/activity`;
					const sendData: ActivityReceivedModel = {
						sharedKey: requester.sharedKey,
						url: `${owner.url}events/${post.slug}`,
						type: "rsvped",
						version: ACTIVITY_RECEIVED_VERSION,
					};
					await postPublic(sendUrl, sendData);
				}
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		if (isFollower) {
			updateNotificationCounts(db);
		}

		const counts = await getRsvpCounts(db, event.id);
		const result: RsvpResultModel = {
			goingCount: counts.going,
			maybeCount: counts.maybe,
			declinedCount: counts.declined,
			viewerStatus: model.status,
		};
		return created(result);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
