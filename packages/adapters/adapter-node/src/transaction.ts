import type { ExtractTablesWithRelations } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";

export default async function transaction<TSchema extends Record<string, unknown>>(
	db: LibSQLDatabase<TSchema>,
	fn: (
		tx: SQLiteTransaction<"async", any, TSchema, ExtractTablesWithRelations<TSchema>>,
	) => Promise<unknown>,
): Promise<unknown> {
	return await db.transaction(fn);
}
