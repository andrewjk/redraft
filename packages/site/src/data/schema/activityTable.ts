import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";

/**
 * Activity
 */
export const activityTable = sqliteTable("activity", {
	id: int().primaryKey({ autoIncrement: true }),
	url: text().notNull(),
	text: text().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const ActivitySelectSchema = createSelectSchema(activityTable);
export type Activity = InferOutput<typeof ActivitySelectSchema>;
