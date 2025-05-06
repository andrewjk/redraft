import { queryByText } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vitest";
import { vi } from "vitest";
import * as schema from "../../src/data/schema/index";
import accountSetup, {
	type SetupModel,
	type SetupResponseModel,
} from "../../src/lib/account/accountSetup";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "setup");

	vi.stubEnv("SITE_LOCATION", "http://localhost/cara");
	vi.stubEnv("USERNAME", "cara");
	vi.stubEnv("PASSWORD", "cara's password");
});

afterAll(() => {
	cleanUpSiteTest("setup");
});

test("setup get", async () => {
	const response = await runTest(site, "/account/setup");
	const html = await response.text();

	const div = document.createElement("div");
	div.innerHTML = html;

	const title = queryByText(div, "Username");
	expect(title).not.toBeNull();
});

test("setup", async () => {
	const model: SetupModel = {
		username: "cara",
		password: "cara's password",
		name: "Cara Z",
		email: "cara@localhost",
		bio: "Cara's bio",
		image: "cara.png",
		location: "Cara's location",
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await accountSetup(request);
	expect(response.status).toBe(201);

	const data = (await response.json()) as SetupResponseModel;

	expect(data.url).toEqual("http://localhost/cara");
	expect(data.username).toEqual("cara");
	expect(data.name).toEqual("Cara Z");
	expect(data.image).toEqual("cara.png");
	expect(data.token).not.toBeUndefined();
	expect(data.code).not.toBeUndefined();

	const user = await db.query.usersTable.findFirst({
		where: eq(schema.usersTable.username, "cara"),
	});

	expect(user).not.toBeUndefined();
	expect(user!.name).toEqual("Cara Z");
	// etc
});
