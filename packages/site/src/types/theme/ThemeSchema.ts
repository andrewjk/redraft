import * as v from "valibot";
import { isValidThemeValue } from "../../lib/theme/theme";
import { THEME_VARIABLES } from "../../lib/theme/themeVariables";
import type { ThemeModel } from "./ThemeModel";

const entries: Record<string, v.GenericSchema<unknown, string>> = {};
for (const variable of THEME_VARIABLES) {
	entries[variable.name] = v.pipe(
		v.string(),
		v.trim(),
		v.check(
			(value) => isValidThemeValue(variable, value),
			`Invalid value for ${variable.label.toLowerCase()}`,
		),
	);
}

/** Validates a single palette (light or dark). Only whitelisted variables */
const ThemeSchema = v.object(
	Object.fromEntries(Object.entries(entries).map(([name, schema]) => [name, v.optional(schema)])),
) as unknown as v.GenericSchema<unknown, ThemeModel>;

export interface ThemeEditModel {
	light?: ThemeModel;
	dark?: ThemeModel;
}

/**
 * Validates a submitted appearance edit. Invalid values are rejected (rather
 * than silently dropped) so the appearance form can show an error.
 */
export const ThemeEditSchema = v.object({
	light: v.optional(ThemeSchema),
	dark: v.optional(ThemeSchema),
}) as unknown as v.GenericSchema<unknown, ThemeEditModel>;

export default ThemeSchema;
