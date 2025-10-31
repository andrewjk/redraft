import type CommentPreviewModel from "../comments/CommentPreviewModel";
import type PostAuthorModel from "./PostAuthorModel";

export default interface PostViewModel {
	slug: string;
	text: string;
	//visibility: number;
	image: string | null;
	imageAltText: string | null;
	isArticle: boolean;
	articleText: string | null;
	isEvent: boolean;
	eventText: string | null;
	eventLocation: string | null;
	eventStartsAt: Date | null;
	eventDuration: number | null;
	linkUrl: string | null;
	linkTitle: string | null;
	linkImage: string | null;
	linkPublication: string | null;
	linkEmbedSrc: string | null;
	linkEmbedWidth: number | null;
	linkEmbedHeight: number | null;
	ratingValue: number | null;
	ratingBound: number | null;
	author: PostAuthorModel;
	commentCount: number;
	likeCount: number;
	emojiFirst: string | null;
	emojiSecond: string | null;
	emojiThird: string | null;
	childCount: number;
	children: {
		text: string;
		//visibility: number;
		image: string | null;
		imageAltText: string | null;
		linkUrl: string | null;
		linkTitle: string | null;
		linkImage: string | null;
		linkPublication: string | null;
		linkEmbedSrc: string | null;
		linkEmbedWidth: number | null;
		linkEmbedHeight: number | null;
		ratingValue: number | null;
		ratingBound: number | null;
	}[];
	publishedAt: Date;
	republishedAt: Date | null;
	tags: {
		slug: string;
		text: string;
	}[];
	comments: CommentPreviewModel[];
}
