import db from "@/data/db";
import { articlesTable, postsTable } from "@/data/schema";
import {
	ARTICLE_POST_TYPE,
	FOLLOWER_POST_VISIBILITY,
	PUBLIC_POST_VISIBILITY,
} from "@/data/schema/postsTable";
import { User } from "@/data/schema/usersTable";
import { notFound, ok, serverError } from "@torpor/build/response";
import { and, eq, or } from "drizzle-orm";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import commentPreview from "../comments/commentPreview";
import getErrorMessage from "../utils/getErrorMessage";

export default async function postGet(user: User, follower: User, slug: string) {
	try {
		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
		if (!currentUser) {
			return notFound();
		}

		const condition = and(
			eq(postsTable.slug, slug),
			// Logged in users can see any post
			// Logged in followers can see public or follower posts
			// Non-logged in users can only see public posts
			user
				? undefined
				: follower
					? or(
							eq(postsTable.visibility, PUBLIC_POST_VISIBILITY),
							eq(postsTable.visibility, FOLLOWER_POST_VISIBILITY),
						)
					: eq(postsTable.visibility, PUBLIC_POST_VISIBILITY),
		);

		// Get the post from the database
		const post = await db.query.postsTable.findFirst({
			where: condition,
			with: {
				postTags: {
					with: {
						tag: true,
					},
				},
				// TODO: Async (all/child) load comments when scrolled to?
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
		let articleText;
		if (post.type === ARTICLE_POST_TYPE && post.article_id) {
			const article = await db.query.articlesTable.findFirst({
				where: eq(articlesTable.id, post.article_id),
			});
			if (article) {
				articleText = micromark(article.text, {
					extensions: [gfm()],
					htmlExtensions: [gfmHtml()],
				});
			}
		}

		// Create the view
		let parentComments = post.comments.filter((c) => c.parent_id === null);
		let childComments = post.comments.filter((c) => c.parent_id !== null);
		const view = {
			slug: post.slug,
			type: post.type,
			text: post.text,
			image: post.image,
			url: post.url,
			title: post.title,
			publication: post.publication,
			articleText: articleText,
			author: {
				image: currentUser.image,
				name: currentUser.name,
				url: currentUser.url,
			},
			commentCount: post.comment_count,
			likeCount: post.like_count,
			emojiFirst: post.emoji_first,
			emojiSecond: post.emoji_second,
			emojiThird: post.emoji_third,
			publishedAt: post.published_at ?? post.created_at,
			republishedAt: post.republished_at,
			tags: post.postTags.map((pt) => ({ slug: pt.tag.slug, text: pt.tag.text })),
			comments: parentComments.map((c) => commentPreview(c, currentUser, childComments)),
		};

		return ok(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
