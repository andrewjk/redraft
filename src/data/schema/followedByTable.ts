import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";

// TODO: Separate out following/followedby user fields into a new table?

// The people we are followed by, who we will send posts etc to
export const followedByTable = sqliteTable("followed_by", {
	id: int().primaryKey({ autoIncrement: true }),
	// Whether they've been approved to follow -- everyone starts off by sending us a request
	approved: int({ mode: "boolean" }).notNull(),
	url: text().notNull(),
	// The secret shared key that we use to communicate with this user
	shared_key: text().notNull(),
	name: text().notNull(),
	image: text().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const FollowedBySelectSchema = createSelectSchema(followedByTable);
export type FollowedBy = InferOutput<typeof FollowedBySelectSchema>;
