import { queryByText } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { afterAll, beforeAll, expect, test } from "vitest";
import buildTestEvent from "../buildTestEvent";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

const site: Site = new Site();

beforeAll(async () => {
	await prepareSiteTest(site, "media-drafts");
});

afterAll(() => {
	cleanUpSiteTest("media-drafts");
});

test("media drafts get", async () => {
	let ev = await buildTestEvent(`http://localhost/media/drafts`, "xxx-alice");

	const response = await runTest(site, "/media/drafts", ev);
	expect(response.status).toBe(200);

	const html = await response.text();

	const div = document.createElement("div");
	div.innerHTML = html;

	const text = queryByText(div, "Here is a picture");
	expect(text).toBeNull();

	const text2 = queryByText(div, "Here is a draft picture");
	expect(text2).not.toBeNull();
});

test("media drafts get with bad code", async () => {
	let ev = await buildTestEvent(`http://localhost/media/drafts`, "xxx-bob");

	//const response = await runTest(site, "/media/drafts", ev);
	//expect(response.status).toBe(401);

	await expect(runTest(site, "/media", ev)).rejects.toThrowError("401");
});
