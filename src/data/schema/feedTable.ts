import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";
import { followingTable } from "./followingTable";

/**
 * Posts from people we are following
 */
export const feedTable = sqliteTable("feed", {
	id: int().primaryKey({ autoIncrement: true }),
	// HACK: Can't update to a nullable foreign key column?
	user_id: int(), //.references(() => followingTable.id),
	slug: text().notNull(),
	text: text().notNull(),
	comment_count: int().notNull().default(0),
	last_comment_at: int({ mode: "timestamp" }),
	/**
	 * The type of the post, which affects the way it is displayed
	 * 0 = normal
	 * 1 = image
	 * 2 = article
	 * 3 = link
	 */
	type: int().notNull().default(0),
	/** Image/article/link etc fields */
	url: text().notNull().default(""),
	title: text().notNull().default(""),
	/** Whether this feed item has been liked */
	liked: int({ mode: "boolean" }).notNull().default(false),
	/** Whether this feed item has been saved */
	saved: int({ mode: "boolean" }).notNull().default(false),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const FeedSelectSchema = createSelectSchema(feedTable);
export type Feed = InferOutput<typeof FeedSelectSchema>;

export const feedRelations = relations(feedTable, ({ one }) => ({
	user: one(followingTable, { fields: [feedTable.user_id], references: [followingTable.id] }),
}));
