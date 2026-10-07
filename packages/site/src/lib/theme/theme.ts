import type { ThemeModel } from "../../types/theme/ThemeModel";
import { DARK_THEME_VARIABLES, THEME_VARIABLES, type ThemeVariableInfo } from "./themeVariables";

// Values are embedded in a <style> tag, so reject anything that could break
// out of the declaration or the tag, or load external resources
const UNSAFE = /[;{}<>\\@]|url\s*\(|expression\s*\(|var\s*\(|\/\*/i;
const COLOR_RE =
	/^(#[0-9a-f]{3,8}|[a-z]+|(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\([-0-9a-z.,%/\s]+\))$/i;
const LENGTH_RE = /^-?\d*\.?\d+(rem|em|px|%|vh|vw|vmin|vmax|ch|ex|pt|pc|in|cm|mm|q)?$/i;
// A font family list, e.g. `ui-sans-serif, sans-serif` or `"Source Sans 3", serif`
const FONT_RE = /^[a-z0-9\s,'"_-]+$/i;

const DOM_PROPERTY = {
	color: "color",
	length: "borderRadius",
	font: "fontFamily",
} as const satisfies Record<ThemeVariableInfo["type"], keyof CSSStyleDeclaration>;

let validationEl: HTMLElement | undefined;

/**
 * Asks the browser's CSS engine whether a value is valid, by assigning it to
 * a throwaway element (the browser ignores invalid assignments, leaving the
 * property empty). Returns `undefined` outside the browser (e.g. on the
 * server), where only the structural checks run -- the server can't access a
 * CSS engine, and an invalid value is harmless there (browsers ignore it)
 */
function domValid(type: ThemeVariableInfo["type"], value: string): boolean | undefined {
	if (typeof document === "undefined") {
		return undefined;
	}
	validationEl ??= document.createElement("div");
	const property = DOM_PROPERTY[type];
	validationEl.style[property] = "";
	validationEl.style[property] = value;
	return validationEl.style[property] !== "";
}

/** Whether a value is valid for a theme variable */
export function isValidThemeValue(variable: ThemeVariableInfo, value: unknown): value is string {
	if (typeof value !== "string") {
		return false;
	}
	const trimmed = value.trim();
	if (!trimmed || UNSAFE.test(trimmed)) {
		return false;
	}
	if (variable.type === "color") {
		if (!COLOR_RE.test(trimmed)) return false;
	} else if (variable.type === "font") {
		if (!FONT_RE.test(trimmed) || !/[a-z]/i.test(trimmed)) return false;
	} else {
		if (!LENGTH_RE.test(trimmed)) return false;
	}
	const valid = domValid(variable.type, trimmed);
	return valid === undefined ? true : valid;
}

/**
 * Filters an untrusted value down to a valid theme: only variables in the
 * given list, with valid values, survive. Returns `undefined` when nothing is
 * left, so callers can skip rendering a style tag entirely.
 */
export function sanitizeTheme(
	input: unknown,
	variables: ThemeVariableInfo[] = THEME_VARIABLES,
): ThemeModel | undefined {
	if (!input || typeof input !== "object") {
		return undefined;
	}
	const theme: ThemeModel = {};
	for (const variable of variables) {
		const value = (input as Record<string, unknown>)[variable.name];
		if (isValidThemeValue(variable, value)) {
			theme[variable.name] = value.trim();
		}
	}
	return Object.keys(theme).length ? theme : undefined;
}

/** Like `sanitizeTheme`, but keeps only the per-mode (colour) variables */
export function sanitizeDarkTheme(input: unknown): ThemeModel | undefined {
	return sanitizeTheme(input, DARK_THEME_VARIABLES);
}

/** Parses a theme stored as JSON in the database */
export function parseTheme(raw: string | null | undefined): ThemeModel | undefined {
	if (!raw) {
		return undefined;
	}
	try {
		return sanitizeTheme(JSON.parse(raw));
	} catch {
		return undefined;
	}
}

/** All variables at their default values */
export function defaultTheme(): Required<ThemeModel> {
	return Object.fromEntries(
		THEME_VARIABLES.map((v) => [v.name, v.default]),
	) as Required<ThemeModel>;
}

/** The dark values of the variables that can differ between modes */
export function darkDefaultTheme(): ThemeModel {
	return Object.fromEntries(
		DARK_THEME_VARIABLES.map((v) => [v.name, v.dark as string]),
	) as ThemeModel;
}

/** A complete set of values (defaults with the user's overrides applied) */
export function mergeTheme(theme: ThemeModel | undefined): Required<ThemeModel> {
	return { ...defaultTheme(), ...theme };
}

/** The dark palette (dark defaults with the user's overrides applied) */
export function mergeDarkTheme(theme: ThemeModel | undefined): ThemeModel {
	return { ...darkDefaultTheme(), ...theme };
}

function buildCss(
	theme: ThemeModel | undefined,
	variables: ThemeVariableInfo[],
	selector: string,
): string {
	if (!theme) {
		return "";
	}
	const declarations = variables
		.filter((variable) => isValidThemeValue(variable, theme[variable.name]))
		.map((variable) => `--${variable.name}:${theme[variable.name]}`)
		.join(";");
	return declarations ? `${selector}{${declarations}}` : "";
}

/**
 * Builds the `:root` CSS that applies the light theme, or `""` when there are
 * no valid overrides. Safe to render into a <style> tag (values are validated).
 */
export function themeCss(theme: ThemeModel | undefined): string {
	return buildCss(theme, THEME_VARIABLES, ":root");
}

/**
 * Builds the `html.dark` CSS that applies the dark theme overrides, or `""`
 * when there are none.
 */
export function darkThemeCss(theme: ThemeModel | undefined): string {
	return buildCss(theme, DARK_THEME_VARIABLES, "html.dark");
}
