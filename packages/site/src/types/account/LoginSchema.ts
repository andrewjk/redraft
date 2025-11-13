import * as v from "valibot";
import optionalFormValue from "../optionalFormValue";
import type LoginModel from "./LoginModel";

// TODO: Find a better place to put this
v.setGlobalConfig({ abortPipeEarly: true });

const LoginSchema: v.GenericSchema<unknown, LoginModel> = v.object({
	email: v.pipe(v.string(), v.trim(), v.nonEmpty("Email is required"), v.email("Email is invalid")),
	password: v.pipe(v.string(), v.trim(), v.minLength(6, "Password must be at least 6 characters")),
	rememberMe: optionalFormValue(v.boolean()),
});

export default LoginSchema;
