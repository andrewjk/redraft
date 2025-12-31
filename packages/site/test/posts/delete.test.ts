import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { eq, isNotNull } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, assert, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import postDelete from "../../src/lib/posts/postDelete";
import type PostDeleteModel from "../../src/types/posts/PostDeleteModel";
import buildTestUser from "../buildTestUser";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "posts-delete");
});

afterAll(() => {
	cleanUpSiteTest("posts-delete");
});

test("post delete", async () => {
	const user = await buildTestUser("xxx-alice");

	const postCount = await db.$count(schema.postsTable, isNotNull(schema.postsTable.deleted_at));

	const model: PostDeleteModel = {
		slug: "post-bad",
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await postDelete(request, {}, user.token, user.code);
	expect(response.status).toBe(200);

	const postCount2 = await db.$count(schema.postsTable, isNotNull(schema.postsTable.deleted_at));
	expect(postCount2).toBe(postCount + 1);

	//const data = (await response.json()) as PostPreview;
	//expect(data.text).toEqual("<p>Here is a bad post</p>");

	const post = await db.query.postsTable.findFirst({
		where: eq(schema.postsTable.text, "Here is a bad post"),
	});

	expect(post).not.toBeUndefined();
	assert(post);
	expect(post.text).toEqual("Here is a bad post");
	expect(post.deleted_at).not.toBeNull();
});

test("post delete with bad code", async () => {
	const user = await buildTestUser("xxx-dan");

	const model: PostDeleteModel = {
		slug: "post-bad",
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await postDelete(request, {}, user.token, user.code);
	expect(response.status).toBe(401);
});
