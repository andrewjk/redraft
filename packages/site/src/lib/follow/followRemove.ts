import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { and, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { commentsTable, followedByTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type RemoveModel from "../../types/follow/RemoveModel";
import type FollowRemovedModel from "../../types/public/FollowRemovedModel";
import { FOLLOW_REMOVED_VERSION } from "../../types/public/FollowRemovedModel";
import { postPublic } from "../public";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

/**
 * Approves a follow request from another user.
 */
export default async function followRemove(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		const model: RemoveModel = await request.json();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get the followed by user
		const followedByQuery = db.query.followedByTable.findFirst({
			where: and(eq(followedByTable.url, model.url), isNull(followedByTable.deleted_at)),
		});

		const [currentUser, followedBy] = await Promise.all([currentUserQuery, followedByQuery]);
		if (!currentUser) {
			return unauthorized();
		}
		if (!followedBy) {
			return notFound();
		}

		// If this user has already been deleted, just return ok
		// Otherwise, update the record
		if (!followedBy.deleted_at) {
			await transaction(db, async (tx) => {
				try {
					// Set deleted date in the followed by record
					await tx
						.update(followedByTable)
						.set({
							deleted_at: new Date(),
							updated_at: new Date(),
						})
						.where(eq(followedByTable.id, followedBy.id));

					// Set deleted date in the comments
					await tx
						.update(commentsTable)
						.set({
							deleted_at: new Date(),
							updated_at: new Date(),
						})
						.where(eq(commentsTable.user_id, followedBy.id));
				} catch (error) {
					errorMessage = getErrorMessage(error).message;
					throw error;
				}
			});
		}

		// TODO: Allow the user to send a message with the removal
		// Send the confirmation
		let sendUrl = `${followedBy.url}api/public/follow/remove`;
		let sendData: FollowRemovedModel = {
			sharedKey: followedBy.shared_key,
			version: FOLLOW_REMOVED_VERSION,
		};
		await postPublic(sendUrl, sendData);

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
