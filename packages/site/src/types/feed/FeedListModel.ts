import type FeedPreviewModel from "./FeedPreviewModel";

export default interface FeedListModel {
	feed: FeedPreviewModel[];
	feedCount: number;
}
