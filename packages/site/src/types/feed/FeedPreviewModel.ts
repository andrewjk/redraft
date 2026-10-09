import type FeedAuthorModel from "./FeedAuthorModel";

export default interface FeedPreviewModel {
	slug: string;
	text: string;
	author: FeedAuthorModel;
	liked: boolean;
	saved: boolean;
	emoji: string | null | undefined;
	publishedAt: Date;
	republishedAt: Date | null | undefined;
	childCount: number;
	commentCount: number;
	visibility: number;
	image: string | null | undefined;
	imageAltText: string | null | undefined;
	/** The attachment at `image` is a file, not an image */
	isFile: boolean;
	isArticle: boolean;
	isEvent: boolean;
	eventStartsAt: Date | null | undefined;
	eventLocation: string | null | undefined;
	eventDuration: number | null | undefined;
	eventRsvpEnabled: boolean;
	eventRsvpLimit: number | null | undefined;
	eventRsvpDeadline: Date | null | undefined;
	linkUrl: string | null | undefined;
	linkTitle: string | null | undefined;
	linkImage: string | null | undefined;
	linkPublication: string | null | undefined;
	linkEmbedSrc: string | null | undefined;
	linkEmbedWidth: number | null | undefined;
	linkEmbedHeight: number | null | undefined;
	ratingValue: number | null | undefined;
	ratingBound: number | null | undefined;
}
