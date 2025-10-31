// IMPORTANT! Update this when the model changes
export const FEED_RECEIVED_VERSION = 3;

export default interface FeedReceivedModel {
	sharedKey: string;
	slug: string;
	text: string;
	visibility: number;
	image: string | null;
	imageAltText: string | null;
	linkType: number | null;
	linkUrl: string | null;
	linkTitle: string | null;
	linkImage: string | null;
	linkPublication: string | null;
	linkEmbedSrc: string | null;
	linkEmbedWidth: number | null;
	linkEmbedHeight: number | null;
	ratingValue: number | null;
	ratingBound: number | null;
	publishedAt: Date;
	republishedAt: Date | null;
	version: number;
}
