import type { Adapter } from "@redraft/adapter-core";
import { ok } from "@torpor/build/response";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import { LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";

export default function testAdapter(file: string): Adapter {
	const testAdapter: Adapter = {
		database: function database<TSchema extends Record<string, unknown>>(
			schema: TSchema,
		): LibSQLDatabase<TSchema> {
			return drizzle(`file:${file}`, { schema });
		},
		transaction: async function transaction<TSchema extends Record<string, unknown>>(
			db: LibSQLDatabase<TSchema>,
			fn: (
				tx: SQLiteTransaction<"async", any, TSchema, ExtractTablesWithRelations<TSchema>>,
			) => Promise<unknown>,
		): Promise<unknown> {
			return await db.transaction(fn);
		},
		storage: {
			uploadFile: async (_file: File, _name: string): Promise<void> => {},
			deleteFile: async (_name: string): Promise<void> => {},
			getFile: async (_name: string): Promise<Response> => {
				return ok();
			},
		},
		images: {
			getImage: async (_name: string, _width: number, _height: number): Promise<Response> => {
				return ok();
			},
		},
	};
	return testAdapter;
}
