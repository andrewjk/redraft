import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { feedTable, followingTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";

// IMPORTANT! Update this when the model changes
export const COMMENT_RECEIVED_VERSION = 1;

export type CommentReceivedModel = {
	sharedKey: string;
	slug: string;
	commentCount: number;
	lastCommentAt: Date;
	version: number;
};

export default async function commentReceived(request: Request) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				const model: CommentReceivedModel = await request.json();
				if (model.version !== COMMENT_RECEIVED_VERSION) {
					return unprocessable(
						`Incompatible version (received ${model.version}, expected ${COMMENT_RECEIVED_VERSION})`,
					);
				}

				const user = await tx.query.followingTable.findFirst({
					where: eq(followingTable.shared_key, model.sharedKey),
				});
				if (!user) {
					return notFound();
				}

				// Update the feed record
				await tx
					.update(feedTable)
					.set({
						comment_count: model.commentCount,
						last_comment_at: model.lastCommentAt,
					})
					.where(eq(feedTable.slug, model.slug));

				// TODO: Create a notification if this post has been commented on by the current user

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
