import type CommentPreviewModel from "../comments/CommentPreviewModel";
import type PostAuthorModel from "./PostAuthorModel";

export default interface PostViewModel {
	slug: string;
	text: string;
	//visibility: number;
	image: string | null | undefined;
	imageAltText: string | null | undefined;
	isArticle: boolean;
	articleText: string | null | undefined;
	isEvent: boolean;
	eventText: string | null | undefined;
	eventLocation: string | null | undefined;
	eventStartsAt: Date | null | undefined;
	eventDuration: number | null | undefined;
	linkUrl: string | null | undefined;
	linkTitle: string | null | undefined;
	linkImage: string | null | undefined;
	linkPublication: string | null | undefined;
	linkEmbedSrc: string | null | undefined;
	linkEmbedWidth: number | null | undefined;
	linkEmbedHeight: number | null | undefined;
	ratingValue: number | null | undefined;
	ratingBound: number | null | undefined;
	author: PostAuthorModel;
	commentCount: number;
	likeCount: number;
	emojiFirst: string | null | undefined;
	emojiSecond: string | null | undefined;
	emojiThird: string | null | undefined;
	childCount: number;
	children: {
		text: string;
		//visibility: number;
		image: string | null | undefined;
		imageAltText: string | null | undefined;
		linkUrl: string | null | undefined;
		linkTitle: string | null | undefined;
		linkImage: string | null | undefined;
		linkPublication: string | null | undefined;
		linkEmbedSrc: string | null | undefined;
		linkEmbedWidth: number | null | undefined;
		linkEmbedHeight: number | null | undefined;
		ratingValue: number | null | undefined;
		ratingBound: number | null | undefined;
	}[];
	publishedAt: Date;
	republishedAt: Date | null | undefined;
	tags: {
		slug: string;
		text: string;
	}[];
	comments: CommentPreviewModel[];
}
