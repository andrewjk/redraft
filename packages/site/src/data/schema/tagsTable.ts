import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";
import { postTagsTable } from "./postTagsTable";

/**
 * Tags for posts
 */
export const tagsTable = sqliteTable("tags", {
	id: int().primaryKey({ autoIncrement: true }),
	slug: text().notNull(),
	text: text().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const tagsRelations = relations(tagsTable, ({ many }) => ({
	postTags: many(postTagsTable),
}));

export const TagSelectSchema = createSelectSchema(tagsTable);
export type Tag = InferOutput<typeof TagSelectSchema>;
