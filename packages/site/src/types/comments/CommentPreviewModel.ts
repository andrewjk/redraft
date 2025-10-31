import type CommentAuthorModel from "./CommentAuthorModel";

export default interface CommentPreviewModel {
	slug: string;
	text: string;
	author: CommentAuthorModel;
	createdAt: Date;
	updatedAt: Date;
	// TODO: commentCount: number;
	children: CommentPreviewModel[];
}
