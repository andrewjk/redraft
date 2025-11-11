import * as v from "valibot";

v.setGlobalConfig({ abortPipeEarly: true });

const SetupSchema = v.object({
	username: v.pipe(v.string(), v.trim(), v.nonEmpty("Username is required")),
	password: v.pipe(v.string(), v.trim(), v.minLength(8, "Password must be at least 8 characters")),
	name: v.pipe(v.string(), v.trim(), v.nonEmpty("Name is required")),
	email: v.pipe(v.string(), v.trim(), v.nonEmpty("Email is required"), v.email("Email is invalid")),
	image: v.pipe(v.string()),
	imagefile: v.optional(v.string()),
	bio: v.pipe(v.string()),
	location: v.pipe(v.string()),
});

export default SetupSchema;
