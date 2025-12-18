import * as v from "valibot";
import type ExportModel from "./ExportModel";

v.setGlobalConfig({ abortPipeEarly: true });

const ExportSchema: v.GenericSchema<unknown, ExportModel> = v.object({
	password: v.pipe(v.string(), v.trim(), v.minLength(8, "Password must be at least 8 characters")),
});

export default ExportSchema;
