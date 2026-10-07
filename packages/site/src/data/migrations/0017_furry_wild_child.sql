CREATE TABLE `event_rsvps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`url` text NOT NULL,
	`name` text NOT NULL,
	`image` text NOT NULL,
	`status` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `events` ADD `rsvp_enabled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `rsvp_limit` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `rsvp_deadline` integer;--> statement-breakpoint
ALTER TABLE `feed` ADD `event_text` text;--> statement-breakpoint
ALTER TABLE `feed` ADD `event_location` text;--> statement-breakpoint
ALTER TABLE `feed` ADD `event_starts_at` integer;--> statement-breakpoint
ALTER TABLE `feed` ADD `event_duration` integer;--> statement-breakpoint
ALTER TABLE `feed` ADD `rsvp_enabled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `feed` ADD `rsvp_limit` integer;--> statement-breakpoint
ALTER TABLE `feed` ADD `rsvp_deadline` integer;