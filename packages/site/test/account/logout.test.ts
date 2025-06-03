import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { eq } from "drizzle-orm";
import { type LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import accountLogout from "../../src/lib/account/accountLogout";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "logout");
});

afterAll(() => {
	cleanUpSiteTest("logout");
});

test("logout post", async () => {
	let code = await findCode("xxx-alice");
	expect(code).not.toBeUndefined();

	const response = await accountLogout("xxx-alice");
	expect(response.status).toBe(200);

	code = await findCode("xxx-alice");
	expect(code).toBeUndefined();
});

async function findCode(code: string) {
	return await db.query.userTokensTable.findFirst({
		where: eq(schema.userTokensTable.code, code),
	});
}
