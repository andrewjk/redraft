import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";

/**
 * Event details, linked from the posts table when link_type = 2
 */
export const eventsTable = sqliteTable("events", {
	id: int().primaryKey({ autoIncrement: true }),
	text: text().notNull(),
	location: text(),
	starts_at: int({ mode: "timestamp" }).notNull(),
	duration: int(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const EventSelectSchema = createSelectSchema(eventsTable);
export type Event = InferOutput<typeof EventSelectSchema>;
