import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { activityTable, feedTable, followingTable, usersTable } from "../../data/schema";
import { postPublic } from "../public";
import {
	UNFOLLOW_REQUESTED_VERSION,
	type UnfollowRequestedModel,
} from "../public/unfollowRequested";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type UnfollowModel = {
	url: string;
};

/**
 * Sends an unfollow request to another user.
 */
export default async function unfollowSend(request: Request, code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		const model: UnfollowModel = await request.json();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		const recordQuery = db.query.followingTable.findFirst({
			where: eq(followingTable.url, model.url),
		});

		const [currentUser, record] = await Promise.all([currentUserQuery, recordQuery]);
		if (!currentUser) {
			return unauthorized();
		}
		if (!record) {
			return notFound();
		}

		// If this user has already been unfollowed, just return ok
		if (!record.deleted_at) {
			// Send off a request to the url
			let sendUrl = `${model.url}api/public/unfollow/request`;
			let sendData: UnfollowRequestedModel = {
				url: currentUser.url,
				sharedKey: record.shared_key,
				version: UNFOLLOW_REQUESTED_VERSION,
			};
			await postPublic(sendUrl, sendData);

			await db.transaction(async (tx) => {
				try {
					// Update the feed and following tables with a deleted_at value
					await tx
						.update(feedTable)
						.set({ deleted_at: new Date() })
						.where(eq(feedTable.user_id, record.id));
					await tx
						.update(followingTable)
						.set({ deleted_at: new Date() })
						.where(eq(followingTable.id, record.id));

					// Create an activity record
					await tx.insert(activityTable).values({
						url: model.url,
						text: `You unfollowed ${record.name}`,
						created_at: new Date(),
						updated_at: new Date(),
					});
				} catch (error) {
					errorMessage = getErrorMessage(error).message;
					tx.rollback();
				}
			});
		}

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
