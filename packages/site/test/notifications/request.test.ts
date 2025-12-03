import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { ok } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, assert, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import followRequested from "../../src/lib/public/followRequested";
import type FollowRequestedModel from "../../src/types/public/FollowRequestedModel";
import { FOLLOW_REQUESTED_VERSION } from "../../src/types/public/FollowRequestedModel";
import mockFetch from "../mockFetch";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "notify-request");
});

afterAll(() => {
	cleanUpSiteTest("notify-request");
});

test("notification from request", async () => {
	mockFetch(
		fetch,
		(async () =>
			ok({
				name: "Cara Z",
				image: "",
				bio: "",
			}))(),
	);

	const model: FollowRequestedModel = {
		url: "http://localhost/cara/",
		sharedKey: "yyy-cara",
		version: FOLLOW_REQUESTED_VERSION,
	};

	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await followRequested(request);
	expect(response.status).toBe(200);

	const notification = await db.query.notificationsTable.findFirst({
		where: eq(schema.notificationsTable.url, `http://localhost/alice/contacts/requests`),
	});
	assert(notification, "notification should exist");
	expect(notification.text).toBe("Cara Z has requested to follow you");
});
