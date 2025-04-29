import { Adapter } from "@redsoc/adapter-core";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "./schema/index";

export default function database(): BaseSQLiteDatabase<"async", any, typeof schema> {
	// HACK: Can't call setDatabase from site.config because it's only
	// transformed (not bundled), so we're just setting globalThis.adapter and
	// checking the db on every call for now
	// @ts-ignore
	globalThis.db ??= globalThis.adapter.database(schema);

	// @ts-ignore
	return globalThis.db;
}

export function setDatabase(adapter: Adapter) {
	// @ts-ignore
	globalThis.db = adapter.database(schema);
}
