import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import {
	followedByTable,
	followingTable,
	messageGroupsTable,
	messagesTable,
	usersTable,
} from "../../data/schema";
import transaction from "../../data/transaction";
import { postPublic } from "../public";
import { MESSAGE_RECEIVED_VERSION, MessageReceivedModel } from "../public/messageReceived";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import uuid from "../utils/uuid";
import type { MessageEditModel } from "./MessageEditModel";

export type MessageCreatedModel = {
	slug: string;
};

/**
 * Creates a message group with a message.
 */
export default async function messageCreatePost(request: Request, code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		const model: MessageEditModel = await request.json();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get the user with the supplied slug
		const followedByQuery = db.query.followedByTable.findFirst({
			where: eq(followedByTable.slug, model.userSlug),
		});

		// Get the user with the supplied slug
		const followingQuery = db.query.followingTable.findFirst({
			where: eq(followingTable.slug, model.userSlug),
		});

		const [currentUser, followedBy, following] = await Promise.all([
			currentUserQuery,
			followedByQuery,
			followingQuery,
		]);
		if (!currentUser) {
			return unauthorized();
		}
		if (!followedBy && !following) {
			return notFound();
		}

		// Maybe get the message group
		let messageGroup = model.groupSlug
			? await db.query.messageGroupsTable.findFirst({
					where: eq(messageGroupsTable.slug, model.groupSlug),
					columns: { id: true },
				})
			: undefined;

		let messageGroupSlug = model.groupSlug || uuid();
		let messageId = -1;

		await transaction(db, async (tx) => {
			try {
				// Create the message group
				let messageGroupId = messageGroup
					? messageGroup.id
					: (
							await tx
								.insert(messageGroupsTable)
								.values({
									slug: messageGroupSlug,
									followed_by_id: followedBy?.id,
									following_id: following?.id,
									newest_at: new Date(),
									newest_sent: true,
									created_at: new Date(),
									updated_at: new Date(),
								})
								.returning({ id: messagesTable.id })
						)[0].id;

				// Create the message in the database
				messageId = (
					await tx
						.insert(messagesTable)
						.values({
							group_id: messageGroupId,
							text: model.text,
							sent: true,
							read: true,
							created_at: new Date(),
							updated_at: new Date(),
						})
						.returning({ id: messagesTable.id })
				)[0].id;

				// Update the newest id in the message groups table
				await tx
					.update(messageGroupsTable)
					.set({
						newest_id: messageId,
					})
					.where(eq(messageGroupsTable.id, messageGroupId));
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		// Send it to the recipient
		// This could take some time, so send it off to be done in an endpoint without awaiting it
		// It has to be done outside of the transaction
		let sendUrl = `${followedBy?.url ?? following?.url}api/public/message`;
		let sendData: MessageReceivedModel = {
			sharedKey: followedBy?.shared_key ?? following?.shared_key ?? "",
			slug: messageGroupSlug,
			text: model.text,
			version: MESSAGE_RECEIVED_VERSION,
		};
		await postPublic(sendUrl, sendData);

		// Set delivered to true
		await db
			.update(messagesTable)
			.set({
				delivered: true,
			})
			.where(eq(messagesTable.id, messageId));

		const result: MessageCreatedModel = { slug: messageGroupSlug };

		return ok(result);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
