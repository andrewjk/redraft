import * as v from "valibot";

v.setGlobalConfig({ abortPipeEarly: true });

const CommentCreateSchema = v.object({
	postSlug: v.string(),
	parentSlug: v.optional(v.string()),
	text: v.pipe(v.string(), v.trim(), v.nonEmpty()),
});

export default CommentCreateSchema;
