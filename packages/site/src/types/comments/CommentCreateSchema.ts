import * as v from "valibot";
import type CommentCreateModel from "./CommentCreateModel";

v.setGlobalConfig({ abortPipeEarly: true });

const CommentCreateSchema: v.GenericSchema<unknown, CommentCreateModel> = v.object({
	postSlug: v.string(),
	parentSlug: v.optional(v.string()),
	text: v.pipe(v.string(), v.trim(), v.nonEmpty()),
});

export default CommentCreateSchema;
