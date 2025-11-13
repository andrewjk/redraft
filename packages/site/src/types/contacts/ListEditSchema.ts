import * as v from "valibot";
import optionalFormValue from "../optionalFormValue";
import type ListEditModel from "./ListEditModel";

v.setGlobalConfig({ abortPipeEarly: true });

const ListEditSchema: v.GenericSchema<unknown, ListEditModel> = v.object({
	id: v.number(),
	name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	description: v.pipe(v.string(), v.trim()),
	users: v.array(
		v.object({
			id: v.number(),
			url: v.pipe(v.string(), v.trim(), v.url()),
			name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
			image: v.pipe(v.string(), v.trim()),
			included: optionalFormValue(v.boolean()),
		}),
	),
});

export default ListEditSchema;
