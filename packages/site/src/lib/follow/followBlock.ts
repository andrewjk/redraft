import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { commentsTable, followedByTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type BlockModel from "../../types/follow/BlockModel";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

/**
 * Approves a follow request from another user.
 */
export default async function followBlock(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		const model: BlockModel = await request.json();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get the followed by user
		const followedByQuery = db.query.followedByTable.findFirst({
			where: eq(followedByTable.url, model.url),
			columns: { id: true, blocked_at: true },
		});

		const [currentUser, followedBy] = await Promise.all([currentUserQuery, followedByQuery]);
		if (!currentUser) {
			return unauthorized();
		}
		if (!followedBy) {
			return notFound();
		}

		// If this user has already been blocked, just return ok
		if (!followedBy.blocked_at) {
			await transaction(db, async (tx) => {
				try {
					// Set block date in the followed by record
					await tx
						.update(followedByTable)
						.set({
							blocked_at: new Date(),
							updated_at: new Date(),
						})
						.where(eq(followedByTable.id, followedBy.id));

					// Set block date in the comments
					await tx
						.update(commentsTable)
						.set({
							blocked_at: new Date(),
							updated_at: new Date(),
						})
						.where(eq(commentsTable.user_id, followedBy.id));
				} catch (error) {
					errorMessage = getErrorMessage(error).message;
					throw error;
				}
			});
		}

		// TODO: Allow the user to send a message with the block
		// Send the confirmation
		//let sendUrl = `${record.url}api/public/follow/confirm`;
		//let sendData: FollowConfirmModel = {
		//	sharedKey: record.shared_key,
		//};
		//await postPublic(sendUrl, sendData);

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
