import type { Adapter } from "@redraft/adapter-core";
import { LibSQLDatabase, drizzle } from "drizzle-orm/libsql";

export default function testAdapter(file: string): Adapter {
	const testAdapter: Adapter = {
		database: function database<TSchema extends Record<string, unknown>>(
			schema: TSchema,
		): LibSQLDatabase<TSchema> {
			return drizzle(`file:${file}`, { schema });
		},
	};
	return testAdapter;
}
