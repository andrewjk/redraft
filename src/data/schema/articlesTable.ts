import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";

/**
 * Article text, linked from the posts table when the post type is ARTICLE_POST
 */
export const articlesTable = sqliteTable("articles", {
	id: int().primaryKey({ autoIncrement: true }),
	text: text().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const ArticleSelectSchema = createSelectSchema(articlesTable);
export type Article = InferOutput<typeof ArticleSelectSchema>;
