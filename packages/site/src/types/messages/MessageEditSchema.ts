import * as v from "valibot";

v.setGlobalConfig({ abortPipeEarly: true });

const MessageEditSchema = v.object({
	groupSlug: v.string(),
	userSlug: v.string(),
	text: v.pipe(v.string(), v.trim(), v.nonEmpty()),
});

export default MessageEditSchema;
