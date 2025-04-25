import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";
import { followingTable } from "./followingTable";

/**
 * Posts from people we are following
 */
export const feedTable = sqliteTable("feed", {
	id: int().primaryKey({ autoIncrement: true }),
	// HACK: Can't update to a nullable foreign key column?
	user_id: int(), //.references(() => followingTable.id),
	slug: text().notNull(),
	text: text().notNull(),
	comment_count: int().notNull().default(0),
	last_comment_at: int({ mode: "timestamp" }),
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
	/** Image link for image */
	image: text(),
	/** Url for link */
	url: text(),
	/** Title for article or link */
	title: text(),
	/** Publication for link */
	publication: text(),
	/** When this post was published */
	published_at: int({ mode: "timestamp" }).notNull(),
	/** When this post was re-published, if applicable */
	republished_at: int({ mode: "timestamp" }),
	/** Whether this feed item has been liked */
	liked: int({ mode: "boolean" }).notNull().default(false),
	/** Whether this feed item has been saved */
	saved: int({ mode: "boolean" }).notNull().default(false),
	/** The emoji used to react to this post */
	emoji: text(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const FeedSelectSchema = createSelectSchema(feedTable);
export type Feed = InferOutput<typeof FeedSelectSchema>;

export const feedRelations = relations(feedTable, ({ one }) => ({
	user: one(followingTable, { fields: [feedTable.user_id], references: [followingTable.id] }),
}));
