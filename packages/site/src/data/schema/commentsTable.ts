import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";
import { followedByTable } from "./followedByTable";
import { postsTable } from "./postsTable";

// Comments on our posts
export const commentsTable = sqliteTable("comments", {
	id: int().primaryKey({ autoIncrement: true }),
	user_id: int().references(() => followedByTable.id),
	post_id: int()
		.notNull()
		.references(() => postsTable.id),
	// 1 level deep only
	parent_id: int(),
	// For permalinking
	slug: text().notNull(),
	text: text().notNull(),
	blocked_at: int({ mode: "timestamp" }),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const commentsRelations = relations(commentsTable, ({ one }) => ({
	user: one(followedByTable, { fields: [commentsTable.user_id], references: [followedByTable.id] }),
	post: one(postsTable, { fields: [commentsTable.post_id], references: [postsTable.id] }),
}));

export const CommentSelectSchema = createSelectSchema(commentsTable);
export type Comment = InferOutput<typeof CommentSelectSchema>;
