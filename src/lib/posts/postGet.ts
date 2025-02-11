import db from "@/data/db";
import { commentsTable, postsTable } from "@/data/schema";
import { notFound, ok, serverError } from "@torpor/build/response";
import { and, eq, isNull } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";

export default async function postGet(slug: string) {
	try {
		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		// Get the post from the database
		const post = await db.query.postsTable.findFirst({
			where: eq(postsTable.slug, slug),
			//extras: {
			//	// HACK: https://github.com/drizzle-team/drizzle-orm/issues/3493
			//	//commentCount: db
			//	//	.$count(commentsTable, eq(commentsTable.post_id, postsTable.id))
			//	//	.as("commentCount"),
			//	commentCount:
			//		sql`(select count(*) from comments where comments.post_id = postsTable.id)`.as(
			//			"commentCount",
			//		),
			//},
			with: {
				comments: {
					where: and(eq(commentsTable.post_id, postsTable.id), isNull(commentsTable.parent_id)),
				},
			},
		});
		if (!post) {
			return notFound();
		}

		// Create the view
		const view = {
			slug: post.slug,
			text: post.text,
			author: {
				image: user.image,
				username: user.username,
				url: process.env.SITE_LOCATION!,
			},
			commentCount: post.comment_count,
			createdAt: post.created_at,
			updatedAt: post.updated_at,
			comments: post.comments,
		};

		return ok(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
