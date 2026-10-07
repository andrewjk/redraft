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

test("theme save renders on every page", async () => {
	const response = await themeEdit(
		request({ background: "#112233", link: "#ff0000" }),
		"xxx-alice",
	);
	expect(response.status).toBe(200);

	const user = await db.query.usersTable.findFirst();
	expect(JSON.parse(user!.theme!)).toEqual({ background: "#112233", link: "#ff0000" });

	const ev = await buildTestEvent("http://localhost/feed", "xxx-alice");
	const page = await runTest(site, "/feed", ev);
	const html = await page.text();
	expect(html).toContain("--background:#112233");
	expect(html).toContain("--link:#ff0000");
});

test("appearance page renders the theme form", async () => {
	const ev = await buildTestEvent("http://localhost/profile/appearance", "xxx-alice");
	const response = await runTest(site, "/profile/appearance", ev);
	expect(response.status).toBe(200);

	const html = await response.text();
	expect(html).toContain("Appearance");
	expect(html).toContain('name="background"');
	expect(html).toContain('name="border-radius"');
	// Free-form text inputs (no colour pickers), with the default as a hint
	expect(html).not.toContain('type="color"');
	expect(html).toContain('placeholder="rgba(0, 0, 0, 0.1)"');

	// It seeds from the theme saved above, not the defaults
	expect(html).toContain('name="background" value="#112233"');
});

test("theme edit rejects invalid values", async () => {
	const response = await themeEdit(request({ background: "notacolor" }), "xxx-alice");
	expect(response.status).toBe(400);
});

test("theme edit rejects an unknown user", async () => {
	const response = await themeEdit(request({ background: "#ffffff" }), "nope");
	expect(response.status).toBe(401);
});
