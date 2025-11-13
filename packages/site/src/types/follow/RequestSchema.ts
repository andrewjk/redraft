import * as v from "valibot";
import type RequestModel from "./RequestModel";

v.setGlobalConfig({ abortPipeEarly: true });

const RequestSchema: v.GenericSchema<RequestModel> = v.object({
	url: v.pipe(v.string(), v.trim(), v.url()),
});

export default RequestSchema;
