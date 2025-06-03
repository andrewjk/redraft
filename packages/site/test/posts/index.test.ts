import { queryByText } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { afterAll, beforeAll, expect, test } from "vitest";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

const site: Site = new Site();

beforeAll(async () => {
	await prepareSiteTest(site, "posts");
});

afterAll(() => {
	cleanUpSiteTest("posts");
});

test("posts get", async () => {
	const response = await runTest(site, "/posts");
	expect(response.status).toBe(200);

	const html = await response.text();

	const div = document.createElement("div");
	div.innerHTML = html;

	const text = queryByText(div, "Here is a post");
	expect(text).not.toBeNull();

	const text2 = queryByText(div, "Here is a draft post");
	expect(text2).toBeNull();
});
