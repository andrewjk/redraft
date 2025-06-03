import { queryByText } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { afterAll, beforeAll, expect, test } from "vitest";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

const site: Site = new Site();

beforeAll(async () => {
	await prepareSiteTest(site, "articles");
});

afterAll(() => {
	cleanUpSiteTest("articles");
});

test("articles get", async () => {
	const response = await runTest(site, "/articles");
	expect(response.status).toBe(200);

	const html = await response.text();

	const div = document.createElement("div");
	div.innerHTML = html;

	const title = queryByText(div, "Article 1");
	expect(title).not.toBeNull();

	const title2 = queryByText(div, "Article 2");
	expect(title2).toBeNull();
});

test("articles post", async () => {
	// TODO: Creating and updating an article
});
