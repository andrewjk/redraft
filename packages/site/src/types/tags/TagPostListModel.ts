import type PostPreviewModel from "../posts/PostPreviewModel";

export default interface TagPostListModel {
	tag: { slug: string; text: string };
	posts: PostPreviewModel[];
	postsCount: number;
}
