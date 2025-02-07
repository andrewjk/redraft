import { blob, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";

// There is only going to be one user in this table (for now, at least) and it's us
export const usersTable = sqliteTable("users", {
	id: int().primaryKey({ autoIncrement: true }),
	email: text().notNull().unique(),
	username: text().notNull(),
	password: text().notNull(),
	name: text().notNull(),
	bio: text().notNull(),
	image: text().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const UserSelectSchema = createSelectSchema(usersTable);
export const UserInsertSchema = createInsertSchema(usersTable);
export const UserUpdateSchema = createUpdateSchema(usersTable);

export type User = InferOutput<typeof UserSelectSchema>;
export type UserInsert = InferOutput<typeof UserInsertSchema>;
export type UserUpdate = InferOutput<typeof UserUpdateSchema>;

// TODO: Separate out following/followedby user fields into a new table

// The people we are following, who we will receive posts etc from
export const followingTable = sqliteTable("following", {
	id: int().primaryKey({ autoIncrement: true }),
	// Whether they have approved us to follow them
	approved: int({ mode: "boolean" }).notNull(),
	username: text().notNull(),
	url: text().notNull(),
	// The secret shared key that we use to communicate with this user
	shared_key: text().notNull(),
	name: text().notNull(),
	image: text().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

// The people we are followed by, who we will send posts etc to
export const followedByTable = sqliteTable("followed_by", {
	id: int().primaryKey({ autoIncrement: true }),
	// Whether they've been approved to follow -- everyone starts off by sending us a request
	approved: int({ mode: "boolean" }).notNull(),
	username: text().notNull(),
	url: text().notNull(),
	// The secret shared key that we use to communicate with this user
	shared_key: text().notNull(),
	name: text().notNull(),
	image: text().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

// Our posts
export const postsTable = sqliteTable("posts", {
	id: int().primaryKey({ autoIncrement: true }),
	slug: text().notNull(),
	text: text().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const PostSelectSchema = createSelectSchema(postsTable);
export const PostInsertSchema = createInsertSchema(postsTable);
export const PostUpdateSchema = createUpdateSchema(postsTable);

export type Post = InferOutput<typeof PostSelectSchema>;
export type PostInsert = InferOutput<typeof PostInsertSchema>;
export type PostUpdate = InferOutput<typeof PostUpdateSchema>;

// Posts from people we are following
export const feedTable = sqliteTable("feed", {
	id: int().primaryKey({ autoIncrement: true }),
	user_id: int().notNull(),
	slug: text().notNull(),
	text: text().notNull(),
	liked: int({ mode: "boolean" }).notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

// Images etc
export const contentTable = sqliteTable("content", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	type: text().notNull(),
	content: blob().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});
