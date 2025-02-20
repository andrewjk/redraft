import db from "@/data/db";
import { articlesTable, postsTable } from "@/data/schema";
import { type Comment } from "@/data/schema/commentsTable";
import { ARTICLE_POST } from "@/data/schema/postsTable";
import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
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
			// TODO: Async (all/child) load comments when scrolled to?
			with: {
				comments: {
					//where: isNull(commentsTable.parent_id),
					with: {
						user: true,
					},
				},
			},
		});
		if (!post) {
			return notFound();
		}

		// If it's an article, get the article text
		let article;
		if (post.type === ARTICLE_POST && post.article_id) {
			article = await db.query.articlesTable.findFirst({
				where: eq(articlesTable.id, post.article_id),
			});
		}

		// Create the view
		let parentComments = post.comments.filter((c) => c.parent_id === null);
		let childComments = post.comments.filter((c) => c.parent_id !== null);
		const view = {
			slug: post.slug,
			type: post.type,
			text: post.text,
			image: post.image,
			title: post.title,
			articleText: article?.text,
			author: {
				image: user.image,
				name: user.name,
				url: user.url,
			},
			commentCount: post.comment_count,
			likeCount: post.like_count,
			createdAt: post.created_at,
			updatedAt: post.updated_at,
			comments: parentComments.map((c) => commentPreview(c, user, childComments)),
		};

		return ok(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
