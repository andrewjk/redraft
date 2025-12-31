// IMPORTANT! Update this when the model changes
export const FEED_DELETED_VERSION = 1;

export default interface FeedDeletedModel {
	sharedKey: string;
	slug: string;
	version: number;
}
