import type FollowingPreviewModel from "./FollowingPreviewModel";

export default interface FollowingListModel {
	following: FollowingPreviewModel[];
	followingCount: number;
}
