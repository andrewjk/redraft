import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { feedTable, followingTable, usersTable } from "../../data/schema";
import { activityTable } from "../../data/schema/activityTable";
import { postPublic } from "../public";
import { type UnfollowRequestedModel } from "../public/unfollowRequested";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type UnfollowModel = {
	url: string;
};

/**
 * Sends an unfollow request to another user.
 */
export default async function unfollowSend(request: Request, code: string) {
	try {
		const db = database();

		const model: UnfollowModel = await request.json();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		const record = await db.query.followingTable.findFirst({
			where: eq(followingTable.url, model.url),
		});
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
			};
			await postPublic(sendUrl, sendData);

			// Update the feed and following tables with a deleted_at value
			await db
				.update(feedTable)
				.set({ deleted_at: new Date() })
				.where(eq(feedTable.user_id, record.id));
			await db
				.update(followingTable)
				.set({ deleted_at: new Date() })
				.where(eq(followingTable.id, record.id));

			// Create an activity record
			await db.insert(activityTable).values({
				url: model.url,
				text: `You unfollowed ${record.name}`,
				created_at: new Date(),
				updated_at: new Date(),
			});
		}

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
