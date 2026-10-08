import { queryByText } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import buildTestEvent from "../buildTestEvent";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

const site: Site = new Site();

beforeAll(async () => {
	await prepareSiteTest(site, "post-drafts");
});

afterAll(() => {
	cleanUpSiteTest("post-drafts");
});

test("post drafts get", async () => {
	let ev = await buildTestEvent(`http://localhost/posts/drafts`, "xxx-alice");

	const response = await runTest(site, "/posts/drafts", ev);
	expect(response.status).toBe(200);

	const html = await response.text();

	const div = document.createElement("div");
	div.innerHTML = html;

	const text = queryByText(div, "Here is a post");
	expect(text).toBeNull();

	const text2 = queryByText(div, "Here is a draft post");
	expect(text2).not.toBeNull();
});

test("post drafts get with bad code", async () => {
	let ev = await buildTestEvent(`http://localhost/posts/drafts`, "xxx-bob");

	const response = await runTest(site, "/posts/drafts", ev);
	// Torpor renders the error page in place (keeping the url) rather than
	// redirecting to /_error
	expect(response.status).toBe(401);
});
