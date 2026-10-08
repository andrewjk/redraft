import { eq } from "drizzle-orm";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { ServerEvent } from "@torpor/build/server";
import { afterAll, beforeAll, test } from "vite-plus/test";
import createUserToken from "../../src/lib/utils/createUserToken";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";
import { expectErrorResponse } from "./helpers";

const site: Site = new Site();

beforeAll(async () => {
	const db = await prepareSiteTest(site, "security-expired-token");
	await site.addRouteFolder("./src/api", "/api");

	// Expire alice's token an hour ago
	await db
		.update(schema.userTokensTable)
		.set({ expires_at: new Date(Date.now() - 1000 * 60 * 60) })
		.where(eq(schema.userTokensTable.code, "xxx-alice"));
});

afterAll(() => {
	cleanUpSiteTest("security-expired-token");
});

import * as schema from "../../src/data/schema";

test("an expired token does not grant api access", async () => {
	// A genuinely signed token, created the normal way -- but expired
	const token = await createUserToken(
		{ url: "http://localhost/alice/", username: "alice", name: "Alice X" },
		"xxx-alice",
	);
	const request = new Request("http://localhost/api/feed", {
		headers: { Authorization: `Token ${token}` },
	});
	const response = await runTest(site, "/api/feed", new ServerEvent(request));
	expectErrorResponse(response, 401);
});
