import { relations } from "drizzle-orm";
import { int, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";
import { postsTable } from "./postsTable";
import { tagsTable } from "./tagsTable";

/**
 * Many to many table for posts and tags
 */
export const postTagsTable = sqliteTable(
	"post_tags",
	{
		post_id: int()
			.notNull()
			.references(() => postsTable.id),
		tag_id: int()
			.notNull()
			.references(() => tagsTable.id),
		deleted_at: int({ mode: "timestamp" }),
	},
	(t) => [primaryKey({ columns: [t.post_id, t.tag_id] })],
);

export const postTagsRelations = relations(postTagsTable, ({ one }) => ({
	post: one(postsTable, {
		fields: [postTagsTable.post_id],
		references: [postsTable.id],
	}),
	tag: one(tagsTable, {
		fields: [postTagsTable.tag_id],
		references: [tagsTable.id],
	}),
}));

export const PostTagSelectSchema = createSelectSchema(postTagsTable);
export type PostTag = InferOutput<typeof PostTagSelectSchema>;
