import type PostFailureModel from "./PostFailureModel";
import type PostPreviewModel from "./PostPreviewModel";

export default interface PostStatusModel {
	id: number;
	post: PostPreviewModel;
	failed: PostFailureModel[];
}
