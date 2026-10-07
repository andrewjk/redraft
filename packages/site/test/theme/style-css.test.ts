import fs from "node:fs";
import path from "node:path";
import { expect, test } from "vite-plus/test";
import { THEME_VARIABLES } from "../../src/lib/theme/themeVariables";

// The defaults live in both the stylesheet and the theme variable list, so
// that the appearance form can seed values before any theme is saved. This
// keeps them from drifting
test("style.css :root defaults match the theme variable defaults", async () => {
	const cssPath = path.resolve(process.cwd(), "src/assets/style.css");
	const css = fs.readFileSync(cssPath, "utf8");

	const root = css.match(/:root\s*\{([\s\S]*?)\}/);
	expect(root).not.toBeNull();

	const defaults: Record<string, string> = {};
	for (const match of root![1].matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
		defaults[match[1]] = match[2].trim();
	}

	for (const variable of THEME_VARIABLES) {
		expect(defaults[variable.name], variable.name).toBe(variable.default);
	}
});
