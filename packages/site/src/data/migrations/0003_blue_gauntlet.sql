ALTER TABLE `feed` RENAME COLUMN "url" TO "link_url";--> statement-breakpoint
ALTER TABLE `feed` RENAME COLUMN "title" TO "link_title";--> statement-breakpoint
ALTER TABLE `feed` RENAME COLUMN "publication" TO "link_publication";--> statement-breakpoint
ALTER TABLE `posts` RENAME COLUMN "url" TO "link_url";--> statement-breakpoint
ALTER TABLE `posts` RENAME COLUMN "title" TO "link_title";--> statement-breakpoint
ALTER TABLE `posts` RENAME COLUMN "publication" TO "link_publication";--> statement-breakpoint
ALTER TABLE `feed` ADD `is_article` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `feed` ADD `link_image` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `is_article` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `link_image` text;

UPDATE `feed` SET `is_article` = true WHERE `type` = 2;
UPDATE `feed` SET `link_image` = `image`, `image` = NULL WHERE `type` = 3;

UPDATE `posts` SET `is_article` = true WHERE `type` = 2;
UPDATE `posts` SET `link_image` = `image`, `image` = NULL WHERE `type` = 3;
