import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followingTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type FollowRemovedModel from "../../types/public/FollowRemovedModel";
import { FOLLOW_REMOVED_VERSION } from "../../types/public/FollowRemovedModel";
import getErrorMessage from "../utils/getErrorMessage";

/**
 * Confirms a follow request that was sent.
 */
export default async function followRemoved(request: Request) {
	let errorMessage = "";

	try {
		const db = database();

		const model: FollowRemovedModel = await request.json();
		if (model.version !== FOLLOW_REMOVED_VERSION) {
			return unprocessable(
				`Incompatible version (received ${model.version}, expected ${FOLLOW_REMOVED_VERSION})`,
			);
		}

		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		await transaction(db, async (tx) => {
			try {
				// Set deleted in the following record
				await tx
					.update(followingTable)
					.set({
						deleted_at: new Date(),
						updated_at: new Date(),
					})
					.where(eq(followingTable.shared_key, model.sharedKey));

				// No notifications, don't want to make things awkward
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
