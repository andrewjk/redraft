import db from "@/data/db";
import { commentsTable, postsTable } from "@/data/schema";
import { type Comment } from "@/data/schema/commentsTable";
import { notFound, ok, serverError } from "@torpor/build/response";
import { eq, isNull } from "drizzle-orm";
import commentPreview from "../comments/commentPreview";
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
			// TODO: Async load comments when scrolled to?
			with: {
				comments: {
					where: isNull(commentsTable.parent_id),
					with: {
						user: true,
					},
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
				name: user.name,
				url: user.url,
			},
			commentCount: post.comment_count,
			createdAt: post.created_at,
			updatedAt: post.updated_at,
			comments: post.comments.map((c) => commentPreview(c as Comment, user)),
		};

		return ok(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
