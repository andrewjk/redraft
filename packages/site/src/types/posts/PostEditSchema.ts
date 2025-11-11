import * as v from "valibot";

v.setGlobalConfig({ abortPipeEarly: true });

const PostEditSchema = v.object({
	id: v.number(),
	published: v.boolean(),
	text: v.pipe(v.string(), v.nonEmpty("Text is required")),
	visibility: v.number(),
	listId: v.nullish(v.number()),
	hasImage: v.boolean(),
	image: v.nullish(v.string()),
	imageAltText: v.nullish(v.string()),
	isArticle: v.boolean(),
	articleId: v.nullish(v.number()),
	articleText: v.nullish(v.string()),
	isEvent: v.boolean(),
	eventId: v.nullish(v.number()),
	eventText: v.nullish(v.string()),
	eventLocation: v.nullish(v.string()),
	eventStartsAt: v.nullish(v.date()),
	eventDuration: v.nullish(v.number()),
	hasLink: v.boolean(),
	linkUrl: v.nullish(v.string()),
	linkTitle: v.nullish(v.string()),
	linkImage: v.nullish(v.string()),
	linkPublication: v.nullish(v.string()),
	linkEmbedSrc: v.nullish(v.string()),
	linkEmbedWidth: v.nullish(v.number()),
	linkEmbedHeight: v.nullish(v.number()),
	hasRating: v.boolean(),
	ratingValue: v.nullish(v.number()),
	ratingBound: v.nullish(v.number()),
	children: v.lazy((): any => v.array(PostEditSchema)),
	tags: v.nullish(v.string()),

	imagefile: v.nullish(v.union([v.string(), v.instance(ArrayBuffer)])),
	linkimagefile: v.nullish(v.union([v.string(), v.instance(ArrayBuffer)])),
});

export default PostEditSchema;
