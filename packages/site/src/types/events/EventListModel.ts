import type PostPreviewModel from "../posts/PostPreviewModel";

export default interface EventListModel {
	posts: PostPreviewModel[];
	postsCount: number;
}
