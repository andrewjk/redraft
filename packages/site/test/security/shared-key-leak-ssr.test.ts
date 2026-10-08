import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { ServerEvent } from "@torpor/build/server";
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import createUserToken from "../../src/lib/utils/createUserToken";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

const site: Site = new Site();

beforeAll(async () => {
	await prepareSiteTest(site, "security-shared-key-leak");
	await site.addRouteFolder("./src/api", "/api");
});

afterAll(() => {
	cleanUpSiteTest("security-shared-key-leak");
});

// Eli's shared key, as seeded in testdata.db -- the secret that authenticates
// posts from Eli to this site
const ELI_SHARED_KEY = "yyy-eli";

test("the feed api does not expose shared keys to the browser", async () => {
	const token = await createUserToken(
		{ url: "http://localhost/alice/", username: "alice", name: "Alice X" },
		"xxx-alice",
	);
	const request = new Request("http://localhost/api/feed", {
		headers: { Authorization: `Token ${token}` },
	});
	const response = await runTest(site, "/api/feed", new ServerEvent(request));
	expect(response.status).toBe(200);

	const data = await response.json();
	expect(JSON.stringify(data)).not.toContain(ELI_SHARED_KEY);
});
