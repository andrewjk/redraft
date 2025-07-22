import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";
import { followedByTable } from "./followedByTable";
import { postsTable } from "./postsTable";

/**
 * Our posts
 */
export const postsQueueTable = sqliteTable("posts_queue", {
	id: int().primaryKey({ autoIncrement: true }),
	post_id: int()
		.notNull()
		.references(() => postsTable.id),
	user_id: int()
		.notNull()
		.references(() => followedByTable.id),
	url: text().notNull(),
	shared_key: text().notNull(),
	failure_count: int().notNull().default(0),
	retry_at: int({ mode: "timestamp" }),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
});

export const postsQueueRelations = relations(postsQueueTable, ({ one }) => ({
	post: one(postsTable, { fields: [postsQueueTable.post_id], references: [postsTable.id] }),
	user: one(followedByTable, {
		fields: [postsQueueTable.user_id],
		references: [followedByTable.id],
	}),
}));

export const PostsQueueSelectSchema = createSelectSchema(postsQueueTable);
export type PostsQueue = InferOutput<typeof PostsQueueSelectSchema>;
