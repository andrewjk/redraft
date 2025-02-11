//import profileView from "./profileView";
import { type Comment, type User } from "@/data/schema";

export type CommentPreview = {
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

export default function commentPreview(
	comment: Comment & {
		user?: {
			image: string;
			username: string;
			url: string;
		} | null;
		commentCount?: number;
	},
	currentUser: User,
): CommentPreview {
	return {
		slug: comment.slug,
		text: comment.text,
		author: comment.user
			? {
					image: comment.user.image,
					username: comment.user.username,
					url: comment.user.url,
				}
			: {
					image: currentUser.image,
					username: currentUser.username,
					url: process.env.SITE_LOCATION!,
				},
		createdAt: comment.created_at,
		updatedAt: comment.updated_at,
		commentCount: comment.commentCount ?? 0,
	};
}
