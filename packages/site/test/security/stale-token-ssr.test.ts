import { queryByText } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { ServerEvent } from "@torpor/build/server";
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import createUserToken from "../../src/lib/utils/createUserToken";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

const site: Site = new Site();

beforeAll(async () => {
	await prepareSiteTest(site, "security-stale-token");
});

afterAll(() => {
	cleanUpSiteTest("security-stale-token");
});

// A genuinely signed token, but whose code doesn't match a record in the
// database. This is what a cookie looks like when the database was recreated,
// or when a token has expired or been revoked.
async function staleTokenEvent(path: string) {
	const token = await createUserToken(
		{ url: "http://localhost/alice/", username: "alice", name: "Alice X" },
		"stale-alice",
	);
	const ev = new ServerEvent(new Request(`http://localhost${path}`));
	ev.cookies.set("jwt", token, { path: "/" });
	return ev;
}

test("a stale cookie shows the setup page", async () => {
	const ev = await staleTokenEvent("/account/setup");
	const response = await runTest(site, "/account/setup", ev);
	expect(response.status).toBe(200);

	const html = await response.text();

	const div = document.createElement("div");
	div.innerHTML = html;

	const title = queryByText(div, "Username");
	expect(title).not.toBeNull();
});

test("a stale cookie shows the login page", async () => {
	const ev = await staleTokenEvent("/account/login");
	const response = await runTest(site, "/account/login", ev);
	expect(response.status).toBe(200);

	const html = await response.text();

	const div = document.createElement("div");
	div.innerHTML = html;

	const title = queryByText(div, "Remember me");
	expect(title).not.toBeNull();
});

test("a valid cookie still redirects to the feed", async () => {
	const token = await createUserToken(
		{ url: "http://localhost/alice/", username: "alice", name: "Alice X" },
		"xxx-alice",
	);
	const request = new Request("http://localhost/account/login");
	const ev = new ServerEvent(request);
	ev.cookies.set("jwt", token, { path: "/" });
	const response = await runTest(site, "/account/login", ev);
	expect(response.status).toBe(303);
});
