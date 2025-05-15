import { queryByText } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";
import { node } from "@torpor/adapter-node";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import fs from "node:fs";
import { afterAll, beforeAll, expect, test } from "vitest";
import { vi } from "vitest";
import * as schema from "../../src/data/schema/index";
import accountSetup, {
	type SetupModel,
	type SetupResponseModel,
} from "../../src/lib/account/accountSetup";
import { cleanUpSiteTest } from "../prepareSiteTest";
import testAdapter from "../testAdapter";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	// NOTE: We need to do our own setup here to ensure we have an empty db
	site.adapter = node;
	await site.addRouteFolder("./src/routes");

	// Copy the database here and create a social adapter that gets it
	fs.copyFileSync("./test/data/empty.db", `./test/data/setup.db`);

	const adapter = testAdapter(`./test/data/setup.db`);
	// @ts-ignore
	globalThis.socialAdapter = adapter;

	// Stub environment variables
	vi.stubEnv("JWT_SECRET", "blah");
	vi.stubEnv("SITE_LOCATION", "http://localhost/cara");
	vi.stubEnv("USERNAME", "cara");
	vi.stubEnv("PASSWORD", "cara's password");

	global.fetch = vi.fn();

	db = adapter.database(schema);
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

test("setup post", async () => {
	const model: SetupModel = {
		username: "cara",
		password: "cara's password",
		name: "Cara Z",
		email: "cara@localhost",
		bio: "Cara's bio",
		location: "Cara's location",
		image: "cara.png",
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await accountSetup(request);
	expect(response.status).toBe(201);

	const userCount = await db.$count(schema.usersTable);
	expect(userCount).toBe(1);

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

	// Doing it twice should just update the user, in case the user went back and forth
	model.name = "Cara ZZZ";
	const request2 = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response2 = await accountSetup(request2);
	expect(response2.status).toBe(201);

	const userCount2 = await db.$count(schema.usersTable);
	expect(userCount2).toBe(1);

	const user2 = await db.query.usersTable.findFirst({
		where: eq(schema.usersTable.username, "cara"),
	});

	expect(user2).not.toBeUndefined();
	expect(user2!.name).toEqual("Cara ZZZ");

	// Doing it with a different username should error
	model.username = "dan";
	const request3 = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response3 = await accountSetup(request3);
	expect(response3.status).toBe(403);
});

test("setup post with bad username", async () => {
	const model: SetupModel = {
		username: "dan",
		password: "dan's password",
		name: "Dan Z",
		email: "dan@localhost",
		bio: "Dan's bio",
		location: "Dan's location",
		image: "dan.png",
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await accountSetup(request);
	expect(response.status).toBe(403);
});
