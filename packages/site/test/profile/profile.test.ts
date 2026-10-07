import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import * as schema from "../../src/data/schema/index";
import profileEdit from "../../src/lib/profile/profileEdit";
import buildTestEvent from "../buildTestEvent";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

const site: Site = new Site();
let db: LibSQLDatabase<typeof schema>;

beforeAll(async () => {
	db = await prepareSiteTest(site, "profile");
});

afterAll(() => {
	cleanUpSiteTest("profile");
});

function request(model: unknown) {
	return new Request("http://localhost", { method: "POST", body: JSON.stringify(model) });
}

const model = {
	email: "alice@example.com",
	name: "Alice X",
	bio: "",
	about: "",
	location: "",
	image: "",
	links: [] as { id: number; text: string; url: string }[],
};

test("profile edit ignores blank links", async () => {
	const before = await db.query.userLinksTable.findMany();

	const response = await profileEdit(
		request({ ...model, links: [{ id: -1, text: "", url: "" }] }),
		{},
		"xxx-alice",
		"xxx-alice",
	);
	expect(response.status).toBe(200);

	const after = await db.query.userLinksTable.findMany();
	expect(after.length).toBe(before.length);
});

test("profile edit saves a complete link", async () => {
	const response = await profileEdit(
		request({ ...model, links: [{ id: -2, text: "My site", url: "https://example.com" }] }),
		{},
		"xxx-alice",
		"xxx-alice",
	);
	expect(response.status).toBe(200);

	const links = await db.query.userLinksTable.findMany();
	expect(links.map((link) => link.text)).toContain("My site");
});

test("profile page shows the name and url", async () => {
	const ev = await buildTestEvent("http://localhost/profile", "xxx-alice");
	const response = await runTest(site, "/profile", ev);
	expect(response.status).toBe(200);

	const html = await response.text();
	expect(html).toContain("Alice X");
	expect(html).toContain("localhost/alice");
});
