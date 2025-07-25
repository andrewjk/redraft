import { relations } from "drizzle-orm";
import { int, sqliteTable } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";
import { followedByTable } from "./followedByTable";
import { listsTable } from "./listsTable";

export const listUsersTable = sqliteTable("list_users", {
	id: int().primaryKey({ autoIncrement: true }),
	list_id: int().references(() => listsTable.id),
	user_id: int().references(() => followedByTable.id),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const listUsersRelations = relations(listUsersTable, ({ one }) => ({
	list: one(listsTable, { fields: [listUsersTable.list_id], references: [listsTable.id] }),
	user: one(followedByTable, {
		fields: [listUsersTable.user_id],
		references: [followedByTable.id],
	}),
}));

export const ListUserSelectSchema = createSelectSchema(listUsersTable);
export type ListUser = InferOutput<typeof ListUserSelectSchema>;
