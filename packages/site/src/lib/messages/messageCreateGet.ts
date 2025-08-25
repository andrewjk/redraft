import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq, or } from "drizzle-orm";
import database from "../../data/database";
import {
	followedByTable,
	followingTable,
	messageGroupsTable,
	messagesTable,
	usersTable,
} from "../../data/schema";
import updateNotificationCounts from "../notifications/updateNotificationCounts";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import type { MessageGroupModel } from "./MessageGroupModel";

/**
 * Gets the details for creating a message group and message.
 */
export default async function messageCreateGet(slug: string, code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		// Get the current (only) user
		const userQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Maybe get the existing message group
		const messageGroupQuery = db.query.messageGroupsTable.findFirst({
			where: or(
				eq(
					messageGroupsTable.followed_by_id,
					db
						.select({ id: followedByTable.id })
						.from(followedByTable)
						.where(eq(followedByTable.slug, slug)),
				),
				eq(
					messageGroupsTable.following_id,
					db
						.select({ id: followingTable.id })
						.from(followingTable)
						.where(eq(followingTable.slug, slug)),
				),
			),
			columns: { id: true, slug: true },
			with: {
				messages: true,
			},
		});

		// Get the user with the supplied slug
		const followedByQuery = db.query.followedByTable.findFirst({
			where: eq(followedByTable.slug, slug),
		});

		// Get the user with the supplied slug
		const followingQuery = db.query.followingTable.findFirst({
			where: eq(followingTable.slug, slug),
		});

		const [user, messageGroup, followedBy, following] = await Promise.all([
			userQuery,
			messageGroupQuery,
			followedByQuery,
			followingQuery,
		]);

		if (!user) {
			return unauthorized();
		}
		if (!followedBy && !following) {
			return notFound();
		}

		if (messageGroup) {
			// Set all messages in this group to read
			await db
				.update(messagesTable)
				.set({ read: true })
				.where(eq(messagesTable.group_id, messageGroup.id));
			await db
				.update(messageGroupsTable)
				.set({ unread_count: 0 })
				.where(eq(messageGroupsTable.id, messageGroup.id));
			await db
				.update(usersTable)
				.set({ message_count: db.$count(messagesTable, eq(messagesTable.read, false)) });
			updateNotificationCounts(db);
		}

		const result = {
			messageGroup: {
				groupSlug: messageGroup?.slug ?? "",
				userSlug: followedBy?.slug ?? following?.slug ?? "",
				url: followedBy?.url ?? following?.url ?? "",
				image: followedBy?.image ?? following?.image ?? "",
				name: followedBy?.name ?? following?.name ?? "",
			},
			messages: messageGroup
				? messageGroup.messages.map((m) => {
						return {
							id: m.id,
							text: m.text,
							read: m.read,
							sent: m.sent,
							sentAt: m.created_at,
							delivered: m.delivered,
						};
					})
				: [],
		} satisfies MessageGroupModel;

		return ok(result);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
