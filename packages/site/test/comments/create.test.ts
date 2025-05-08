import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { ok } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import commentCreate, { type CommentCreateModel } from "../../src/lib/comments/commentCreate";
import type { CommentPreview } from "../../src/lib/comments/commentPreview";
import mockFetch from "../mockFetch";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "comments-create");
});

afterAll(() => {
	cleanUpSiteTest("comments-create");
});

test("comment create by author", async () => {
	// Just mock the send by returning ok
	mockFetch(fetch, new Promise<Response>(() => ok()));

	const post = (await db.query.postsTable.findFirst({
		where: eq(schema.postsTable.slug, "post-1"),
	}))!;
	const commentCount = await db.$count(
		schema.commentsTable,
		eq(schema.commentsTable.post_id, post.id),
	);

	const model: CommentCreateModel = {
		postSlug: post.slug,
		parentSlug: "",
		text: "This is a new comment",
	};

	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await commentCreate(request, {}, "http://localhost/alice", "", "xxx-alice", "");
	expect(response.status).toBe(201);

	// Check comment count in db
	const commentCount2 = await db.$count(
		schema.commentsTable,
		eq(schema.commentsTable.post_id, post.id),
	);
	expect(commentCount2).toBe(commentCount + 1);

	// Check comment count on post
	const post2 = (await db.query.postsTable.findFirst({
		where: eq(schema.postsTable.slug, "post-1"),
	}))!;
	expect(post2.comment_count).toBe(commentCount2);

	const data = (await response.json()) as CommentPreview;

	// TODO: Should be markdown
	expect(data.text).toEqual("This is a new comment");

	const comment = await db.query.commentsTable.findFirst({
		where: eq(schema.commentsTable.text, "This is a new comment"),
	});

	expect(comment).not.toBeUndefined();
	expect(comment!.text).toEqual("This is a new comment");
	// etc
});

test("comment create by follower", async () => {
	// Just mock the send by returning ok
	mockFetch(fetch, new Promise<Response>(() => ok()));

	const post = (await db.query.postsTable.findFirst({
		where: eq(schema.postsTable.slug, "image-1"),
	}))!;
	const commentCount = await db.$count(
		schema.commentsTable,
		eq(schema.commentsTable.post_id, post.id),
	);

	const model: CommentCreateModel = {
		postSlug: post.slug,
		parentSlug: "",
		text: "This is a new comment by a follower",
	};

	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await commentCreate(request, {}, "http://localhost/bob", "yyy-bob", "", "");
	expect(response.status).toBe(201);

	// Check comment count in db
	const commentCount2 = await db.$count(
		schema.commentsTable,
		eq(schema.commentsTable.post_id, post.id),
	);
	expect(commentCount2).toBe(commentCount + 1);

	// Check comment count on post
	const post2 = (await db.query.postsTable.findFirst({
		where: eq(schema.postsTable.slug, "image-1"),
	}))!;
	expect(post2.comment_count).toBe(commentCount2);

	const data = (await response.json()) as CommentPreview;

	// TODO: Should be markdown
	expect(data.text).toEqual("This is a new comment by a follower");

	const comment = await db.query.commentsTable.findFirst({
		where: eq(schema.commentsTable.text, "This is a new comment by a follower"),
	});

	expect(comment).not.toBeUndefined();
	expect(comment!.text).toEqual("This is a new comment by a follower");
	// etc
});

test("comment create with bad code", async () => {
	const post = (await db.query.postsTable.findFirst())!;

	const model: CommentCreateModel = {
		postSlug: post.slug,
		parentSlug: "",
		text: "This is a new comment",
	};

	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await commentCreate(request, {}, "http://localhost/dan/", "", "xxx-dan", "");
	expect(response.status).toBe(401);
});
