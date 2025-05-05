import "@testing-library/jest-dom/vitest";
import { eq } from "drizzle-orm";
import fs from "node:fs";
import { afterAll, beforeAll, expect, test } from "vitest";
import * as schema from "../../src/data/schema/index";
import accountLogout from "../../src/lib/account/accountLogout";
import testAdapter from "../testAdapter";

const adapter = testAdapter("./test/data/logout.db");

beforeAll(() => {
	// Copy the database here and create a social adapter that gets it
	fs.copyFileSync("./test/data/filled.db", "./test/data/logout.db");
	// @ts-ignore
	globalThis.socialAdapter = adapter;
});

afterAll(() => {
	fs.rmSync("./test/data/logout.db");
});

test("logout", async () => {
	let code = await findCode("xxx-alice");
	expect(code).not.toBeUndefined();

	const response = await accountLogout("xxx-alice");
	expect(response.status).toBe(200);

	code = await findCode("xxx-alice");
	expect(code).toBeUndefined();
});

async function findCode(code: string) {
	const db = adapter.database(schema);
	return await db.query.userTokensTable.findFirst({
		where: eq(schema.userTokensTable.code, code),
	});
}
