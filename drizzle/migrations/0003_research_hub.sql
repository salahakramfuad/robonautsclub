CREATE TABLE IF NOT EXISTS `research_hub_bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`manage_token` text NOT NULL,
	`date` text NOT NULL,
	`start_hour` integer NOT NULL,
	`hours` integer NOT NULL,
	`persons` integer NOT NULL,
	`status` text NOT NULL,
	`hold_expires_at` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`institution` text,
	`purpose` text,
	`planned_components` text,
	`group_members` text,
	`rate` real NOT NULL,
	`amount` real NOT NULL,
	`payment_gateway` text NOT NULL DEFAULT 'bkash',
	`payment_id` text,
	`trx_id` text,
	`amount_paid` real,
	`refund_trx_id` text,
	`locale` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`checked_in_at` text,
	`cancelled_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `research_hub_bookings_code_idx` ON `research_hub_bookings` (`code`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `research_hub_bookings_date_status_idx` ON `research_hub_bookings` (`date`,`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `research_hub_bookings_payment_id_idx` ON `research_hub_bookings` (`payment_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `research_hub_bookings_phone_status_idx` ON `research_hub_bookings` (`phone`,`status`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `research_hub_booking_hours` (
	`booking_id` text NOT NULL,
	`date` text NOT NULL,
	`hour` integer NOT NULL,
	`persons` integer NOT NULL,
	PRIMARY KEY(`booking_id`, `hour`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `research_hub_booking_hours_date_hour_idx` ON `research_hub_booking_hours` (`date`,`hour`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `research_hub_closures` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`start_hour` integer,
	`end_hour` integer,
	`reason` text,
	`created_at` text NOT NULL,
	`created_by` text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `research_hub_closures_date_idx` ON `research_hub_closures` (`date`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `research_hub_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL DEFAULT '{}',
	`updated_at` text,
	`updated_by` text
);
