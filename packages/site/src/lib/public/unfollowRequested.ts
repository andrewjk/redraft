import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import { and, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable } from "../../data/schema";
import transaction from "../../data/transaction";
import { UNFOLLOW_REQUESTED_VERSION } from "../../types/public/UnfollowRequestedModel";
import type UnfollowRequestedModel from "../../types/public/UnfollowRequestedModel";
import getErrorMessage from "../utils/getErrorMessage";

/**
 * Receives a follow request from another user.
 */
export default async function followRequested(request: Request) {
	let errorMessage = "";

	try {
		const db = database();
		const model: UnfollowRequestedModel = await request.json();
		if (model.version !== UNFOLLOW_REQUESTED_VERSION) {
			return unprocessable(
				`Incompatible version (received ${model.version}, expected ${UNFOLLOW_REQUESTED_VERSION})`,
			);
		}

		// Get the current (only) user
		const userQuery = db.query.usersTable.findFirst();

		// Get the followed by record
		const recordQuery = db.query.followedByTable.findFirst({
			where: and(
				eq(followedByTable.url, model.url),
				eq(followedByTable.shared_key, model.sharedKey),
				isNull(followedByTable.deleted_at),
			),
		});

		const [user, record] = await Promise.all([userQuery, recordQuery]);
		if (!user) {
			return notFound();
		}

		// NOTE: Return ok even if the record was not found, to avoid leaking info
		if (record) {
			await transaction(db, async (tx) => {
				try {
					await tx
						.update(followedByTable)
						.set({
							deleted_at: new Date(),
							updated_at: new Date(),
						})
						.where(eq(followedByTable.id, record.id));
				} catch (error) {
					errorMessage = getErrorMessage(error).message;
					throw error;
				}
			});
		}

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
