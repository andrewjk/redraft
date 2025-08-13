ALTER TABLE `message_groups` ADD `unread_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `message_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notification_count` integer DEFAULT 0 NOT NULL;