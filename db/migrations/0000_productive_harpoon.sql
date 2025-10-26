CREATE TABLE `places` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`lat` real,
	`lng` real
);
