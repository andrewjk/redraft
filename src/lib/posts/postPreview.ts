//import profileView from "./profileView";
import { type Post } from "@/data/schema/postsTable";
import { type User } from "@/data/schema/usersTable";

export type PostPreview = {
	slug: string;
	text: string;
	author: {
		image: string;
		username: string;
		url: string;
	};
	createdAt: Date;
	updatedAt: Date;
	commentCount: number;
};

export default function postPreview(
	post: Post & {
		user?: {
			image: string;
			username: string;
			url: string;
		} | null;
		//commentCount?: number;
	},
	currentUser: User,
): PostPreview {
	return {
		slug: post.slug,
		text: post.text,
		author: post.user
			? {
					image: post.user.image,
					username: post.user.username,
					url: post.user.url,
				}
			: {
					image: currentUser.image,
					username: currentUser.username,
					url: currentUser.url,
				},
		createdAt: post.created_at,
		updatedAt: post.updated_at,
		commentCount: post.comment_count,
	};
}
