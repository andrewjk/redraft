import database from "@/data/database";
import { followedByTable, postsTable } from "@/data/schema";
import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import { postPublic } from "../public";
import { CommentedModel } from "../public/commentReceived";
import getErrorMessage from "../utils/getErrorMessage";

export type CommentSendModel = {
	post_id: number;
};

export default async function commentSend(request: Request) {
	try {
		const db = database();

		const model: CommentSendModel = await request.json();

		// Load the post
		const post = await db.query.postsTable.findFirst({
			where: eq(postsTable.id, model.post_id),
		});
		if (!post) {
			return notFound();
		}

		// Load the followers
		const followers = await db.query.followedByTable.findMany({
			where: eq(followedByTable.approved, true),
		});

		// TODO: Insert a queue record for each follower and set it to sent when
		// success. Then delete all handled records at the end. Allow doing
		// something with failed records

		for (let follower of followers) {
			try {
				let sendUrl = `${follower.url}api/public/commented`;
				let sendData: CommentedModel = {
					sharedKey: follower.shared_key,
					slug: post.slug,
					commentCount: post.comment_count,
					lastCommentAt: post.last_comment_at!,
				};
				await postPublic(sendUrl, sendData);
			} catch {
				// TODO: as above
			}
		}

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
