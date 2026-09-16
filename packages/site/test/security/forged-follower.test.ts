import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { ServerEvent } from "@torpor/build/server";
import * as jose from "jose";
import { afterAll, beforeAll, test } from "vite-plus/test";
import * as schema from "../../src/data/schema";
import { FOLLOWER_POST_VISIBILITY } from "../../src/lib/constants";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";
import { expectErrorResponse } from "./helpers";

const site: Site = new Site();

beforeAll(async () => {
	const db = await prepareSiteTest(site, "security-forged-follower");

	// A post that only logged in followers should be able to see
	await db.insert(schema.postsTable).values({
		slug: "follower-post-1",
		text: "Here is a follower only post",
		visibility: FOLLOWER_POST_VISIBILITY,
		published_at: new Date(),
		created_at: new Date(),
		updated_at: new Date(),
	});
});

afterAll(() => {
	cleanUpSiteTest("security-forged-follower");
});

// The follower claims are entirely made up, and the token is signed with a
// secret only the attacker knows. No record matching this follower exists in
// the followedBy table.
async function forgedFollowerHeader() {
	const secret = new TextEncoder().encode("attacker-secret");
	const token = await new jose.SignJWT({
		follower: {
			url: "http://evil.example/",
			name: "Evil Eve",
			image: "eve.png",
		},
	})
		.setProtectedHeader({ alg: "HS256" })
		.sign(secret);
	return { "X-Social-Follower": token };
}

test("a follower only post is not visible without any credentials", async () => {
	const request = new Request("http://localhost/posts/follower-post-1");
	const response = await runTest(site, "/posts/follower-post-1", new ServerEvent(request));
	expectErrorResponse(response, 404);
});

test("a forged follower header does not unlock follower only posts", async () => {
	const headers = await forgedFollowerHeader();
	const request = new Request("http://localhost/posts/follower-post-1", { headers });
	const response = await runTest(site, "/posts/follower-post-1", new ServerEvent(request));
	expectErrorResponse(response, 404);
});
