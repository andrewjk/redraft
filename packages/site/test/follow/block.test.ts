import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { eq, isNull } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import followBlock, { type BlockModel } from "../../src/lib/follow/followBlock";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "follow-block");
});

afterAll(() => {
	cleanUpSiteTest("follow-block");
});

test("follow block", async () => {
	const followedByCount = await db.$count(
		schema.followedByTable,
		isNull(schema.followedByTable.blocked_at),
	);

	const followedById = (await db.query.followedByTable.findFirst())!.id;

	const model: BlockModel = {
		id: followedById,
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await followBlock(request, "xxx-alice");
	expect(response.status).toBe(200);

	const followedByCount2 = await db.$count(
		schema.followedByTable,
		isNull(schema.followedByTable.blocked_at),
	);
	expect(followedByCount2).toBe(followedByCount - 1);

	const followedBy = await db.query.followedByTable.findFirst({
		where: eq(schema.followedByTable.id, followedById),
	});

	expect(followedBy).not.toBeUndefined();
	expect(followedBy!.blocked_at).not.toBeNull();
	// etc

	// Doing it twice should leave the existing record as-is
	const request2 = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response2 = await followBlock(request2, "xxx-alice");
	expect(response2.status).toBe(200);

	const followedByCount3 = await db.$count(
		schema.followedByTable,
		isNull(schema.followedByTable.blocked_at),
	);
	expect(followedByCount3).toBe(followedByCount - 1);

	const followedBy2 = await db.query.followedByTable.findFirst({
		where: eq(schema.followedByTable.id, followedById),
	});

	expect(followedBy2).not.toBeUndefined();
	expect(followedBy2!.blocked_at).not.toBeNull();
});

test("follow block with bad code", async () => {
	const model: BlockModel = {
		id: -1,
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await followBlock(request, "xxx-dan");
	expect(response.status).toBe(401);
});
