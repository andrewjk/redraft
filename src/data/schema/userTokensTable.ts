import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";
import { usersTable } from "./usersTable";

/**
 * Tokens for users who have logged in
 */
export const userTokensTable = sqliteTable("user_tokens", {
	id: int().primaryKey({ autoIncrement: true }),
	code: text().notNull(),
	user_id: int()
		.notNull()
		.references(() => usersTable.id),
	expires_at: int({ mode: "timestamp" }).notNull(),
});

export const userTokensRelations = relations(userTokensTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [userTokensTable.user_id],
		references: [usersTable.id],
	}),
}));

export const UserTokenSelectSchema = createSelectSchema(userTokensTable);
export type UserToken = InferOutput<typeof UserTokenSelectSchema>;
