CREATE TABLE `articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`post_id` integer NOT NULL,
	`parent_id` integer,
	`slug` text NOT NULL,
	`text` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `followed_by`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `content` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`content` blob NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `feed` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`slug` text NOT NULL,
	`text` text NOT NULL,
	`comment_count` integer DEFAULT 0 NOT NULL,
	`last_comment_at` integer,
	`visibility` integer DEFAULT 0 NOT NULL,
	`type` integer DEFAULT 0 NOT NULL,
	`image` text,
	`url` text,
	`title` text,
	`publication` text,
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
CREATE TABLE `followed_by` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`approved` integer NOT NULL,
	`url` text NOT NULL,
	`shared_key` text NOT NULL,
	`name` text NOT NULL,
	`image` text NOT NULL,
	`bio` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `following` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`approved` integer NOT NULL,
	`url` text NOT NULL,
	`shared_key` text NOT NULL,
	`name` text NOT NULL,
	`image` text NOT NULL,
	`bio` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `post_reactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`liked` integer DEFAULT false NOT NULL,
	`emoji` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `followed_by`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `post_tags` (
	`post_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	`deleted_at` integer,
	PRIMARY KEY(`post_id`, `tag_id`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts` (
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
	`type` integer DEFAULT 0 NOT NULL,
	`image` text,
	`article_id` integer,
	`url` text,
	`title` text,
	`publication` text,
	`pinned` integer DEFAULT false NOT NULL,
	`published_at` integer,
	`republished_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`text` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `user_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`text` text NOT NULL,
	`url` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_links_text_unique` ON `user_links` (`text`);--> statement-breakpoint
CREATE TABLE `user_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL,
	`url` text NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`bio` text NOT NULL,
	`location` text NOT NULL,
	`image` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);