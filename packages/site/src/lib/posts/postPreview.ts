import { micromark } from "micromark";
import { type Post } from "../../data/schema/postsTable";
import { Tag } from "../../data/schema/tagsTable";
import { type User } from "../../data/schema/usersTable";
import { ARTICLE_LINK_TYPE, EVENT_LINK_TYPE, LINK_LINK_TYPE } from "../constants";
import ensureSlash from "../utils/ensureSlash";

type PostAuthor = {
	name: string;
	image: string;
	url: string;
};

export type PostPreview = {
	slug: string;
	text: string;
	author: PostAuthor;
	pinned: boolean;
	publishedAt: Date;
	republishedAt: Date | null;
	childCount: number;
	commentCount: number;
	likeCount: number;
	emojiFirst: string | null;
	emojiSecond: string | null;
	emojiThird: string | null;
	visibility: number;
	image: string | null;
	imageAltText: string | null;
	isArticle: boolean;
	isEvent: boolean;
	linkUrl: string | null;
	linkImage: string | null;
	linkTitle: string | null;
	linkPublication: string | null;
	linkEmbedSrc: string | null;
	linkEmbedWidth: number | null;
	linkEmbedHeight: number | null;
	ratingValue: number | null;
	ratingBound: number | null;
	tags: {
		slug: string;
		text: string;
	}[];
};

export default function postPreview(
	post: Post & { user?: PostAuthor | null; postTags: { tag: Tag }[] },
	currentUser: User,
): PostPreview {
	return {
		slug: post.slug,
		text: micromark(post.text),
		author: post.user
			? {
					name: post.user.name,
					image: post.user.image + "?w=80",
					url: post.user.url,
				}
			: {
					name: currentUser.name,
					image: currentUser.image + "?w=80",
					url: currentUser.url,
				},
		pinned: post.pinned,
		publishedAt: post.published_at ?? post.updated_at,
		republishedAt: post.republished_at,
		childCount: post.child_count,
		commentCount: post.comment_count,
		likeCount: post.like_count,
		emojiFirst: post.emoji_first,
		emojiSecond: post.emoji_second,
		emojiThird: post.emoji_third,
		visibility: post.visibility,
		image: post.image,
		imageAltText: post.image_alt_text,
		isArticle: post.link_type === ARTICLE_LINK_TYPE,
		isEvent: post.link_type === EVENT_LINK_TYPE,
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
		tags: post.postTags.map((pt) => ({
			slug: pt.tag.slug,
			text: pt.tag.text,
		})),
	};
}
