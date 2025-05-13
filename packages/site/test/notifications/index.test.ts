import { queryByText } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { ServerEvent } from "@torpor/build/server";
import { runTest } from "@torpor/build/test";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import notificationList from "../../src/lib/profile/notificationList";
import setUserToken from "../../src/lib/utils/setUserToken";
import mockFetch from "../mockFetch";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "notifications");
});

afterAll(() => {
	cleanUpSiteTest("notifications");
});

test("notifications get", async () => {
	mockFetch(fetch, notificationList("xxx-alice"));

	let ev = new ServerEvent(new Request(`http://localhost/profile/notifications`));
	setUserToken(ev.cookies, {
		url: "",
		username: "",
		name: "",
		image: "",
		token: "",
		code: "",
	});

	const response = await runTest(site, "/profile/notifications", ev);
	const html = await response.text();

	const div = document.createElement("div");
	div.innerHTML = html;

	const text = queryByText(div, "Someone commented on your post");
	expect(text).not.toBeNull();
});
