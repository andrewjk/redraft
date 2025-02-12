import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { feedTable } from "./feedTable";

// TODO: Separate out following/followedby user fields into a new table?

/**
 * The people we are following, who we will receive posts etc from
 */
export const followingTable = sqliteTable("following", {
	id: int().primaryKey({ autoIncrement: true }),
	// Whether they have approved us to follow them
	approved: int({ mode: "boolean" }).notNull(),
	url: text().notNull(),
	// The secret shared key that we use to communicate with this user
	shared_key: text().notNull(),
	name: text().notNull(),
	image: text().notNull(),
	bio: text().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const followingRelations = relations(followingTable, ({ many }) => ({
	posts: many(feedTable),
}));
