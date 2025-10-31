// IMPORTANT! Update this when the model changes
export const COMMENT_RECEIVED_VERSION = 1;

export default interface CommentReceivedModel {
	sharedKey: string;
	slug: string;
	commentCount: number;
	lastCommentAt: Date;
	version: number;
}
