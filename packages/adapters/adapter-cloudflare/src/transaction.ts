/// <reference types="@cloudflare/workers-types" />
import { DrizzleD1Database } from "drizzle-orm/d1";

export default async function transaction<TSchema extends Record<string, unknown>>(
	db: DrizzleD1Database<TSchema>,
	fn: (db: DrizzleD1Database<TSchema>) => Promise<unknown>,
): Promise<unknown> {
	// D1 doesn't support transactions, so just run the function
	return await fn(db);
}
