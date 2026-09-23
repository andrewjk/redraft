import type FollowedByPreviewModel from "./FollowedByPreviewModel";

export default interface BlockedListModel {
	blocked: FollowedByPreviewModel[];
	blockedCount: number;
}
