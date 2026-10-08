import { and, eq } from "drizzle-orm";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { ServerEvent } from "@torpor/build/server";
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import database from "../../src/data/database";
import * as schema from "../../src/data/schema";
import { FEED_RECEIVED_VERSION } from "../../src/types/public/FeedReceivedModel";
import createUserToken from "../../src/lib/utils/createUserToken";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";
import { expectErrorResponse } from "./helpers";

const site: Site = new Site();

beforeAll(async () => {
	await prepareSiteTest(site, "security-public-feed");
	await site.addRouteFolder("./src/api", "/api");
});

afterAll(() => {
	cleanUpSiteTest("security-public-feed");
});

// Eli's and Freya's shared keys, as seeded in testdata.db
const ELI_SHARED_KEY = "yyy-eli";
const FREYA_SHARED_KEY = "yyy-freya";

async function postFeed(sharedKey: string, slug: string, text: string) {
	const body = JSON.stringify({
		sharedKey,
		slug,
		text,
		visibility: 0,
		publishedAt: new Date(),
		version: FEED_RECEIVED_VERSION,
	});
	const request = new Request("http://localhost/api/public/feed", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body,
	});
	return await runTest(site, "/api/public/feed", new ServerEvent(request));
}

async function aliceFeedRequest() {
	const token = await createUserToken(
		{ url: "http://localhost/alice/", username: "alice", name: "Alice X" },
		"xxx-alice",
	);
	const request = new Request("http://localhost/api/feed", {
		headers: { Authorization: `Token ${token}` },
	});
	return await runTest(site, "/api/feed", new ServerEvent(request));
}

test("the public feed endpoint rejects unknown shared keys", async () => {
	const response = await postFeed("zzz-unknown", "feed-unauth", "Here is an injected post");
	expectErrorResponse(response, 404);
});

test("received feed content is sanitized", async () => {
	await postFeed(ELI_SHARED_KEY, "feed-xss", `Nice post!\n\n<img src=x onerror="alert('xss')">`);

	// The feed row is readable through the (authenticated) feed api
	const feedResponse = await aliceFeedRequest();
	const data: { feed: { slug: string; text: string }[] } = await feedResponse.json();
	const item = data.feed.find((f: { slug: string }) => f.slug === "feed-xss");

	// The raw event handler must not survive into rendered output
	expect(JSON.stringify(item)).not.toContain("onerror");
});

test("a shared key from a deleted relationship is rejected", async () => {
	const db = database();

	// Unfollow Eli -- the relationship is deleted
	await db
		.update(schema.followingTable)
		.set({ deleted_at: new Date() })
		.where(eq(schema.followingTable.url, "http://localhost/eli/"));

	const response = await postFeed(ELI_SHARED_KEY, "feed-after-delete", "Here is a ghost post");
	expectErrorResponse(response, 404);
});

test("a shared key cannot overwrite another follower's feed entry", async () => {
	const db = database();

	// "feed-1" is a feed entry from Eli
	const eli = await db.query.followingTable.findFirst({
		where: eq(schema.followingTable.url, "http://localhost/eli/"),
	});
	const freya = await db.query.followingTable.findFirst({
		where: eq(schema.followingTable.url, "http://localhost/freya/"),
	});

	// Freya sends a feed item with Eli's slug. She may write to her own feed,
	// but Eli's entry must be left untouched
	await postFeed(FREYA_SHARED_KEY, "feed-1", "Here is a hijacked post");

	const eliFeed = await db.query.feedTable.findFirst({
		where: and(eq(schema.feedTable.slug, "feed-1"), eq(schema.feedTable.user_id, eli!.id)),
	});
	expect(eliFeed!.text).toBe("Here is a post by Eli");

	const freyaFeed = await db.query.feedTable.findFirst({
		where: and(eq(schema.feedTable.slug, "feed-1"), eq(schema.feedTable.user_id, freya!.id)),
	});
	expect(freyaFeed!.text).toBe("Here is a hijacked post");
});
