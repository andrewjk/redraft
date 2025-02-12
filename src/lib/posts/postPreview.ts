//import profileView from "./profileView";
import { type Feed } from "@/data/schema/feedTable";
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
	createdAt: Date;
	updatedAt: Date;
	commentCount: number;
};

export default function postPreview(
	post: (Post & { user?: PostAuthor | null }) | (Feed & { user?: PostAuthor | null }),
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
		// @ts-ignore
		pinned: !!post.pinned,
		createdAt: post.created_at,
		updatedAt: post.updated_at,
		commentCount: post.comment_count,
	};
}
