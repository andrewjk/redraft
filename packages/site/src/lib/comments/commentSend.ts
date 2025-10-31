import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, postsTable } from "../../data/schema";
import type CommentSendModel from "../../types/comments/CommentSendModel";
import type CommentReceivedModel from "../../types/public/CommentReceivedModel";
import { COMMENT_RECEIVED_VERSION } from "../../types/public/CommentReceivedModel";
import { postPublic } from "../public";
import getErrorMessage from "../utils/getErrorMessage";

export default async function commentSend(request: Request) {
	let errorMessage = "";

	try {
		const db = database();

		const model: CommentSendModel = await request.json();

		// Load the post
		const postQuery = db.query.postsTable.findFirst({
			where: eq(postsTable.id, model.post_id),
		});

		// Load the followers
		const followersQuery = db.query.followedByTable.findMany({
			where: eq(followedByTable.approved, true),
		});

		const [post, followers] = await Promise.all([postQuery, followersQuery]);
		if (!post) {
			return notFound();
		}

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
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
