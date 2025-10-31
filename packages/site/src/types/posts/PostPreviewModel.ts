import type PostAuthorModel from "./PostAuthorModel";

export default interface PostPreviewModel {
	slug: string;
	text: string;
	author: PostAuthorModel;
	pinned: boolean;
	publishedAt: Date;
	republishedAt: Date | null;
	childCount: number;
	commentCount: number;
	likeCount: number;
	emojiFirst: string | null;
	emojiSecond: string | null;
	emojiThird: string | null;
	visibility: number;
	image: string | null;
	imageAltText: string | null;
	isArticle: boolean;
	isEvent: boolean;
	linkUrl: string | null;
	linkImage: string | null;
	linkTitle: string | null;
	linkPublication: string | null;
	linkEmbedSrc: string | null;
	linkEmbedWidth: number | null;
	linkEmbedHeight: number | null;
	ratingValue: number | null;
	ratingBound: number | null;
	tags: {
		slug: string;
		text: string;
	}[];
}
