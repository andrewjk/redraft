import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import { and, eq, or } from "drizzle-orm";
import database from "../../data/database";
import {
	followedByTable,
	followingTable,
	messageGroupsTable,
	messagesTable,
	usersTable,
} from "../../data/schema";
import createNotification from "../utils/createNotification";
import getErrorMessage from "../utils/getErrorMessage";

// IMPORTANT! Update this when the model changes
export const MESSAGE_RECEIVED_VERSION = 1;

export type MessageReceivedModel = {
	sharedKey: string;
	slug: string;
	text: string;
	version: number;
};

export default async function messageReceived(request: Request) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		const model: MessageReceivedModel = await request.json();
		if (model.version !== MESSAGE_RECEIVED_VERSION) {
			return unprocessable(
				`Incompatible version (received ${model.version}, expected ${MESSAGE_RECEIVED_VERSION})`,
			);
		}

		// Get the current (only) user
		const userQuery = db.query.usersTable.findFirst();

		const followedByQuery = db.query.followedByTable.findFirst({
			where: eq(followedByTable.shared_key, model.sharedKey),
		});

		const followingQuery = db.query.followingTable.findFirst({
			where: eq(followingTable.shared_key, model.sharedKey),
		});

		const [user, followedBy, following] = await Promise.all([
			userQuery,
			followedByQuery,
			followingQuery,
		]);
		if (!user) {
			return notFound();
		}
		if (!followedBy && !following) {
			return notFound();
		}

		var messageGroup = await db.query.messageGroupsTable.findFirst({
			where: or(
				followedBy ? eq(messageGroupsTable.followed_by_id, followedBy.id) : undefined,
				following ? eq(messageGroupsTable.following_id, following.id) : undefined,
			),
		});

		await db.transaction(async (tx) => {
			try {
				// Create the message group if it doesn't exist
				if (!messageGroup) {
					messageGroup = (
						await tx
							.insert(messageGroupsTable)
							.values({
								slug: model.slug,
								followed_by_id: followedBy?.id,
								following_id: following?.id,
								newest_sent: false,
								newest_at: new Date(),
								created_at: new Date(),
								updated_at: new Date(),
							})
							.returning()
					)[0];
				}

				const messageId = (
					await tx
						.insert(messagesTable)
						.values({
							group_id: messageGroup.id,
							text: model.text,
							created_at: new Date(),
							updated_at: new Date(),
						})
						.returning({ id: messagesTable.id })
				)[0].id;

				await tx
					.update(messageGroupsTable)
					.set({
						newest_id: messageId,
						newest_sent: false,
						newest_at: new Date(),
						unread_count: tx.$count(
							messagesTable,
							and(eq(messagesTable.group_id, messageGroup.id), eq(messagesTable.read, false)),
						),
					})
					.where(eq(messageGroupsTable.id, messageGroup.id));

				await db
					.update(usersTable)
					.set({ message_count: db.$count(messagesTable, eq(messagesTable.read, false)) });

				// Create a notification
				await createNotification(
					tx,
					`${user.url}messages/${messageGroup.slug}`,
					`Message received from ${followedBy?.name ?? following?.name}`,
				);
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
			}
		});

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
