import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { ok } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, assert, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import followConfirmed, { type FollowConfirmModel } from "../../src/lib/public/followConfirmed";
import mockFetch from "../mockFetch";
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
	mockFetch(fetch, (async () => ok())());

	const model: FollowConfirmModel = {
		sharedKey: "yyy-freya",
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
