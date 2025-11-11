import * as v from "valibot";

v.setGlobalConfig({ abortPipeEarly: true });

const RequestSchema = v.object({
	url: v.pipe(v.string(), v.trim(), v.url()),
});

export default RequestSchema;
