import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import * as schema from "../../src/data/schema/index";
import { PUBLIC_POST_VISIBILITY } from "../../src/lib/constants";
import postEditGet from "../../src/lib/posts/postEditGet";
import postSave from "../../src/lib/posts/postSave";
import type PostEditModel from "../../src/types/posts/PostEditModel";
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
		slug: "",
		published: false,
		text: "This is a new post",
		visibility: PUBLIC_POST_VISIBILITY,
		hasImage: false,
		isArticle: false,
		hasLink: false,
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await postSave(request, "xxx-alice");
	expect(response.status).toBe(200);

	const postCount2 = await db.$count(schema.postsTable);
	expect(postCount2).toBe(postCount + 1);

	//const data = (await response.json()) as PostPreview;
	//expect(data.text).toEqual("<p>This is a new post</p>");

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
		slug: "",
		published: false,
		text: "This is a new post",
		visibility: PUBLIC_POST_VISIBILITY,
		hasImage: false,
		isArticle: false,
		hasLink: false,
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await postSave(request, "xxx-dan");
	expect(response.status).toBe(401);
});

async function save(model: PostEditModel) {
	const response = await postSave(
		new Request("http://localhost", { method: "POST", body: JSON.stringify(model) }),
		"xxx-alice",
	);
	expect(response.status).toBe(200);
}

test("post save keeps children in the submitted order", async () => {
	// Create a post with two children
	const model: PostEditModel = {
		id: -1,
		slug: "",
		text: "Post with children",
		visibility: PUBLIC_POST_VISIBILITY,
		children: [
			{ id: -1, slug: "", text: "Child one" },
			{ id: -2, slug: "", text: "Child two" },
		],
	};
	await save(model);

	let post = await db.query.postsTable.findFirst({
		where: eq(schema.postsTable.text, "Post with children"),
	});
	expect(post).not.toBeUndefined();
	expect(post!.child_count).toBe(2);

	async function loadChildren() {
		return db.query.postsTable.findMany({
			where: eq(schema.postsTable.parent_id, post!.id),
			orderBy: [schema.postsTable.child_count, schema.postsTable.id],
		});
	}

	// Insert a new child between the two, and save again
	const { post: view } = (await (await postEditGet(post!.slug, "xxx-alice")).json()) as {
		post: PostEditModel;
	};
	model.id = post!.id;
	model.children = [
		view.children![0],
		{ id: -3, slug: "", text: "Child middle" },
		view.children![1],
	];
	await save(model);

	post = await db.query.postsTable.findFirst({
		where: eq(schema.postsTable.text, "Post with children"),
	});
	expect(post!.child_count).toBe(3);

	// Each child stores its position, and the edit view returns them in order
	const children = await loadChildren();
	expect(children.map((c) => c.text)).toEqual(["Child one", "Child middle", "Child two"]);
	expect(children.map((c) => c.child_count)).toEqual([0, 1, 2]);

	const { post: view2 } = (await (await postEditGet(post!.slug, "xxx-alice")).json()) as {
		post: PostEditModel;
	};
	expect(view2.children!.map((c) => c.text)).toEqual(["Child one", "Child middle", "Child two"]);
});
