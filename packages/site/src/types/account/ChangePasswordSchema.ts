import * as v from "valibot";
import type ChangePasswordModel from "./ChangePasswordModel";

v.setGlobalConfig({ abortPipeEarly: true });

const ChangePasswordSchema: v.GenericSchema<unknown, ChangePasswordModel> = v.pipe(
	v.object({
		oldPassword: v.pipe(
			v.string(),
			v.trim(),
			v.minLength(8, "Password must be at least 8 characters"),
		),
		password: v.pipe(
			v.string(),
			v.trim(),
			v.minLength(8, "Password must be at least 8 characters"),
		),
		confirmPassword: v.pipe(
			v.string(),
			v.trim(),
			v.minLength(8, "Password must be at least 8 characters"),
		),
	}),
	v.forward(
		v.partialCheck(
			[["password"], ["confirmPassword"]],
			(input) => input.password === input.confirmPassword,
			"Confirm password doesn't match",
		),
		["confirmPassword"],
	),
);

export default ChangePasswordSchema;
