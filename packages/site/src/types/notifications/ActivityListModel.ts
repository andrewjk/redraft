import type ActivityPreviewModel from "./ActivityPreviewModel";

export default interface ActivityListModel {
	activity: ActivityPreviewModel[];
	activityCount: number;
}
