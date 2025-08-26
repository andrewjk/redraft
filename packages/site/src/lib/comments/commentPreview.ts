//import profileView from "./profileView";
import { type Comment } from "../../data/schema/commentsTable";

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
	children: CommentPreview[];
};

type CommentWithUser = Comment & {
	user?: CommentAuthor | null;
};

export default function commentPreview(
	comment: CommentWithUser,
	currentUser: CommentAuthor,
	childComments: CommentWithUser[],
): CommentPreview {
	return {
		slug: comment.slug,
		text: comment.text,
		author: comment.user
			? {
					image: comment.user.image + "?w=80",
					name: comment.user.name,
					url: comment.user.url,
				}
			: {
					image: currentUser.image + "?w=80",
					name: currentUser.name,
					url: currentUser.url,
				},
		createdAt: comment.created_at,
		updatedAt: comment.updated_at,
		children: childComments
			.filter((c) => c.parent_id === comment.id)
			.map((c) => commentPreview(c, currentUser, [])),
	};
}
