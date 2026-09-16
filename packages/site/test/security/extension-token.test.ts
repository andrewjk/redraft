import { Site } from "@torpor/build";
import * as jose from "jose";
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import extensionLoad from "../../src/lib/extension/extensionLoad";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

const site: Site = new Site();

beforeAll(async () => {
	await prepareSiteTest(site, "security-extension-token");
});

afterAll(() => {
	cleanUpSiteTest("security-extension-token");
});

// Eli's shared key, as seeded in testdata.db
const ELI_SHARED_KEY = "yyy-eli";

test("extension follower tokens do not embed the shared key", async () => {
	// The tokens the extension stores and sends as X-Social-Follower on every
	// request to the followed site. They are decoded (never verified) by the
	// receiver, so anything in the claims is effectively plaintext to anyone
	// who can observe the header
	const response = await extensionLoad("xxx-alice");
	expect(response.status).toBe(200);

	const data: { following: { token: string }[] } = await response.json();
	expect(data.following.length).toBeGreaterThan(0);

	for (const following of data.following) {
		const claims = jose.decodeJwt(following.token);
		expect(JSON.stringify(claims)).not.toContain(ELI_SHARED_KEY);
	}
});
