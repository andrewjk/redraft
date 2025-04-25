import { blob, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Images etc
export const contentTable = sqliteTable("content", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	type: text().notNull(),
	content: blob().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});
