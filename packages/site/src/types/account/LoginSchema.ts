import * as v from "valibot";

// TODO: Find a better place to put this
v.setGlobalConfig({ abortPipeEarly: true });

const LoginSchema = v.object({
	email: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1, "Email is required"),
		v.email("Email is invalid"),
	),
	password: v.pipe(v.string(), v.trim(), v.minLength(6, "Password must be at least 8 characters")),
	rememberMe: v.optional(v.boolean()),
});

export default LoginSchema;
