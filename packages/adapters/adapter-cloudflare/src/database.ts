/// <reference types="@cloudflare/workers-types" />
import { DrizzleD1Database, drizzle } from "drizzle-orm/d1";

export interface Env {
	DB: D1Database;
}

export default function database<TSchema extends Record<string, unknown>>(
	schema: TSchema,
): DrizzleD1Database<TSchema> {
	return drizzle(
		// @ts-ignore: TODO: expose adapter ambiently
		globalThis.adapter.env.DB,
		{ schema },
	);
}
