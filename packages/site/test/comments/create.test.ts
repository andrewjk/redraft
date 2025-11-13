import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, assert, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import commentCreate from "../../src/lib/comments/commentCreate";
import type CommentCreateModel from "../../src/types/comments/CommentCreateModel";
import type CommentPreviewModel from "../../src/types/comments/CommentPreviewModel";
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
	const response = await commentCreate(request, {}, "http://localhost/alice/", "", "xxx-alice", "");
	assert(response);
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

	const data = (await response.json()) as CommentPreviewModel;

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
	const response = await commentCreate(request, {}, "http://localhost/bob/", "yyy-bob", "", "");
	assert(response);
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

	const data = (await response.json()) as CommentPreviewModel;

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
	assert(response);
	expect(response.status).toBe(401);
});
