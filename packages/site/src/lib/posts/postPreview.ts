import { micromark } from "micromark";
import { type Post } from "../../data/schema/postsTable";
import { type User } from "../../data/schema/usersTable";
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
	commentCount: number;
	likeCount: number;
	emojiFirst: string | null;
	emojiSecond: string | null;
	emojiThird: string | null;
	visibility: number;
	image: string | null;
	isArticle: boolean;
	linkUrl: string | null;
	linkImage: string | null;
	linkTitle: string | null;
	linkPublication: string | null;
};

export default function postPreview(
	post: Post & { user?: PostAuthor | null },
	currentUser: User,
): PostPreview {
	return {
		slug: post.slug,
		text: micromark(post.text),
		author: post.user
			? {
					name: post.user.name,
					image: post.user.image,
					url: post.user.url,
				}
			: {
					name: currentUser.name,
					image: currentUser.image,
					url: currentUser.url,
				},
		pinned: post.pinned,
		publishedAt: post.published_at ?? post.updated_at,
		republishedAt: post.republished_at,
		commentCount: post.comment_count,
		likeCount: post.like_count,
		emojiFirst: post.emoji_first,
		emojiSecond: post.emoji_second,
		emojiThird: post.emoji_third,
		visibility: post.visibility,
		image: post.image,
		isArticle: post.is_article,
		linkUrl: post.is_article
			? `${ensureSlash(currentUser.url)}articles/${post.slug}`
			: post.link_url,
		linkTitle: post.link_title,
		linkImage: post.link_image,
		linkPublication: post.is_article ? currentUser.name : post.link_publication,
	};
}
