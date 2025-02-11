import { relations } from "drizzle-orm";
import { blob, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
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

export const followingRelations = relations(followingTable, ({ many }) => ({
	posts: many(feedTable),
}));

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

export const FollowedBySelectSchema = createSelectSchema(followedByTable);
export type FollowedBy = InferOutput<typeof FollowedBySelectSchema>;

// Our posts
export const postsTable = sqliteTable("posts", {
	id: int().primaryKey({ autoIncrement: true }),
	slug: text().notNull(),
	text: text().notNull(),
	comment_count: int().notNull().default(0),
	last_comment_at: int({ mode: "timestamp" }),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const postsRelations = relations(postsTable, ({ many }) => ({
	comments: many(commentsTable),
}));

export const PostSelectSchema = createSelectSchema(postsTable);
export type Post = InferOutput<typeof PostSelectSchema>;

// Comments on our posts
export const commentsTable = sqliteTable("comments", {
	id: int().primaryKey({ autoIncrement: true }),
	user_id: int().references(() => followedByTable.id),
	post_id: int()
		.notNull()
		.references(() => postsTable.id),
	// 1 level deep only
	parent_id: int(),
	// For permalinking
	slug: text().notNull(),
	text: text().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const commentsRelations = relations(commentsTable, ({ one }) => ({
	user: one(followedByTable, { fields: [commentsTable.user_id], references: [followedByTable.id] }),
	post: one(postsTable, { fields: [commentsTable.post_id], references: [postsTable.id] }),
}));

export const CommentSelectSchema = createSelectSchema(commentsTable);
export type Comment = InferOutput<typeof CommentSelectSchema>;

// Posts from people we are following
export const feedTable = sqliteTable("feed", {
	id: int().primaryKey({ autoIncrement: true }),
	// HACK: Can't update to a nullable foreign key column?
	user_id: int(), //.references(() => followingTable.id),
	slug: text().notNull(),
	text: text().notNull(),
	comment_count: int().notNull().default(0),
	last_comment_at: int({ mode: "timestamp" }),
	liked: int({ mode: "boolean" }).notNull().default(false),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const feedRelations = relations(feedTable, ({ one }) => ({
	user: one(followingTable, { fields: [feedTable.user_id], references: [followingTable.id] }),
}));

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
