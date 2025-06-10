import { node } from "@torpor/adapter-node";
import { Site } from "@torpor/build";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import fs from "node:fs";
import { vi } from "vitest";
import * as schema from "../src/data/schema/index";
import testAdapter from "./testAdapter";

export async function prepareSiteTest(
	site: Site,
	dbname: string,
): Promise<LibSQLDatabase<typeof schema>> {
	site.adapter = node;
	await site.addRouteFolder("./src/routes");

	// Copy the database here and create a social adapter that gets it
	fs.copyFileSync("./test/data/testdata.db", `./test/data/${dbname}.db`);

	const adapter = testAdapter(`./test/data/${dbname}.db`);
	// @ts-ignore
	globalThis.socialAdapter = adapter;

	// Stub environment variables
	vi.stubEnv("JWT_SECRET", "blah");
	vi.stubEnv("SITE_LOCATION", "http://localhost/");

	global.fetch = vi.fn();

	return adapter.database(schema);
}

export function cleanUpSiteTest(dbname: string): void {
	const file = `./test/data/${dbname}.db`;
	if (fs.existsSync(file)) {
		fs.rmSync(file);
	}
}
