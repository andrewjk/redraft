CREATE TABLE `message_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`followed_by_id` integer,
	`following_id` integer,
	`newest_id` integer,
	`newest_sent` integer NOT NULL,
	`newest_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`followed_by_id`) REFERENCES `followed_by`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`following_id`) REFERENCES `following`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_id` integer,
	`sent` integer DEFAULT false NOT NULL,
	`text` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`delivered` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`group_id`) REFERENCES `message_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `followed_by` ADD `slug` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `following` ADD `slug` text DEFAULT '' NOT NULL;