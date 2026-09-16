import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { ServerEvent } from "@torpor/build/server";
import * as jose from "jose";
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import { expectErrorResponse } from "./helpers";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

const site: Site = new Site();

beforeAll(async () => {
	await prepareSiteTest(site, "security-forged-user");
	await site.addRouteFolder("./src/api", "/api");
});

afterAll(() => {
	cleanUpSiteTest("security-forged-user");
});

// The token's claims are valid, but it is signed with a secret only the
// attacker knows. Any signature verification would reject it.
async function forgedToken() {
	const secret = new TextEncoder().encode("attacker-secret");
	return await new jose.SignJWT({
		user: {
			url: "http://localhost/alice/",
			username: "alice",
			name: "Alice X",
			code: "xxx-alice",
		},
	})
		.setProtectedHeader({ alg: "HS256" })
		.sign(secret);
}

test("api accepts a user token signed with the wrong secret", async () => {
	const token = await forgedToken();
	const request = new Request("http://localhost/api/feed", {
		headers: { Authorization: `Token ${token}` },
	});
	const response = await runTest(site, "/api/feed", new ServerEvent(request));
	expectErrorResponse(response, 401);
});

test("a base64 json cookie impersonates a logged in user", async () => {
	// The jwt cookie is just the user object, base64 encoded -- no signature.
	// This is exactly what a real login sets, crafted by hand. The token is
	// self-signed by the attacker; it works because tokens are never verified
	const token = await forgedToken();
	const value = Buffer.from(
		JSON.stringify({
			url: "http://localhost/alice/",
			username: "alice",
			name: "Alice X",
			image: "alice.png",
			token,
			code: "xxx-alice",
		}),
	).toString("base64");
	const request = new Request("http://localhost/notifications");
	const ev = new ServerEvent(request);
	ev.cookies.set("jwt", value, { path: "/" });
	const response = await runTest(site, "/notifications", ev);
	expect(response.status).toBe(303);
});
