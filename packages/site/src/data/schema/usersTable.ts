import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";

/**
 * There is only one user in this table (for now, at least) and it's us
 */
export const usersTable = sqliteTable("users", {
	id: int().primaryKey({ autoIncrement: true }),
	email: text().notNull().unique(),
	username: text().notNull(),
	url: text().notNull(),
	password: text().notNull(),
	name: text().notNull(),
	bio: text().notNull(),
	location: text().notNull(),
	about: text().notNull().default(""),
	image: text().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

/**
 * Links entered by the user to external websites
 */
export const userLinksTable = sqliteTable("user_links", {
	id: int().primaryKey({ autoIncrement: true }),
	user_id: int()
		.notNull()
		.references(() => usersTable.id),
	text: text().notNull().unique(),
	url: text().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
	links: many(userLinksTable),
}));

export const userLinksRelations = relations(userLinksTable, ({ one }) => ({
	user: one(usersTable, { fields: [userLinksTable.user_id], references: [usersTable.id] }),
}));

export const UserSelectSchema = createSelectSchema(usersTable);
export type User = InferOutput<typeof UserSelectSchema>;

export const UserLinkSelectSchema = createSelectSchema(userLinksTable);
export type UserLink = InferOutput<typeof UserLinkSelectSchema>;
