import type FollowRequestPreviewModel from "./FollowRequestPreviewModel";

export default interface FollowRequestListModel {
	requests: FollowRequestPreviewModel[];
	requestCount: number;
}
