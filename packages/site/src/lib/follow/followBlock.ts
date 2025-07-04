import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { commentsTable, followedByTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type BlockModel = {
	id: number;
};

/**
 * Approves a follow request from another user.
 */
export default async function followBlock(request: Request, code: string) {
	try {
		const db = database();

		const model: BlockModel = await request.json();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		// Get the followed by user
		const record = await db.query.followedByTable.findFirst({
			where: eq(followedByTable.id, model.id),
			columns: { id: true, blocked_at: true },
		});
		if (!record) {
			return notFound();
		}

		// If this user has already been blocked, just return ok
		if (!record.blocked_at) {
			// Set block date in the followed by record
			await db
				.update(followedByTable)
				.set({
					blocked_at: new Date(),
					updated_at: new Date(),
				})
				.where(eq(followedByTable.id, record.id));

			// Set block date in the comments
			await db
				.update(commentsTable)
				.set({
					blocked_at: new Date(),
					updated_at: new Date(),
				})
				.where(eq(commentsTable.user_id, record.id));

			// TODO: Allow the user to send a message with the block
			// Send the confirmation
			//let sendUrl = `${record.url}api/public/follow/confirm`;
			//let sendData: FollowConfirmModel = {
			//	sharedKey: record.shared_key,
			//};
			//await postPublic(sendUrl, sendData);
		}

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
