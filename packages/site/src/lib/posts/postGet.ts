import { notFound, ok, serverError } from "@torpor/build/response";
import { and, eq, isNull, or } from "drizzle-orm";
import { micromark } from "micromark";
import database from "../../data/database";
import { articlesTable, commentsTable, eventsTable, postsTable } from "../../data/schema";
import { Article } from "../../data/schema/articlesTable";
import { Event } from "../../data/schema/eventsTable";
import { Post } from "../../data/schema/postsTable";
import { User } from "../../data/schema/usersTable";
import type PostViewModel from "../../types/posts/PostViewModel";
import commentPreview from "../comments/commentPreview";
import {
	ARTICLE_LINK_TYPE,
	EVENT_LINK_TYPE,
	FOLLOWER_POST_VISIBILITY,
	LINK_LINK_TYPE,
	PUBLIC_POST_VISIBILITY,
} from "../constants";
import ensureSlash from "../utils/ensureSlash";
import getErrorMessage from "../utils/getErrorMessage";

export default async function postGet(user: User, follower: User, slug: string) {
	let errorMessage = "";

	try {
		const db = database();

		// Get the current (only) user
		const currentUserQuery = db.query.usersTable.findFirst();

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
		const postQuery = db.query.postsTable.findFirst({
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
					where: isNull(commentsTable.deleted_at),
					with: {
						user: true,
					},
				},
			},
		});

		const [currentUser, post] = await Promise.all([currentUserQuery, postQuery]);
		if (!currentUser) {
			return notFound();
		}
		if (!post) {
			return notFound();
		}

		// Load other post things
		let children: Post[] = [];
		let article: Article | undefined;
		let event: Event | undefined;

		const loadChildren = async () => {
			if (post.child_count) {
				children = await db.query.postsTable.findMany({
					where: and(eq(postsTable.parent_id, post.id), isNull(postsTable.deleted_at)),
				});
			}
		};

		const loadArticle = async () => {
			if (post.article_id) {
				article = await db.query.articlesTable.findFirst({
					where: eq(articlesTable.id, post.article_id),
				});
			}
		};

		const loadEvent = async () => {
			if (post.event_id) {
				event = await db.query.eventsTable.findFirst({
					where: eq(eventsTable.id, post.event_id),
				});
			}
		};

		await Promise.all([loadChildren(), loadArticle(), loadEvent()]);

		// Create the view
		let parentComments = post.comments.filter((c) => c.parent_id === null);
		let childComments = post.comments.filter((c) => c.parent_id !== null);
		const view: PostViewModel = {
			slug: post.slug,
			text: micromark(post.text),
			image: post.image,
			imageAltText: post.image_alt_text,
			isArticle: post.link_type === ARTICLE_LINK_TYPE,
			articleText: article?.text ?? null,
			isEvent: post.link_type === EVENT_LINK_TYPE,
			eventText: event?.text ?? null,
			eventLocation: event?.location ?? null,
			eventStartsAt: event?.starts_at ?? null,
			eventDuration: event?.duration ?? null,
			linkUrl:
				post.link_type === ARTICLE_LINK_TYPE
					? `${ensureSlash(currentUser.url)}articles/${post.slug}`
					: post.link_type === EVENT_LINK_TYPE
						? `${ensureSlash(currentUser.url)}events/${post.slug}`
						: post.link_url,
			linkTitle: post.link_title,
			linkImage: post.link_image,
			linkPublication: post.link_type === LINK_LINK_TYPE ? post.link_publication : currentUser.name,
			linkEmbedSrc: post.link_embed_src,
			linkEmbedWidth: post.link_embed_width,
			linkEmbedHeight: post.link_embed_height,
			ratingValue: post.rating_value,
			ratingBound: post.rating_bound,
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
			childCount: post.child_count,
			children: children.map((c) => ({
				text: micromark(c.text),
				image: c.image,
				imageAltText: c.image_alt_text,
				linkUrl: c.link_url,
				linkTitle: c.link_title,
				linkImage: c.link_image,
				linkPublication: c.link_publication,
				linkEmbedSrc: c.link_embed_src,
				linkEmbedWidth: c.link_embed_width,
				linkEmbedHeight: c.link_embed_height,
				ratingValue: c.rating_value,
				ratingBound: c.rating_bound,
				publishedAt: c.published_at ?? c.created_at,
			})),
			publishedAt: post.published_at ?? post.created_at,
			republishedAt: post.republished_at,
			tags: post.postTags.map((pt) => ({ slug: pt.tag.slug, text: pt.tag.text })),
			comments: parentComments.map((c) => commentPreview(c, currentUser, childComments)),
		};

		return ok({ post: view });
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
