import { queryByText } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { afterAll, beforeAll, expect, test } from "vitest";
import buildTestEvent from "../buildTestEvent";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

const site: Site = new Site();

beforeAll(async () => {
	await prepareSiteTest(site, "notifications");
});

afterAll(() => {
	cleanUpSiteTest("notifications");
});

test("notifications get", async () => {
	let ev = await buildTestEvent(`http://localhost/profile/notifications`, "xxx-alice");

	const response = await runTest(site, "/profile/notifications", ev);
	expect(response.status).toBe(200);

	const html = await response.text();

	const div = document.createElement("div");
	div.innerHTML = html;

	const text = queryByText(div, "Someone commented on your post");
	expect(text).not.toBeNull();
});
