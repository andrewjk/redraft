import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";
import { postsTable } from "./postsTable";

/**
 * Our articles. Each article is published with a post to handle comments, reactions etc
 */
export const articlesTable = sqliteTable("articles", {
	id: int().primaryKey({ autoIncrement: true }),
	slug: text().notNull(),
	title: text().notNull(),
	text: text().notNull(),
	description: text().notNull(),
	post_id: int().notNull().default(-1),
	published_at: int({ mode: "timestamp" }),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const articlesRelations = relations(articlesTable, ({ one }) => ({
	post: one(postsTable, { fields: [articlesTable.post_id], references: [postsTable.id] }),
}));

export const ArticleSelectSchema = createSelectSchema(articlesTable);
export type Article = InferOutput<typeof ArticleSelectSchema>;
