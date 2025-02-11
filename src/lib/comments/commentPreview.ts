//import profileView from "./profileView";
import { type Comment } from "@/data/schema/commentsTable";
import { type User } from "@/data/schema/usersTable";

type CommentAuthor = {
	image: string;
	name: string;
	url: string;
};

export type CommentPreview = {
	slug: string;
	text: string;
	author: CommentAuthor;
	createdAt: Date;
	updatedAt: Date;
	// TODO: commentCount: number;
};

export default function commentPreview(
	comment: Comment & {
		user?: User;
	},
	currentUser: CommentAuthor,
): CommentPreview {
	return {
		slug: comment.slug,
		text: comment.text,
		author: comment.user
			? {
					image: comment.user.image,
					name: comment.user.name,
					url: comment.user.url,
				}
			: {
					image: currentUser.image,
					name: currentUser.name,
					url: currentUser.url,
				},
		createdAt: comment.created_at,
		updatedAt: comment.updated_at,
	};
}
