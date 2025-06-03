import { queryByText } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { afterAll, beforeAll, expect, test } from "vitest";
import buildTestEvent from "../buildTestEvent";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

const site: Site = new Site();

beforeAll(async () => {
	await prepareSiteTest(site, "article-drafts");
});

afterAll(() => {
	cleanUpSiteTest("article-drafts");
});

test("article drafts get", async () => {
	let ev = await buildTestEvent(`http://localhost/articles/drafts`, "xxx-alice");

	const response = await runTest(site, "/articles/drafts", ev);
	expect(response.status).toBe(200);

	const html = await response.text();

	const div = document.createElement("div");
	div.innerHTML = html;

	const title = queryByText(div, "Article 1");
	expect(title).toBeNull();

	const title2 = queryByText(div, "Article 2");
	expect(title2).not.toBeNull();
});

test("article drafts get with bad code", async () => {
	let ev = await buildTestEvent(`http://localhost/articles/drafts`, "xxx-bob");

	//const response = await runTest(site, "/articles/drafts", ev);
	//expect(response.status).toBe(401);

	await expect(runTest(site, "/articles/drafts", ev)).rejects.toThrowError("401");
});
