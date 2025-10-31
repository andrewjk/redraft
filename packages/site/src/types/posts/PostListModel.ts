import type PostPreviewModel from "./PostPreviewModel";

export default interface PostListModel {
	posts: PostPreviewModel[];
	postsCount: number;
}
