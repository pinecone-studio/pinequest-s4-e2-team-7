CREATE TABLE `HelpRequest` (
	`id` text PRIMARY KEY NOT NULL,
	`childKey` text NOT NULL,
	`schoolId` text NOT NULL,
	`level` text NOT NULL,
	`requestedById` text NOT NULL,
	`note` text,
	`status` text DEFAULT 'open' NOT NULL,
	`dentistId` text,
	`connectedAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `HelpRequest_status_idx` ON `HelpRequest` (`status`);--> statement-breakpoint
CREATE INDEX `HelpRequest_childKey_idx` ON `HelpRequest` (`childKey`);--> statement-breakpoint
CREATE INDEX `HelpRequest_school_idx` ON `HelpRequest` (`schoolId`);--> statement-breakpoint
CREATE INDEX `HelpRequest_requestedBy_idx` ON `HelpRequest` (`requestedById`);--> statement-breakpoint
CREATE TABLE `VolunteerDentist` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`displayName` text NOT NULL,
	`org` text,
	`area` text,
	`isAvailable` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `VolunteerDentist_userId_key` ON `VolunteerDentist` (`userId`);