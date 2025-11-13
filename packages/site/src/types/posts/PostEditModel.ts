export default interface PostEditModel {
	id: number;
	published?: boolean;
	text: string;
	visibility?: number;
	listId?: number;
	hasImage?: boolean;
	image?: string;
	imageAltText?: string;
	isArticle?: boolean;
	articleId?: number;
	articleText?: string;
	isEvent?: boolean;
	eventId?: number;
	eventText?: string;
	eventLocation?: string;
	eventStartsAt?: Date;
	eventDuration?: number;
	hasLink?: boolean;
	linkUrl?: string;
	linkTitle?: string;
	linkImage?: string;
	linkPublication?: string;
	linkEmbedSrc?: string;
	linkEmbedWidth?: number;
	linkEmbedHeight?: number;
	hasRating?: boolean;
	ratingValue?: number;
	ratingBound?: number;
	children?: PostEditModel[];
	tags?: string;

	imagefile?: string | ArrayBuffer | File | null;
	linkimagefile?: string | ArrayBuffer | File | null;
}
