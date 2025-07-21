import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, postsTable } from "../../data/schema";
import { postPublic } from "../public";
import { COMMENT_RECEIVED_VERSION, type CommentReceivedModel } from "../public/commentReceived";
import getErrorMessage from "../utils/getErrorMessage";

export type CommentSendModel = {
	post_id: number;
};

export default async function commentSend(request: Request) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				const model: CommentSendModel = await request.json();

				// Load the post
				const post = await tx.query.postsTable.findFirst({
					where: eq(postsTable.id, model.post_id),
				});
				if (!post) {
					return notFound();
				}

				// Load the followers
				const followers = await tx.query.followedByTable.findMany({
					where: eq(followedByTable.approved, true),
				});

				// TODO: Insert a queue record for each follower and set it to sent when
				// success. Then delete all handled records at the end. Allow doing
				// something with failed records

				for (let follower of followers) {
					try {
						let sendUrl = `${follower.url}api/public/commented`;
						let sendData: CommentReceivedModel = {
							sharedKey: follower.shared_key,
							slug: post.slug,
							commentCount: post.comment_count,
							lastCommentAt: post.last_comment_at!,
							version: COMMENT_RECEIVED_VERSION,
						};
						await postPublic(sendUrl, sendData);
					} catch {
						// TODO: as above
					}
				}

				return ok();
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
				return serverError(errorMessage);
			}
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
