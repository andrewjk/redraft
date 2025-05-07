import { queryByText } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import { draftMediaList } from "../../src/lib/media/mediaList";
import mockFetch from "../mockFetch";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "media-drafts");
});

afterAll(() => {
	cleanUpSiteTest("media-drafts");
});

test("media drafts get", async () => {
	mockFetch(fetch, draftMediaList("xxx-alice"));

	const response = await runTest(site, "/media");
	const html = await response.text();

	const div = document.createElement("div");
	div.innerHTML = html;

	const text = queryByText(div, "Here is a picture");
	expect(text).toBeNull();

	const text2 = queryByText(div, "Here is a draft picture");
	expect(text2).not.toBeNull();
});

test("media drafts get with bad code", async () => {
	mockFetch(fetch, draftMediaList("xxx-bob"));

	await expect(runTest(site, "/media")).rejects.toThrowError("401");
});
