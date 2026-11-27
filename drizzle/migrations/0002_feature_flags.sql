CREATE TABLE IF NOT EXISTS `feature_flags` (
	`key` text PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`value` text,
	`updated_at` text,
	`updated_by` text
);
