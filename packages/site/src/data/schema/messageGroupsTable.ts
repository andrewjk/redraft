import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";
import { followedByTable } from "./followedByTable";
import { followingTable } from "./followingTable";
import { messagesTable } from "./messagesTable";

// Messages sent between followers and followees
// Either one can send a message to the other
export const messageGroupsTable = sqliteTable("message_groups", {
	id: int().primaryKey({ autoIncrement: true }),
	/** For sharing */
	slug: text().notNull(),
	/** The id of the follower, if it is between us and a follower */
	followed_by_id: int().references(() => followedByTable.id),
	/** The id of the followee, if it was between us and someone we're following */
	following_id: int().references(() => followingTable.id),
	newest_id: int(), //.references(() => messagesTable.id),
	newest_sent: int({ mode: "boolean" }).notNull(),
	newest_at: int({ mode: "timestamp" }).notNull(),
	unread_count: int().notNull().default(0),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const messageGroupsRelations = relations(messageGroupsTable, ({ one, many }) => ({
	followedBy: one(followedByTable, {
		fields: [messageGroupsTable.followed_by_id],
		references: [followedByTable.id],
	}),
	following: one(followingTable, {
		fields: [messageGroupsTable.following_id],
		references: [followingTable.id],
	}),
	newest: one(messagesTable, {
		fields: [messageGroupsTable.newest_id],
		references: [messagesTable.id],
	}),
	messages: many(messagesTable),
}));

export const MessageSelectSchema = createSelectSchema(messagesTable);
export type Message = InferOutput<typeof MessageSelectSchema>;
