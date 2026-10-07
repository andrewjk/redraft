import type { ServerEndPoint } from "@torpor/build";
import { notFound, serverError } from "@torpor/build/response";
import { and, eq, isNull, or } from "drizzle-orm";
import database from "../../../../data/database";
import { eventsTable, postsTable } from "../../../../data/schema";
import {
	EVENT_LINK_TYPE,
	FOLLOWER_POST_VISIBILITY,
	PUBLIC_POST_VISIBILITY,
} from "../../../../lib/constants";
import env from "../../../../lib/env";
import eventIcal from "../../../../lib/events/eventIcal";
import ensureSlash from "../../../../lib/utils/ensureSlash";

export default {
	get: async ({ appData, params }) => {
		try {
			const user = appData.user;
			const follower = appData.follower;
			const db = database();

			const post = await db.query.postsTable.findFirst({
				where: and(
					eq(postsTable.slug, params.slug),
					eq(postsTable.link_type, EVENT_LINK_TYPE),
					isNull(postsTable.deleted_at),
					// Logged in users can see any post
					// Logged in followers can see public or follower posts
					// Non-logged in users can only see public posts
					user
						? undefined
						: follower
							? or(
									eq(postsTable.visibility, PUBLIC_POST_VISIBILITY),
									eq(postsTable.visibility, FOLLOWER_POST_VISIBILITY),
								)
							: eq(postsTable.visibility, PUBLIC_POST_VISIBILITY),
				),
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

			const body = eventIcal(
				event,
				post.slug,
				post.link_title ?? "Event",
				`${ensureSlash(env().SITE_LOCATION)}events/${post.slug}`,
			);

			return new Response(body, {
				headers: {
					"Content-Type": "text/calendar; charset=utf-8",
					"Content-Disposition": `attachment; filename="${post.slug}.ics"`,
				},
			});
		} catch (error) {
			return serverError((error as Error).message);
		}
	},
} satisfies ServerEndPoint;
