import { $watch } from "@torpor/view";
import { PUBLIC_POST_VISIBILITY } from "../lib/constants";
import type PostEditModel from "../types/posts/PostEditModel";

/**
 * The shared data for a post that is being written, so that we can keep it across pages
 */
const $postInput = $watch({
	id: -1,
	published: false,
	text: "",
	visibility: PUBLIC_POST_VISIBILITY,
	listId: null,
	hasImage: false,
	image: null,
	imageAltText: null,
	isArticle: false,
	articleId: null,
	articleText: null,
	isEvent: false,
	eventId: null,
	eventText: null,
	eventLocation: null,
	eventStartsAt: null,
	eventDuration: null,
	hasLink: false,
	linkUrl: null,
	linkTitle: null,
	linkImage: null,
	linkPublication: null,
	linkEmbedSrc: null,
	linkEmbedWidth: null,
	linkEmbedHeight: null,
	hasRating: false,
	ratingValue: null,
	ratingBound: null,
	children: [],
} satisfies PostEditModel);

export default $postInput;
