import { expect, test } from "vite-plus/test";
import * as v from "valibot";
import {
	darkDefaultTheme,
	darkThemeCss,
	mergeDarkTheme,
	mergeTheme,
	parseTheme,
	sanitizeDarkTheme,
	sanitizeTheme,
	themeCss,
} from "../../src/lib/theme/theme";
import { DARK_THEME_VARIABLES, THEME_VARIABLES } from "../../src/lib/theme/themeVariables";
import ThemeSchema, { ThemeEditSchema } from "../../src/types/theme/ThemeSchema";

test("sanitizeTheme keeps only known variables with valid values", async () => {
	expect(sanitizeTheme({ background: "#fff", link: "not a color", nope: "#fff" })).toEqual({
		background: "#fff",
	});
	expect(sanitizeTheme({})).toBeUndefined();
	expect(sanitizeTheme("nope")).toBeUndefined();
	expect(sanitizeTheme(null)).toBeUndefined();
});

test("theme values accept common css color syntaxes", async () => {
	expect(sanitizeTheme({ link: "rgba(0, 0, 0, 0.1)" })).toEqual({ link: "rgba(0, 0, 0, 0.1)" });
	expect(sanitizeTheme({ link: "hsl(120 50% 50%)" })).toEqual({ link: "hsl(120 50% 50%)" });
	expect(sanitizeTheme({ link: "red" })).toEqual({ link: "red" });
	// The browser's css engine rejects unknown color names
	expect(sanitizeTheme({ link: "notacolor" })).toBeUndefined();
});

test("theme values accept lengths", async () => {
	expect(sanitizeTheme({ "border-radius": "1.5rem" })).toEqual({ "border-radius": "1.5rem" });
	expect(sanitizeTheme({ "h2-size": "2.4rem" })).toEqual({ "h2-size": "2.4rem" });
	expect(sanitizeTheme({ "border-radius": "red" })).toBeUndefined();
});

test("theme values accept font families", async () => {
	expect(sanitizeTheme({ "text-font": "Georgia, serif" })).toEqual({
		"text-font": "Georgia, serif",
	});
	expect(sanitizeTheme({ "heading-font": '"Source Sans 3", sans-serif' })).toEqual({
		"heading-font": '"Source Sans 3", sans-serif',
	});
	// A font family needs at least one letter
	expect(sanitizeTheme({ "text-font": "123" })).toBeUndefined();
});

test("theme values can't break out of the style tag", async () => {
	const evil = {
		background: "#fff}body{display:none",
		link: "url(http://example.com)",
	};
	expect(sanitizeTheme(evil)).toBeUndefined();
	expect(themeCss({ background: "#fff}body{}" })).toBe("");
	expect(themeCss({ link: "#fff;position:fixed" })).toBe("");
});

test("themeCss builds :root declarations", async () => {
	expect(themeCss({ background: "#112233", "border-radius": "1rem" })).toBe(
		":root{--background:#112233;--border-radius:1rem}",
	);
	expect(themeCss(undefined)).toBe("");
	expect(themeCss({})).toBe("");
});

test("parseTheme round trips and tolerates junk", async () => {
	expect(parseTheme(JSON.stringify({ link: "#ff0000" }))).toEqual({ link: "#ff0000" });
	expect(parseTheme("not json")).toBeUndefined();
	expect(parseTheme(null)).toBeUndefined();
});

test("mergeTheme fills in the defaults", async () => {
	const merged = mergeTheme({ link: "#ff0000" });
	expect(merged.link).toBe("#ff0000");
	expect(merged.background).toBe(
		THEME_VARIABLES.find((variable) => variable.name === "background")!.default,
	);
});

test("ThemeSchema accepts valid and rejects invalid values", async () => {
	const ok = v.safeParse(ThemeSchema, {
		background: "rgba(0, 0, 0, 0.1)",
		"border-radius": "1rem",
	});
	expect(ok.success).toBe(true);

	const bad = v.safeParse(ThemeSchema, { background: "notacolor" });
	expect(bad.success).toBe(false);

	const badLength = v.safeParse(ThemeSchema, { "border-radius": "1rem; color: red" });
	expect(badLength.success).toBe(false);
});

test("dark theme: sanitize keeps only colour variables", async () => {
	// `text-font` is shared (not per-mode), so it's dropped from a dark palette
	expect(sanitizeDarkTheme({ background: "#111", "text-font": "Georgia, serif" })).toEqual({
		background: "#111",
	});
	expect(DARK_THEME_VARIABLES.every((variable) => variable.type === "color")).toBe(true);
});

test("darkThemeCss builds html.dark declarations", async () => {
	expect(darkThemeCss({ background: "#112233", link: "#ff0000" })).toBe(
		"html.dark{--background:#112233;--link:#ff0000}",
	);
	// Non-colour variables are ignored in the dark palette
	expect(darkThemeCss({ "text-font": "Georgia, serif" })).toBe("");
	expect(darkThemeCss(undefined)).toBe("");
});

test("darkDefaultTheme and mergeDarkTheme", async () => {
	const defaults = darkDefaultTheme();
	expect(defaults.background).toBe(
		DARK_THEME_VARIABLES.find((variable) => variable.name === "background")!.dark,
	);

	const merged = mergeDarkTheme({ link: "#ff0000" });
	expect(merged.link).toBe("#ff0000");
	expect(merged.background).toBe(defaults.background);
});

test("ThemeEditSchema validates light and dark palettes", async () => {
	expect(v.safeParse(ThemeEditSchema, { light: { background: "#fff" } }).success).toBe(true);
	expect(v.safeParse(ThemeEditSchema, { dark: { link: "#ff0000" } }).success).toBe(true);
	expect(v.safeParse(ThemeEditSchema, {}).success).toBe(true);
	expect(v.safeParse(ThemeEditSchema, { light: { background: "notacolor" } }).success).toBe(false);
});
