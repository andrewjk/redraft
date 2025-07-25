import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";
import { listUsersTable } from "./listUsersTable";

// Lists of followers to send posts to
export const listsTable = sqliteTable("lists", {
	id: int().primaryKey({ autoIncrement: true }),
	slug: text().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	/**
	 * The list visibility, which affects who can see and (TODO:) subscribe to it
	 * 0 = private
	 * 1 = followers
	 * 2 = public
	 */
	visibility: int().notNull().default(0),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const listsRelations = relations(listsTable, ({ many }) => ({
	users: many(listUsersTable),
}));

export const ListSelectSchema = createSelectSchema(listsTable);
export type List = InferOutput<typeof ListSelectSchema>;
