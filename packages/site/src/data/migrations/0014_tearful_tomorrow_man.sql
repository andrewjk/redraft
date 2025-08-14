CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`location` text,
	`starts_at` integer NOT NULL,
	`duration` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_feed` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`slug` text NOT NULL,
	`text` text NOT NULL,
	`comment_count` integer DEFAULT 0 NOT NULL,
	`last_comment_at` integer,
	`visibility` integer DEFAULT 0 NOT NULL,
	`image` text,
	`image_alt_text` text,
	`link_type` integer,
	`link_url` text,
	`link_title` text,
	`link_image` text,
	`link_publication` text,
	`link_embed_src` text,
	`link_embed_width` integer,
	`link_embed_height` integer,
	`rating_value` real,
	`rating_bound` integer,
	`child_count` integer DEFAULT 0 NOT NULL,
	`published_at` integer NOT NULL,
	`republished_at` integer,
	`liked` integer DEFAULT false NOT NULL,
	`saved` integer DEFAULT false NOT NULL,
	`emoji` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_feed`("id", "user_id", "slug", "text", "comment_count", "last_comment_at", "visibility", "image", "image_alt_text", "link_type", "link_url", "link_title", "link_image", "link_publication", "link_embed_src", "link_embed_width", "link_embed_height", "rating_value", "rating_bound", "child_count", "published_at", "republished_at", "liked", "saved", "emoji", "created_at", "updated_at", "deleted_at") SELECT "id", "user_id", "slug", "text", "comment_count", "last_comment_at", "visibility", "image", "image_alt_text", "link_type", "link_url", "link_title", "link_image", "link_publication", "link_embed_src", "link_embed_width", "link_embed_height", "rating_value", "rating_bound", "child_count", "published_at", "republished_at", "liked", "saved", "emoji", "created_at", "updated_at", "deleted_at" FROM `feed`;--> statement-breakpoint
DROP TABLE `feed`;--> statement-breakpoint
ALTER TABLE `__new_feed` RENAME TO `feed`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`text` text NOT NULL,
	`comment_count` integer DEFAULT 0 NOT NULL,
	`last_comment_at` integer,
	`like_count` integer DEFAULT 0 NOT NULL,
	`emoji_first` text,
	`emoji_second` text,
	`emoji_third` text,
	`visibility` integer DEFAULT 0 NOT NULL,
	`list_id` integer,
	`image` text,
	`image_alt_text` text,
	`link_type` integer,
	`link_url` text,
	`link_title` text,
	`link_image` text,
	`link_publication` text,
	`link_embed_src` text,
	`link_embed_width` integer,
	`link_embed_height` integer,
	`article_id` integer,
	`event_id` integer,
	`rating_value` real,
	`rating_bound` integer,
	`parent_id` integer,
	`child_count` integer DEFAULT 0 NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`published_at` integer,
	`republished_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "slug", "text", "comment_count", "last_comment_at", "like_count", "emoji_first", "emoji_second", "emoji_third", "visibility", "list_id", "image", "image_alt_text", "link_type", "link_url", "link_title", "link_image", "link_publication", "link_embed_src", "link_embed_width", "link_embed_height", "article_id", "event_id", "rating_value", "rating_bound", "parent_id", "child_count", "pinned", "published_at", "republished_at", "created_at", "updated_at", "deleted_at") SELECT "id", "slug", "text", "comment_count", "last_comment_at", "like_count", "emoji_first", "emoji_second", "emoji_third", "visibility", "list_id", "image", "image_alt_text", "is_article", "link_url", "link_title", "link_image", "link_publication", "link_embed_src", "link_embed_width", "link_embed_height", "article_id", NULL, "rating_value", "rating_bound", "parent_id", "child_count", "pinned", "published_at", "republished_at", "created_at", "updated_at", "deleted_at" FROM `posts`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
ALTER TABLE `__new_posts` RENAME TO `posts`;
UPDATE `posts` SET "link_type" = NULL WHERE "link_type" = 0 AND link_url IS NULL;