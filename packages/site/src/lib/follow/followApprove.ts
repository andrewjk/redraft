import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type ApproveModel from "../../types/follow/ApproveModel";
import { FOLLOW_CONFIRMED_VERSION } from "../../types/public/FollowConfirmedModel";
import type FollowConfirmedModel from "../../types/public/FollowConfirmedModel";
import { postPublic } from "../public";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

/**
 * Approves a follow request from another user.
 */
export default async function followApprove(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		const model: ApproveModel = await request.json();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get the record
		const followedByQuery = db.query.followedByTable.findFirst({
			where: eq(followedByTable.url, model.url),
		});

		const [currentUser, followedBy] = await Promise.all([currentUserQuery, followedByQuery]);
		if (!currentUser) {
			return unauthorized();
		}
		if (!followedBy) {
			return notFound();
		}

		await transaction(db, async (tx) => {
			try {
				// Set approved in the followed by record
				await tx
					.update(followedByTable)
					.set({
						approved: true,
						updated_at: new Date(),
					})
					.where(eq(followedByTable.url, model.url));
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		// Send the confirmation
		let sendUrl = `${followedBy.url}api/public/follow/confirm`;
		let sendData: FollowConfirmedModel = {
			sharedKey: followedBy.shared_key,
			version: FOLLOW_CONFIRMED_VERSION,
		};
		await postPublic(sendUrl, sendData);

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
