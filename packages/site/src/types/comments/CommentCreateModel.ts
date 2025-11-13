export default interface CommentCreateModel {
	postSlug: string;
	parentSlug?: string;
	text: string;
}
