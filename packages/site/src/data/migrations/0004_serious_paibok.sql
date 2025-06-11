ALTER TABLE `feed` ADD `child_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `feed` DROP COLUMN `type`;--> statement-breakpoint
ALTER TABLE `posts` ADD `parent_id` integer;--> statement-breakpoint
ALTER TABLE `posts` ADD `child_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` DROP COLUMN `type`;