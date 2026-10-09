import type PostAuthorModel from "./PostAuthorModel";

export default interface PostPreviewModel {
	slug: string;
	text: string;
	author: PostAuthorModel;
	pinned: boolean;
	publishedAt: Date;
	republishedAt: Date | null | undefined;
	childCount: number;
	commentCount: number;
	likeCount: number;
	emojiFirst: string | null | undefined;
	emojiSecond: string | null | undefined;
	emojiThird: string | null | undefined;
	visibility: number;
	image: string | null | undefined;
	imageAltText: string | null | undefined;
	/** The attachment at `image` is a file, not an image */
	isFile: boolean;
	isArticle: boolean;
	isEvent: boolean;
	linkUrl: string | null | undefined;
	linkImage: string | null | undefined;
	linkTitle: string | null | undefined;
	linkPublication: string | null | undefined;
	linkEmbedSrc: string | null | undefined;
	linkEmbedWidth: number | null | undefined;
	linkEmbedHeight: number | null | undefined;
	ratingValue: number | null | undefined;
	ratingBound: number | null | undefined;
	tags: {
		slug: string;
		text: string;
	}[];
}
