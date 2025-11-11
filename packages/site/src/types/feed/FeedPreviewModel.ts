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
	isArticle: boolean;
	isEvent: boolean;
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
