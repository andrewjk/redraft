//import profileView from "./profileView";
import { type Post } from "@/data/schema/postsTable";
import { type User } from "@/data/schema/usersTable";

export type PostPreview = {
	slug: string;
	text: string;
	author: {
		name: string;
		image: string;
		url: string;
	};
	createdAt: Date;
	updatedAt: Date;
	commentCount: number;
};

export default function postPreview(
	post: Post & {
		user?: {
			name: string;
			image: string;
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
					name: post.user.name,
					image: post.user.image,
					url: post.user.url,
				}
			: {
					name: currentUser.name,
					image: currentUser.image,
					url: currentUser.url,
				},
		createdAt: post.created_at,
		updatedAt: post.updated_at,
		commentCount: post.comment_count,
	};
}
