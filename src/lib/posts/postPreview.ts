import { type Post } from "@/data/schema/postsTable";
import { type User } from "@/data/schema/usersTable";

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
	type: number;
	image: string | null;
	url: string | null;
	title: string | null;
	publication: string | null;
};

export default function postPreview(
	post: Post & { user?: PostAuthor | null },
	currentUser: User,
): PostPreview {
	return {
		slug: post.slug,
		text: post.text,
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
		type: post.type,
		image: post.image,
		url: post.url,
		title: post.title,
		publication: post.publication,
	};
}
