import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";
import { commentsTable } from "./commentsTable";

export const TEXT_POST = 0;
export const IMAGE_POST = 1;
export const ARTICLE_POST = 2;
export const LINK_POST = 3;

/**
 * Our posts
 */
export const postsTable = sqliteTable("posts", {
	id: int().primaryKey({ autoIncrement: true }),
	slug: text().notNull(),
	text: text().notNull(),
	comment_count: int().notNull().default(0),
	last_comment_at: int({ mode: "timestamp" }),
	like_count: int().notNull().default(0),
	save_count: int().notNull().default(0),
	/**
	 * The type of the post, which affects the way it is displayed
	 * 0 = normal
	 * 1 = image
	 * 2 = article
	 * 3 = link
	 */
	type: int().notNull().default(0),
	/** Image link for image */
	image: text(),
	/** Id for viewing the post with the article */
	article_id: int(),
	/** Url link for article */
	url: text(),
	/** Title for article */
	title: text(),
	/** Whether this post is pinned at the top of the list */
	pinned: int({ mode: "boolean" }).notNull().default(false),
	/** When this post was published, or null if it's still in draft */
	published_at: int({ mode: "timestamp" }),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const postsRelations = relations(postsTable, ({ many }) => ({
	comments: many(commentsTable),
}));

export const PostSelectSchema = createSelectSchema(postsTable);
export type Post = InferOutput<typeof PostSelectSchema>;
