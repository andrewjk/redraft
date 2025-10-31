import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { messageGroupsTable, messagesTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type MessageEditModel from "../../types/messages/MessageEditModel";
import type MessageReceivedModel from "../../types/public/MessageReceivedModel";
import { MESSAGE_RECEIVED_VERSION } from "../../types/public/MessageReceivedModel";
import { postPublic } from "../public";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

/**
 * Creates a message and adds it to a message group.
 */
export default async function messageGroupPost(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		const model: MessageEditModel = await request.json();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get the message group
		const messageGroupQuery = db.query.messageGroupsTable.findFirst({
			where: eq(messageGroupsTable.slug, model.groupSlug),
			with: {
				followedBy: true,
				following: true,
			},
		});

		const [currentUser, messageGroup] = await Promise.all([currentUserQuery, messageGroupQuery]);
		if (!currentUser) {
			return unauthorized();
		}
		if (!messageGroup) {
			return notFound();
		}

		let messageId = -1;

		await transaction(db, async (tx) => {
			try {
				// Create the message in the database
				messageId = (
					await tx
						.insert(messagesTable)
						.values({
							group_id: messageGroup.id,
							text: model.text,
							sent: true,
							read: true,
							created_at: new Date(),
							updated_at: new Date(),
						})
						.returning({ id: messagesTable.id })
				)[0].id;
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		// Send it to the recipient
		// This could take some time, so send it off to be done in an endpoint without awaiting it
		// It has to be done outside of the transaction
		let sendUrl = `${messageGroup.followedBy?.url ?? messageGroup.following?.url}api/public/message`;
		let sendData: MessageReceivedModel = {
			sharedKey: messageGroup.followedBy?.shared_key ?? messageGroup.following?.shared_key ?? "",
			slug: messageGroup.slug,
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

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
