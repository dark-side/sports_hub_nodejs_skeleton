CREATE TABLE `images` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`image` longtext,
	`image_alt` varchar(255),
	CONSTRAINT `images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `articles` ADD `image_id` bigint;--> statement-breakpoint
ALTER TABLE `articles` DROP COLUMN `image`;--> statement-breakpoint
ALTER TABLE `articles` DROP COLUMN `image_alt`;