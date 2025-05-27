/// <reference types="@cloudflare/workers-types" />
import { DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import env from "./env";

export default function database<TSchema extends Record<string, unknown>>(
	schema: TSchema,
): DrizzleD1Database<TSchema> {
	return drizzle(env().DB, { schema });
}
