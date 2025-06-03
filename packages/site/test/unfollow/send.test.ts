import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { ok } from "@torpor/build/response";
import { and, eq, isNull } from "drizzle-orm";
import { type LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import unfollowSend, { type UnfollowModel } from "../../src/lib/unfollow/unfollowSend";
import mockFetch from "../mockFetch";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "unfollow-send");
});

afterAll(() => {
	cleanUpSiteTest("unfollow-send");
});

async function dummyResponse() {
	return ok();
}

test("unfollow send", async () => {
	mockFetch(fetch, dummyResponse());

	const following = await db.query.followingTable.findFirst({
		where: eq(schema.followingTable.url, "http://localhost/eli/"),
	});
	expect(following).not.toBeNull();

	const followingCount = await db.$count(
		schema.followingTable,
		and(
			eq(schema.followingTable.url, "http://localhost/eli/"),
			isNull(schema.followingTable.deleted_at),
		),
	);
	expect(followingCount).toBe(1);

	const feedCount = await db.$count(
		schema.feedTable,
		and(eq(schema.feedTable.user_id, following!.id), isNull(schema.feedTable.deleted_at)),
	);
	expect(feedCount).toBe(1);

	const model: UnfollowModel = {
		url: "http://localhost/eli/",
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await unfollowSend(request, "xxx-alice");
	expect(response.status).toBe(200);

	const followingCount2 = await db.$count(
		schema.followingTable,
		and(
			eq(schema.followingTable.url, "http://localhost/eli/"),
			isNull(schema.followingTable.deleted_at),
		),
	);
	expect(followingCount2).toBe(0);

	const feedCount2 = await db.$count(
		schema.feedTable,
		and(eq(schema.feedTable.user_id, following!.id), isNull(schema.feedTable.deleted_at)),
	);
	expect(feedCount2).toBe(0);

	const following2 = await db.query.followingTable.findFirst({
		where: eq(schema.followingTable.url, "http://localhost/eli/"),
	});

	expect(following2).not.toBeUndefined();
	expect(following2!.deleted_at).not.toBeNull();
	// etc

	mockFetch(fetch, dummyResponse());

	// Doing it twice should leave the existing record as-is
	const request2 = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response2 = await unfollowSend(request2, "xxx-alice");
	expect(response2.status).toBe(200);

	const followingCount3 = await db.$count(
		schema.followingTable,
		and(
			eq(schema.followingTable.url, "http://localhost/eli/"),
			isNull(schema.followingTable.deleted_at),
		),
	);
	expect(followingCount3).toBe(0);

	const feedCount3 = await db.$count(
		schema.feedTable,
		and(eq(schema.feedTable.user_id, following!.id), isNull(schema.feedTable.deleted_at)),
	);
	expect(feedCount3).toBe(0);

	const following3 = await db.query.followingTable.findFirst({
		where: eq(schema.followingTable.url, "http://localhost/eli/"),
	});

	expect(following3).not.toBeUndefined();
	expect(following3!.deleted_at).not.toBeNull();
});

test("unfollow send with bad code", async () => {
	const model: UnfollowModel = {
		url: "http://localhost/eli/",
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await unfollowSend(request, "xxx-dan");
	expect(response.status).toBe(401);
});
