import { notFound, ok, serverError } from "@torpor/build/response";
import { and, eq, isNull, or } from "drizzle-orm";
import database from "../../data/database";
import { commentsTable, postsTable } from "../../data/schema";
import { Post } from "../../data/schema/postsTable";
import { User } from "../../data/schema/usersTable";
import commentPreview, { CommentPreview } from "../comments/commentPreview";
import { FOLLOWER_POST_VISIBILITY, PUBLIC_POST_VISIBILITY } from "../constants";
import ensureSlash from "../utils/ensureSlash";
import getErrorMessage from "../utils/getErrorMessage";

interface PostViewModel {
	slug: string;
	text: string;
	//visibility: number;
	image: string | null;
	imageAltText: string | null;
	isArticle: boolean;
	articleText: string | null;
	linkUrl: string | null;
	linkTitle: string | null;
	linkImage: string | null;
	linkPublication: string | null;
	linkEmbedSrc: string | null;
	linkEmbedWidth: number | null;
	linkEmbedHeight: number | null;
	author: {
		image: string;
		name: string;
		url: string;
	};
	commentCount: number;
	likeCount: number;
	emojiFirst: string | null;
	emojiSecond: string | null;
	emojiThird: string | null;
	childCount: number;
	children: {
		text: string;
		//visibility: number;
		image: string | null;
		imageAltText: string | null;
		linkUrl: string | null;
		linkTitle: string | null;
		linkImage: string | null;
		linkPublication: string | null;
		linkEmbedSrc: string | null;
		linkEmbedWidth: number | null;
		linkEmbedHeight: number | null;
	}[];
	publishedAt: Date;
	republishedAt: Date | null;
	tags: {
		slug: string;
		text: string;
	}[];
	comments: CommentPreview[];
}

export default async function postGet(user: User, follower: User, slug: string) {
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

				// If it has children, get them
				let children: Post[] = [];
				if (post.child_count) {
					children = await tx.query.postsTable.findMany({
						where: and(eq(postsTable.parent_id, post.id), isNull(postsTable.deleted_at)),
					});
				}

				// Create the view
				let parentComments = post.comments.filter((c) => c.parent_id === null);
				let childComments = post.comments.filter((c) => c.parent_id !== null);
				const view: PostViewModel = {
					slug: post.slug,
					text: post.text,
					image: post.image,
					imageAltText: post.image_alt_text,
					isArticle: post.is_article,
					articleText: "",
					linkUrl: post.is_article
						? `${ensureSlash(currentUser.url)}articles/${post.slug}`
						: post.link_url,
					linkTitle: post.link_title,
					linkImage: post.link_image,
					linkPublication: post.is_article ? currentUser.name : post.link_publication,
					linkEmbedSrc: post.link_embed_src,
					linkEmbedWidth: post.link_embed_width,
					linkEmbedHeight: post.link_embed_height,
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
						text: c.text,
						image: c.image,
						imageAltText: c.image_alt_text,
						linkUrl: c.link_url,
						linkTitle: c.link_title,
						linkImage: c.link_image,
						linkPublication: c.link_publication,
						linkEmbedSrc: c.link_embed_src,
						linkEmbedWidth: c.link_embed_width,
						linkEmbedHeight: c.link_embed_height,
						publishedAt: c.published_at ?? c.created_at,
					})),
					publishedAt: post.published_at ?? post.created_at,
					republishedAt: post.republished_at,
					tags: post.postTags.map((pt) => ({ slug: pt.tag.slug, text: pt.tag.text })),
					comments: parentComments.map((c) => commentPreview(c, currentUser, childComments)),
				};

				return ok(view);
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
