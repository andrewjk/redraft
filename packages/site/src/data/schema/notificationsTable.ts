import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";

/**
 * Notifications
 */
export const notificationsTable = sqliteTable("notifications", {
	id: int().primaryKey({ autoIncrement: true }),
	url: text().notNull(),
	text: text().notNull(),
	read: int({ mode: "boolean" }).notNull().default(false),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const NotificationSelectSchema = createSelectSchema(notificationsTable);
export type Notification = InferOutput<typeof NotificationSelectSchema>;
