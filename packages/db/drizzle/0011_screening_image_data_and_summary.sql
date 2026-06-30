-- Migration 0011: persist captured image bytes (base64) + the AI summary. Additive only.
-- Lets the web teacher/doctor screening save ALL data to the DB (image + advice/guidance),
-- not just findings/triage. ScreeningImage.data is nullable so legacy ref-only rows are valid.

ALTER TABLE `ScreeningImage` ADD COLUMN `data` text;
--> statement-breakpoint
CREATE TABLE `ScreeningSummary` (
	`id` text PRIMARY KEY NOT NULL,
	`screeningId` text NOT NULL,
	`advice` text NOT NULL,
	`homeCare` text,
	`brushing` text,
	`diet` text,
	`prevention` text,
	`nextStep` text,
	`generatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ScreeningSummary_screeningId_unique` ON `ScreeningSummary` (`screeningId`);
