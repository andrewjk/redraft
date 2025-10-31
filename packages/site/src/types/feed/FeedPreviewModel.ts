import type FeedAuthorModel from "./FeedAuthorModel";

export default interface FeedPreviewModel {
	slug: string;
	text: string;
	author: FeedAuthorModel;
	liked: boolean;
	saved: boolean;
	emoji: string | null;
	publishedAt: Date;
	republishedAt: Date | null;
	childCount: number;
	commentCount: number;
	visibility: number;
	image: string | null;
	imageAltText: string | null;
	isArticle: boolean;
	isEvent: boolean;
	linkUrl: string | null;
	linkTitle: string | null;
	linkImage: string | null;
	linkPublication: string | null;
	linkEmbedSrc: string | null;
	linkEmbedWidth: number | null;
	linkEmbedHeight: number | null;
	ratingValue: number | null;
	ratingBound: number | null;
}
