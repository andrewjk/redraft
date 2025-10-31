import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { feedTable, followingTable } from "../../data/schema";
import transaction from "../../data/transaction";
import { COMMENT_RECEIVED_VERSION } from "../../types/public/CommentReceivedModel";
import type CommentReceivedModel from "../../types/public/CommentReceivedModel";
import getErrorMessage from "../utils/getErrorMessage";

export default async function commentReceived(request: Request) {
	let errorMessage = "";

	try {
		const db = database();

		const model: CommentReceivedModel = await request.json();
		if (model.version !== COMMENT_RECEIVED_VERSION) {
			return unprocessable(
				`Incompatible version (received ${model.version}, expected ${COMMENT_RECEIVED_VERSION})`,
			);
		}

		const user = await db.query.followingTable.findFirst({
			where: eq(followingTable.shared_key, model.sharedKey),
		});
		if (!user) {
			return notFound();
		}

		await transaction(db, async (tx) => {
			try {
				// Update the feed record
				await tx
					.update(feedTable)
					.set({
						comment_count: model.commentCount,
						last_comment_at: model.lastCommentAt,
					})
					.where(eq(feedTable.slug, model.slug));
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		// TODO: Create a notification if this post has been commented on by the current user

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
