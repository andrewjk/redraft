import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, assert, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import postReaction from "../../src/lib/public/postReaction";
import type PostReactionModel from "../../src/types/public/PostReactionModel";
import { POST_REACTION_VERSION } from "../../src/types/public/PostReactionModel";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "notify-reaction");
});

afterAll(() => {
	cleanUpSiteTest("notify-reaction");
});

test("notification from reaction", async () => {
	const post = (await db.query.postsTable.findFirst({
		where: eq(schema.postsTable.slug, "post-1"),
	}))!;

	const model: PostReactionModel = {
		slug: post.slug,
		sharedKey: "yyy-bob",
		emoji: "🔥",
		version: POST_REACTION_VERSION,
	};

	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await postReaction(request);
	expect(response.status).toBe(200);

	const notification = await db.query.notificationsTable.findFirst({
		where: eq(schema.notificationsTable.url, `http://localhost/alice/posts/post-1`),
	});
	assert(notification, "notification should exist");
	expect(notification.text).toBe("Bob Y reacted to your post with 🔥");
});
