import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { ok } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import followRequest, { type RequestModel } from "../../src/lib/follow/followRequest";
import mockFetch from "../mockFetch";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "follow-send");
});

afterAll(() => {
	cleanUpSiteTest("follow-send");
});

async function dummyResponse() {
	return ok({
		name: "Cara Z",
		image: "",
	});
}

test("follow send", async () => {
	mockFetch(fetch, dummyResponse());

	const followingCount = await db.$count(schema.followingTable);

	const model: RequestModel = {
		url: "http://localhost/cara/",
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await followRequest(request, "xxx-alice");
	expect(response.status).toBe(200);

	const followingCount2 = await db.$count(schema.followingTable);
	expect(followingCount2).toBe(followingCount + 1);

	const following = await db.query.followingTable.findFirst({
		where: eq(schema.followingTable.url, "http://localhost/cara/"),
	});

	expect(following).not.toBeUndefined();
	expect(following!.name).toEqual("Cara Z");
	// etc

	mockFetch(fetch, dummyResponse());

	// Doing it twice should leave the existing record as-is
	const request2 = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response2 = await followRequest(request2, "xxx-alice");
	expect(response2.status).toBe(200);

	const followingCount3 = await db.$count(schema.followingTable);
	expect(followingCount3).toBe(followingCount + 1);

	const following2 = await db.query.followingTable.findFirst({
		where: eq(schema.followingTable.url, "http://localhost/cara/"),
	});

	expect(following2).not.toBeUndefined();
	expect(following2!.name).toEqual("Cara Z");
});

test("follow send with bad code", async () => {
	const model: RequestModel = {
		url: "http://localhost/cara/",
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await followRequest(request, "xxx-dan");
	expect(response.status).toBe(401);
});
