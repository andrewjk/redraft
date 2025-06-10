import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import { PUBLIC_POST_VISIBILITY, TEXT_POST_TYPE } from "../../src/lib/constants";
import { type PostEditModel } from "../../src/lib/posts/postEdit";
import { type PostPreview } from "../../src/lib/posts/postPreview";
import postSave from "../../src/lib/posts/postSave";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "posts-save");
});

afterAll(() => {
	cleanUpSiteTest("posts-save");
});

test("post save", async () => {
	const postCount = await db.$count(schema.postsTable);

	const model: PostEditModel = {
		id: -1,
		published: false,
		text: "This is a new post",
		visibility: PUBLIC_POST_VISIBILITY,
		type: TEXT_POST_TYPE,
		image: null,
		articleId: null,
		url: null,
		title: null,
		publication: null,
		articleText: null,
		tags: null,
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await postSave(request, "xxx-alice");
	expect(response.status).toBe(200);

	const postCount2 = await db.$count(schema.postsTable);
	expect(postCount2).toBe(postCount + 1);

	const data = (await response.json()) as PostPreview;

	expect(data.text).toEqual("<p>This is a new post</p>");

	const post = await db.query.postsTable.findFirst({
		where: eq(schema.postsTable.text, "This is a new post"),
	});

	expect(post).not.toBeUndefined();
	expect(post!.text).toEqual("This is a new post");
	// etc

	// Doing it twice should just update the post
	model.id = post!.id;
	model.text = "This is an updated post";
	const request2 = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response2 = await postSave(request2, "xxx-alice");
	expect(response2.status).toBe(200);

	const postCount3 = await db.$count(schema.postsTable);
	expect(postCount3).toBe(postCount + 1);

	const post2 = await db.query.postsTable.findFirst({
		where: eq(schema.postsTable.text, "This is an updated post"),
	});

	expect(post2).not.toBeUndefined();
	expect(post2!.text).toEqual("This is an updated post");
});

test("post save with bad code", async () => {
	const model: PostEditModel = {
		id: -1,
		published: false,
		text: "This is a new post",
		visibility: PUBLIC_POST_VISIBILITY,
		type: TEXT_POST_TYPE,
		image: null,
		articleId: null,
		url: null,
		title: null,
		publication: null,
		articleText: null,
		tags: null,
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await postSave(request, "xxx-dan");
	expect(response.status).toBe(401);
});
