import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "./schema/index";

export type Database = BaseSQLiteDatabase<"async", any, typeof schema>;
export type DatabaseTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

let db: Database;

export default function database(): Database {
	// HACK: We can't call setDatabase from site.config because it's only
	// transformed (not bundled), so we're just setting globalThis.socialAdapter
	// and checking the db on every call for now
	// @ts-ignore
	db ??= globalThis.socialAdapter.database(schema);

	return db;
}

//export function setDatabase(adapter: Adapter) {
//	// @ts-ignore
//	globalThis.db = adapter.database(schema);
//}
