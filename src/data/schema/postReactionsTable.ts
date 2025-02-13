import { relations } from "drizzle-orm";
import { int, sqliteTable } from "drizzle-orm/sqlite-core";
import { followedByTable } from "./followedByTable";
import { postsTable } from "./postsTable";

// TODO: This table could get huge...
// Maybe we should purge and lock reactions after 30 days or so?

/**
 * Reactions (likes/emojis) to our posts
 */
export const postReactionsTable = sqliteTable("post_reactions", {
	id: int().primaryKey({ autoIncrement: true }),
	post_id: int()
		.notNull()
		.references(() => postsTable.id),
	user_id: int()
		.notNull()
		.references(() => followedByTable.id),
	liked: int({ mode: "boolean" }).notNull().default(false),
	created_at: int({ mode: "timestamp" }).notNull(),
});

export const postReactionsRelations = relations(postReactionsTable, ({ one }) => ({
	post: one(postsTable, { fields: [postReactionsTable.post_id], references: [postsTable.id] }),
	user: one(followedByTable, {
		fields: [postReactionsTable.user_id],
		references: [followedByTable.id],
	}),
}));
