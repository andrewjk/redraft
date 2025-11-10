import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { messageGroupsTable, messagesTable, usersTable } from "../../data/schema";
import type MessageGroupListModel from "../../types/messages/MessageGroupListModel";
import updateNotificationCounts from "../notifications/updateNotificationCounts";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function messageGroupGet(slug: string, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		// Get the current (only) user
		const userQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get the message group with the supplied slug
		const messageGroupQuery = db.query.messageGroupsTable.findFirst({
			where: eq(messageGroupsTable.slug, slug),
			with: {
				followedBy: true,
				following: true,
				messages: true,
			},
		});

		const [user, messageGroup] = await Promise.all([userQuery, messageGroupQuery]);

		if (!user) {
			return unauthorized();
		}
		if (!messageGroup) {
			return notFound();
		}

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

		const result = {
			messageGroup: {
				groupSlug: messageGroup.slug,
				userSlug: messageGroup.followedBy?.slug ?? messageGroup.following?.slug ?? "",
				url: messageGroup.followedBy?.url ?? messageGroup.following?.url ?? "",
				image: messageGroup.followedBy?.image ?? messageGroup.following?.image ?? "",
				name: messageGroup.followedBy?.name ?? messageGroup.following?.name ?? "",
			},
			messages: messageGroup.messages.map((m) => {
				return {
					id: m.id,
					text: m.text,
					read: m.read,
					sent: m.sent,
					sentAt: m.created_at,
					delivered: m.delivered,
				};
			}),
		} satisfies MessageGroupListModel;

		return ok(result);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
