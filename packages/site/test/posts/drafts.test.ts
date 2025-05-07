import { queryByText } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import { draftPostList } from "../../src/lib/posts/postList";
import mockFetch from "../mockFetch";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "post-drafts");
});

afterAll(() => {
	cleanUpSiteTest("post-drafts");
});

test("post drafts get", async () => {
	mockFetch(fetch, draftPostList("xxx-alice"));

	const response = await runTest(site, "/posts");
	const html = await response.text();

	const div = document.createElement("div");
	div.innerHTML = html;

	const text = queryByText(div, "Here is a post");
	expect(text).toBeNull();

	const text2 = queryByText(div, "Here is a draft post");
	expect(text2).not.toBeNull();
});

test("post drafts get with bad code", async () => {
	mockFetch(fetch, draftPostList("xxx-bob", undefined, undefined));

	await expect(runTest(site, "/posts")).rejects.toThrowError("401");
});
