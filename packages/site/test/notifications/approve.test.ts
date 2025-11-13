import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, assert, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import followConfirmed from "../../src/lib/public/followConfirmed";
import type FollowConfirmedModel from "../../src/types/public/FollowConfirmedModel";
import { FOLLOW_CONFIRMED_VERSION } from "../../src/types/public/FollowConfirmedModel";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "notify-approve");
});

afterAll(() => {
	cleanUpSiteTest("notify-approve");
});

test("notification from approve", async () => {
	const model: FollowConfirmedModel = {
		sharedKey: "yyy-freya",
		version: FOLLOW_CONFIRMED_VERSION,
	};

	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await followConfirmed(request);
	expect(response.status).toBe(200);

	const notification = await db.query.notificationsTable.findFirst({
		where: eq(schema.notificationsTable.url, `http://localhost/freya/`),
	});
	assert(notification, "notification should exist");
	expect(notification.text).toBe("Freya S has approved your follow request");
});
