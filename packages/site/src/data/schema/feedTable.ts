import { relations } from "drizzle-orm";
import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
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
	/** Url for image */
	image: text(),
	/** Alt text for describing the image to screen reader users */
	image_alt_text: text(),
	/** Whether this is an article (as opposed to an external link) */
	is_article: int({ mode: "boolean" }).notNull().default(false),
	/** Url for link or article */
	link_url: text(),
	/** Title for link or article */
	link_title: text(),
	/** Image for link or article */
	link_image: text(),
	/** Publication for link */
	link_publication: text(),
	/** Embed info for link */
	link_embed_src: text(),
	link_embed_width: int(),
	link_embed_height: int(),
	/** The rating value/upper bound */
	rating_value: real(),
	rating_bound: int(),
	/** The count of child items */
	child_count: int().notNull().default(0),
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
