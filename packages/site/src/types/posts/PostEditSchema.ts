import * as v from "valibot";
import optionalFormValue from "../optionalFormValue";
import type PostEditModel from "./PostEditModel";

v.setGlobalConfig({ abortPipeEarly: true });

const PostEditSchema: v.GenericSchema<unknown, PostEditModel> = v.pipe(
	v.object({
		id: v.number(),
		published: optionalFormValue(v.boolean()),
		text: v.optional(v.string()),
		visibility: optionalFormValue(v.number()),
		listId: optionalFormValue(v.number()),
		hasImage: optionalFormValue(v.boolean()),
		image: v.optional(v.string()),
		imageAltText: v.optional(v.string()),
		isArticle: optionalFormValue(v.boolean()),
		articleId: optionalFormValue(v.number()),
		articleText: v.optional(v.string()),
		isEvent: optionalFormValue(v.boolean()),
		eventId: optionalFormValue(v.number()),
		eventText: v.optional(v.string()),
		eventLocation: v.optional(v.string()),
		eventStartsAt: v.optional(v.date()),
		eventDuration: optionalFormValue(v.number()),
		hasLink: optionalFormValue(v.boolean()),
		linkUrl: v.optional(v.string()),
		linkTitle: v.optional(v.string()),
		linkImage: v.optional(v.string()),
		linkPublication: v.optional(v.string()),
		linkEmbedSrc: v.optional(v.string()),
		linkEmbedWidth: optionalFormValue(v.number()),
		linkEmbedHeight: optionalFormValue(v.number()),
		hasRating: optionalFormValue(v.boolean()),
		ratingValue: optionalFormValue(v.number()),
		ratingBound: optionalFormValue(v.number()),
		children: v.optional(v.lazy(() => v.array(PostEditSchema))),
		tags: v.optional(v.string()),

		imagefile: v.nullish(v.union([v.string(), v.instance(ArrayBuffer), v.instance(File)])),
		linkimagefile: v.nullish(v.union([v.string(), v.instance(ArrayBuffer), v.instance(File)])),
	}),
	v.forward(
		// Unless there's an image, article, event, image or rating, text is required
		v.check(
			(o) =>
				o.hasImage === true ||
				o.isArticle === true ||
				o.isEvent === true ||
				o.hasRating === true ||
				(typeof o.text === "string" && o.text.length > 0),
			"Text is required",
		),
		["text"],
	),
);

export default PostEditSchema;
