import database from "@/data/database";
import { feedTable, followingTable } from "@/data/schema";
import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";

export type CommentedModel = {
	sharedKey: string;
	slug: string;
	commentCount: number;
	lastCommentAt: Date;
};

export default async function commentReceived(request: Request) {
	try {
		const db = database();

		const model: CommentedModel = await request.json();

		const user = await db.query.followingTable.findFirst({
			where: eq(followingTable.shared_key, model.sharedKey),
		});
		if (!user) {
			return notFound();
		}

		// Update the feed record
		await db
			.update(feedTable)
			.set({
				comment_count: model.commentCount,
				last_comment_at: model.lastCommentAt,
			})
			.where(eq(feedTable.slug, model.slug));

		// TODO: Create a notification if this post has been commented on by the current user

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
