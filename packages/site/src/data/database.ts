import { Adapter } from "@redsoc/adapter-core";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "./schema/index";

export default function database(): BaseSQLiteDatabase<"async", any, typeof schema> {
	// @ts-ignore
	return globalThis.db;
}

export function setDatabase(adapter: Adapter) {
	// @ts-ignore
	globalThis.db = adapter.database(schema);
}
