import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import { and, eq } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";

// IMPORTANT! Update this when the model changes
export const UNFOLLOW_REQUESTED_VERSION = 1;

export type UnfollowRequestedModel = {
	url: string;
	sharedKey: string;
	version: number;
};

/**
 * Receives a follow request from another user.
 */
export default async function followRequested(request: Request) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				const model: UnfollowRequestedModel = await request.json();
				if (model.version !== UNFOLLOW_REQUESTED_VERSION) {
					return unprocessable(
						`Incompatible version (received ${model.version}, expected ${UNFOLLOW_REQUESTED_VERSION})`,
					);
				}

				// Get the current (only) user
				const user = await tx.query.usersTable.findFirst();
				if (!user) {
					return notFound();
				}

				// Get the followed by record
				const record = await tx.query.followedByTable.findFirst({
					where: and(
						eq(followedByTable.url, model.url),
						eq(followedByTable.shared_key, model.sharedKey),
					),
				});

				// NOTE: Return ok even if the record was not found, to avoid leaking info

				if (record) {
					await tx
						.update(followedByTable)
						.set({
							deleted_at: new Date(),
						})
						.where(eq(followedByTable.id, record.id));
				}

				return ok();
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
			}
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
