import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";
import { commentsTable } from "./commentsTable";
import { postTagsTable } from "./postTagsTable";

/**
 * Our posts
 */
export const postsTable = sqliteTable("posts", {
	id: int().primaryKey({ autoIncrement: true }),
	slug: text().notNull(),
	text: text().notNull(),
	comment_count: int().notNull().default(0),
	last_comment_at: int({ mode: "timestamp" }),
	/** The number of people who have liked this post */
	like_count: int().notNull().default(0),
	/** The most popular emoji used to react to this post */
	emoji_first: text(),
	/** The second most popular emoji used to react to this post */
	emoji_second: text(),
	/** The third most popular emoji used to react to this post */
	emoji_third: text(),
	/**
	 * The post visibility, which affects who can see it and who it is sent to
	 * 0 = public
	 * 1 = followers
	 * 2 = private
	 * 3 = custom list
	 */
	visibility: int().notNull().default(0),
	/**
	 * The type of the post, which affects the way it is displayed
	 * 0 = normal
	 * 1 = image
	 * 2 = article
	 * 3 = link
	 */
	type: int().notNull().default(0),
	/** Image link for image, article or link */
	image: text(),
	/** Id for viewing the post with the article text */
	article_id: int(),
	/** Url for link */
	url: text(),
	/** Title for article or link */
	title: text(),
	/** Publication for link */
	publication: text(),
	/** Whether this post is pinned at the top of the list */
	pinned: int({ mode: "boolean" }).notNull().default(false),
	/** When this post was published, or null if it's still in draft */
	published_at: int({ mode: "timestamp" }),
	/** When this post was re-published, if applicable */
	republished_at: int({ mode: "timestamp" }),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const postsRelations = relations(postsTable, ({ many }) => ({
	comments: many(commentsTable),
	postTags: many(postTagsTable),
}));

export const PostSelectSchema = createSelectSchema(postsTable);
export type Post = InferOutput<typeof PostSelectSchema>;
