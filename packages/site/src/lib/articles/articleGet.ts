import { notFound, ok, serverError } from "@torpor/build/response";
import { and, eq, isNull, or } from "drizzle-orm";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import database from "../../data/database";
import { articlesTable, commentsTable, postsTable } from "../../data/schema";
import { User } from "../../data/schema/usersTable";
import commentPreview from "../comments/commentPreview";
import { FOLLOWER_POST_VISIBILITY, PUBLIC_POST_VISIBILITY } from "../constants";
import ensureSlash from "../utils/ensureSlash";
import getErrorMessage from "../utils/getErrorMessage";

export default async function articleGet(user: User, follower: User, slug: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				// Get the current (only) user
				const currentUser = await tx.query.usersTable.findFirst();
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
				const post = await tx.query.postsTable.findFirst({
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
							where: isNull(commentsTable.blocked_at),
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
				if (post.article_id) {
					const article = await tx.query.articlesTable.findFirst({
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
					text: post.text,
					image: post.image,
					isArticle: post.is_article,
					articleText: articleText,
					linkUrl: post.is_article
						? `${ensureSlash(currentUser.url)}articles/${post.slug}`
						: post.link_url,
					linkTitle: post.link_title,
					linkImage: post.link_image,
					linkPublication: post.is_article ? currentUser.name : post.link_publication,
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

				return ok({ post: view });
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
