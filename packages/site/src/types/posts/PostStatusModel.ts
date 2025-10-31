import type PostPreviewModel from "./PostPreviewModel";

export default interface PostStatusModel {
	id: number;
	post: PostPreviewModel;
	failed: {
		url: string;
		name: string;
		image: string;
	}[];
}
