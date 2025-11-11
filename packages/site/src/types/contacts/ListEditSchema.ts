import * as v from "valibot";

v.setGlobalConfig({ abortPipeEarly: true });

const ListEditSchema = v.object({
	id: v.number(),
	name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	description: v.pipe(v.string(), v.trim()),
	users: v.array(
		v.object({
			id: v.number(),
			url: v.pipe(v.string(), v.trim(), v.url()),
			name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
			image: v.pipe(v.string(), v.trim()),
			included: v.optional(v.boolean()),
		}),
	),
});

export default ListEditSchema;
