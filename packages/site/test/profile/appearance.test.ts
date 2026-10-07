import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import * as schema from "../../src/data/schema/index";
import themeEdit from "../../src/lib/theme/themeEdit";
import buildTestEvent from "../buildTestEvent";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

const site: Site = new Site();
let db: LibSQLDatabase<typeof schema>;

beforeAll(async () => {
	db = await prepareSiteTest(site, "account-appearance");
});

afterAll(() => {
	cleanUpSiteTest("account-appearance");
});

function request(body: unknown) {
	return new Request("http://localhost", { method: "POST", body: JSON.stringify(body) });
}

test("theme save renders light and dark on every page", async () => {
	const response = await themeEdit(
		request({
			light: { background: "#112233", link: "#ff0000" },
			dark: { background: "#001122", link: "#00ff00" },
		}),
		"xxx-alice",
	);
	expect(response.status).toBe(200);

	const user = await db.query.usersTable.findFirst();
	expect(JSON.parse(user!.theme!)).toEqual({ background: "#112233", link: "#ff0000" });
	expect(JSON.parse(user!.dark_theme!)).toEqual({ background: "#001122", link: "#00ff00" });

	const ev = await buildTestEvent("http://localhost/feed", "xxx-alice");
	const page = await runTest(site, "/feed", ev);
	const html = await page.text();
	// Light overrides go in :root, dark in html.dark
	expect(html).toContain("--background:#112233");
	expect(html).toContain("html.dark{");
	expect(html).toContain("--background:#001122");
});

test("appearance page renders the theme form", async () => {
	const ev = await buildTestEvent("http://localhost/profile/appearance", "xxx-alice");
	const response = await runTest(site, "/profile/appearance", ev);
	expect(response.status).toBe(200);

	const html = await response.text();
	expect(html).toContain("Appearance");
	expect(html).toContain('name="light[background]"');
	expect(html).toContain('name="dark[background]"');
	expect(html).toContain('name="light[border-radius]"');
	// Free-form text inputs (no colour pickers), with the default as a hint
	expect(html).not.toContain('type="color"');
	expect(html).toContain('placeholder="rgba(0, 0, 0, 0.1)"');

	// It seeds from the theme saved above, not the defaults
	expect(html).toContain('name="light[background]" value="#112233"');
	expect(html).toContain('name="dark[background]" value="#001122"');
});

test("theme edit rejects invalid values", async () => {
	const response = await themeEdit(request({ light: { background: "notacolor" } }), "xxx-alice");
	expect(response.status).toBe(400);
});

test("theme edit rejects an unknown user", async () => {
	const response = await themeEdit(request({ light: { background: "#ffffff" } }), "nope");
	expect(response.status).toBe(401);
});
