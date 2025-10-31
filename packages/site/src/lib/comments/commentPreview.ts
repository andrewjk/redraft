//import profileView from "./profileView";
import { type Comment } from "../../data/schema/commentsTable";
import type CommentAuthorModel from "../../types/comments/CommentAuthorModel";
import type CommentPreviewModel from "../../types/comments/CommentPreviewModel";

type CommentWithUser = Comment & {
	user?: CommentAuthorModel | null;
};

export default function commentPreview(
	comment: CommentWithUser,
	currentUser: CommentAuthorModel,
	childComments: CommentWithUser[],
): CommentPreviewModel {
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
		children: childComments
			.filter((c) => c.parent_id === comment.id)
			.map((c) => commentPreview(c, currentUser, [])),
	};
}
