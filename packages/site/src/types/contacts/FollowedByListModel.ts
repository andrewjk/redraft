import type FollowedByPreviewModel from "./FollowedByPreviewModel";

export default interface FollowedByListModel {
	followedBy: FollowedByPreviewModel[];
	followedByCount: number;
}
