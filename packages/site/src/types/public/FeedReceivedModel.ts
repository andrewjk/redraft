// IMPORTANT! Update this when the model changes
export const FEED_RECEIVED_VERSION = 4;

export default interface FeedReceivedModel {
	sharedKey: string;
	slug: string;
	text: string;
	visibility: number;
	image: string | null | undefined;
	imageAltText: string | null | undefined;
	linkType: number | null | undefined;
	linkUrl: string | null | undefined;
	linkTitle: string | null | undefined;
	linkImage: string | null | undefined;
	linkPublication: string | null | undefined;
	linkEmbedSrc: string | null | undefined;
	linkEmbedWidth: number | null | undefined;
	linkEmbedHeight: number | null | undefined;
	ratingValue: number | null | undefined;
	ratingBound: number | null | undefined;
	childCount: number | null | undefined;
	publishedAt: Date;
	republishedAt: Date | null | undefined;
	version: number;
}
