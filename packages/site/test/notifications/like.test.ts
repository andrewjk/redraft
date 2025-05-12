import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { ok } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, assert, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import type { PostLikeModel } from "../../src/lib/public/postLiked";
import postLiked from "../../src/lib/public/postLiked";
import mockFetch from "../mockFetch";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "notify-like");
});

afterAll(() => {
	cleanUpSiteTest("notify-like");
});

test("notification from like", async () => {
	// Just mock the send by returning ok
	mockFetch(fetch, new Promise<Response>(() => ok()));

	const post = (await db.query.postsTable.findFirst({
		where: eq(schema.postsTable.slug, "post-1"),
	}))!;

	const model: PostLikeModel = {
		slug: post.slug,
		sharedKey: "yyy-bob",
		liked: true,
	};

	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await postLiked(request);
	expect(response.status).toBe(200);

	const notification = await db.query.notificationsTable.findFirst({
		where: eq(schema.notificationsTable.url, `http://localhost/alice/posts/post-1`),
	});
	assert(notification, "notification should exist");
	expect(notification.text).toBe("Bob Y liked your post");
});
