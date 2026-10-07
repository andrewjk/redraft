import fs from "node:fs";
import path from "node:path";
import { expect, test } from "vite-plus/test";
import { DARK_THEME_VARIABLES, THEME_VARIABLES } from "../../src/lib/theme/themeVariables";

function parseBlock(css: string, selector: string): Record<string, string> {
	const block = css.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\}`));
	expect(block, selector).not.toBeNull();
	const values: Record<string, string> = {};
	for (const match of block![1].matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
		values[match[1]] = match[2].trim();
	}
	return values;
}

// The defaults live in both the stylesheet and the theme variable list, so
// that the appearance form can seed values before any theme is saved. This
// keeps them from drifting
test("style.css :root defaults match the theme variable defaults", async () => {
	const css = fs.readFileSync(path.resolve(process.cwd(), "src/assets/style.css"), "utf8");
	const defaults = parseBlock(css, ":root");

	for (const variable of THEME_VARIABLES) {
		expect(defaults[variable.name], variable.name).toBe(variable.default);
	}
});

test("style.css html.dark defaults match the dark theme defaults", async () => {
	const css = fs.readFileSync(path.resolve(process.cwd(), "src/assets/style.css"), "utf8");
	const defaults = parseBlock(css, "html\\.dark");

	for (const variable of DARK_THEME_VARIABLES) {
		expect(defaults[variable.name], variable.name).toBe(variable.dark);
	}
});
