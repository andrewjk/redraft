CREATE TABLE `posts_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`url` text NOT NULL,
	`shared_key` text NOT NULL,
	`failure_count` integer DEFAULT 0 NOT NULL,
	`retry_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `followed_by`(`id`) ON UPDATE no action ON DELETE no action
);
