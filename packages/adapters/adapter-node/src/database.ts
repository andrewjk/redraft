import { LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import env from "./env";

export default function database<TSchema extends Record<string, unknown>>(
	schema: TSchema,
): LibSQLDatabase<TSchema> {
	return drizzle(env().DB_CONNECTION, { schema });
}
