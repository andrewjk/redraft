import * as v from "valibot";
import type MessageEditModel from "./MessageEditModel";

v.setGlobalConfig({ abortPipeEarly: true });

const MessageEditSchema: v.GenericSchema<MessageEditModel> = v.object({
	groupSlug: v.string(),
	userSlug: v.string(),
	text: v.pipe(v.string(), v.trim(), v.nonEmpty()),
});

export default MessageEditSchema;
