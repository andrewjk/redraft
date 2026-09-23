import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import * as schema from "../../src/data/schema/index";
import blockedList from "../../src/lib/contacts/blockedList";
import followBlock from "../../src/lib/follow/followBlock";
import followUnblock from "../../src/lib/follow/followUnblock";
import type BlockedListModel from "../../src/types/contacts/BlockedListModel";
import type BlockModel from "../../src/types/follow/BlockModel";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "follow-unblock");
});

afterAll(() => {
	cleanUpSiteTest("follow-unblock");
});

test("follow unblock", async () => {
	const followedByUrl = (await db.query.followedByTable.findFirst())!.url;

	// Block the user first
	const model: BlockModel = {
		url: followedByUrl,
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await followBlock(request, "xxx-alice");
	expect(response.status).toBe(200);

	// They should show up in the blocked list
	const blockedResponse = await blockedList("xxx-alice");
	expect(blockedResponse.status).toBe(200);
	const blockedData = (await blockedResponse.json()) as BlockedListModel;
	expect(blockedData.blockedCount).toBe(1);
	expect(blockedData.blocked.find((f) => f.url === followedByUrl)).not.toBeUndefined();

	// Now unblock them
	const request2 = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response2 = await followUnblock(request2, "xxx-alice");
	expect(response2.status).toBe(200);

	const followedBy = await db.query.followedByTable.findFirst({
		where: eq(schema.followedByTable.url, followedByUrl),
	});

	expect(followedBy).not.toBeUndefined();
	expect(followedBy!.blocked_at).toBeNull();

	// The blocked list should be empty again
	const blockedResponse2 = await blockedList("xxx-alice");
	expect(blockedResponse2.status).toBe(200);
	const blockedData2 = (await blockedResponse2.json()) as BlockedListModel;
	expect(blockedData2.blockedCount).toBe(0);

	// Doing it twice should be ok
	const request3 = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response3 = await followUnblock(request3, "xxx-alice");
	expect(response3.status).toBe(200);
});

test("follow unblock unknown user", async () => {
	const model: BlockModel = {
		url: "abc",
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await followUnblock(request, "xxx-alice");
	expect(response.status).toBe(404);
});

test("follow unblock with bad code", async () => {
	const model: BlockModel = {
		url: "abc",
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await followUnblock(request, "xxx-dan");
	expect(response.status).toBe(401);
});
