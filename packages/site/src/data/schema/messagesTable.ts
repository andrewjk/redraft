import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";
import { messageGroupsTable } from "./messageGroupsTable";

//import { followedByTable } from "./followedByTable";
//import { followingTable } from "./followingTable";

// Messages sent between followers and followees
// Either one can send a message to the other
export const messagesTable = sqliteTable("messages", {
	id: int().primaryKey({ autoIncrement: true }),
	group_id: int().references(() => messageGroupsTable.id),
	/** Was this message sent by us? */
	sent: int({ mode: "boolean" }).notNull().default(false),
	text: text().notNull(),
	read: int({ mode: "boolean" }).notNull().default(false),
	delivered: int({ mode: "boolean" }).notNull().default(false),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const messagesRelations = relations(messagesTable, ({ one }) => ({
	group: one(messageGroupsTable, {
		fields: [messagesTable.group_id],
		references: [messageGroupsTable.id],
	}),
}));

export const MessageSelectSchema = createSelectSchema(messagesTable);
export type Message = InferOutput<typeof MessageSelectSchema>;
