import type PostPreviewModel from "../posts/PostPreviewModel";

export default interface MediaListModel {
	posts: PostPreviewModel[];
	postsCount: number;
}
