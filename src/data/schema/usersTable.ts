import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";

// There is only going to be one user in this table (for now, at least) and it's us
export const usersTable = sqliteTable("users", {
	id: int().primaryKey({ autoIncrement: true }),
	email: text().notNull().unique(),
	username: text().notNull(),
	url: text().notNull(),
	password: text().notNull(),
	name: text().notNull(),
	bio: text().notNull(),
	image: text().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const UserSelectSchema = createSelectSchema(usersTable);
export type User = InferOutput<typeof UserSelectSchema>;
