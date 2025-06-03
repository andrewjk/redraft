import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { eq } from "drizzle-orm";
import { type LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, assert, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import commentCreate, { type CommentCreateModel } from "../../src/lib/comments/commentCreate";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "notify-comment");
});

afterAll(() => {
	cleanUpSiteTest("notify-comment");
});

test("no notification from user comment", async () => {
	const post = (await db.query.postsTable.findFirst({
		where: eq(schema.postsTable.slug, "post-1"),
	}))!;

	const model: CommentCreateModel = {
		postSlug: post.slug,
		parentSlug: "",
		text: "This is a new comment",
	};

	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await commentCreate(request, {}, "http://localhost/alice/", "", "xxx-alice", "");
	expect(response.status).toBe(201);

	const notification = await db.query.notificationsTable.findFirst({
		where: eq(schema.notificationsTable.url, `http://localhost/alice/posts/post-1`),
	});
	expect(notification).toBeUndefined();
});

test("notification from follower comment", async () => {
	const post = (await db.query.postsTable.findFirst({
		where: eq(schema.postsTable.slug, "image-1"),
	}))!;

	const model: CommentCreateModel = {
		postSlug: post.slug,
		parentSlug: "",
		text: "This is a new comment by a follower",
	};

	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await commentCreate(request, {}, "http://localhost/bob/", "yyy-bob", "", "");
	expect(response.status).toBe(201);

	const notification = await db.query.notificationsTable.findFirst({
		where: eq(schema.notificationsTable.url, `http://localhost/alice/posts/image-1`),
	});
	assert(notification, "notification should exist");
	expect(notification.text).toBe("Bob Y commented on your post");
});
