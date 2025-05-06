import { queryByText } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import articleList from "../../src/lib/articles/articleList";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "articles");
});

afterAll(() => {
	cleanUpSiteTest("articles");
});

test("articles get", async () => {
	// @ts-ignore mock fetch
	fetch.mockResolvedValue(articleList(false));

	const response = await runTest(site, "/articles");
	const html = await response.text();

	const div = document.createElement("div");
	div.innerHTML = html;

	const title = queryByText(div, "Article 1");
	expect(title).not.toBeNull();
});

test("article drafts get", async () => {
	// @ts-ignore mock fetch
	fetch.mockResolvedValue(articleList(true));

	const response = await runTest(site, "/articles");
	const html = await response.text();

	const div = document.createElement("div");
	div.innerHTML = html;

	const title = queryByText(div, "Article 1");
	expect(title).toBeNull();
});

test("articles post", async () => {
	// TODO: Creating and updating an article
});
