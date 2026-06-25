CREATE TABLE `ParentChildLink` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`childKey` text NOT NULL,
	`schoolId` text NOT NULL,
	`consentAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ParentChildLink_user_child_key` ON `ParentChildLink` (`userId`,`childKey`);--> statement-breakpoint
CREATE INDEX `ParentChildLink_userId_idx` ON `ParentChildLink` (`userId`);--> statement-breakpoint
CREATE TABLE `UserScope` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`scopeKind` text NOT NULL,
	`scopeId` text NOT NULL,
	`grantedAt` integer NOT NULL,
	`grantedBy` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `UserScope_user_kind_id_key` ON `UserScope` (`userId`,`scopeKind`,`scopeId`);--> statement-breakpoint
CREATE INDEX `UserScope_userId_idx` ON `UserScope` (`userId`);--> statement-breakpoint
CREATE INDEX `UserScope_kind_id_idx` ON `UserScope` (`scopeKind`,`scopeId`);--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`passwordHash` text,
	`schoolId` text,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_unique` ON `User` (`email`);--> statement-breakpoint
CREATE TABLE `Child` (
	`id` text PRIMARY KEY NOT NULL,
	`classId` text NOT NULL,
	`schoolId` text NOT NULL,
	`childKey` text NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`birthYear` integer NOT NULL,
	`rosterSlot` integer NOT NULL,
	`gender` text,
	`guardianPhone` text,
	`guardianEmail` text,
	`consentObtained` integer DEFAULT false NOT NULL,
	`consentAt` integer,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Child_class_slot_key` ON `Child` (`classId`,`rosterSlot`);--> statement-breakpoint
CREATE UNIQUE INDEX `Child_class_childKey_key` ON `Child` (`classId`,`childKey`);--> statement-breakpoint
CREATE INDEX `Child_childKey_idx` ON `Child` (`childKey`);--> statement-breakpoint
CREATE TABLE `SchoolClass` (
	`id` text PRIMARY KEY NOT NULL,
	`schoolId` text NOT NULL,
	`name` text NOT NULL,
	`seasonId` text NOT NULL,
	`gradeLevel` integer,
	`sourceClassId` text,
	`scheduledAt` integer,
	`reminderPhone` text,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `SchoolClass_school_name_season_key` ON `SchoolClass` (`schoolId`,`name`,`seasonId`);--> statement-breakpoint
CREATE TABLE `School` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`soumCode` text,
	`district` text,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `FollowUp` (
	`id` text PRIMARY KEY NOT NULL,
	`childKey` text NOT NULL,
	`schoolId` text NOT NULL,
	`status` text DEFAULT 'flagged' NOT NULL,
	`assignedToId` text,
	`appointmentAt` integer,
	`notifiedAt` integer,
	`notificationChannel` text,
	`notes` text,
	`updatedAt` integer NOT NULL,
	`updatedById` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `FollowUp_childKey_unique` ON `FollowUp` (`childKey`);--> statement-breakpoint
CREATE INDEX `FollowUp_school_status_idx` ON `FollowUp` (`schoolId`,`status`);--> statement-breakpoint
CREATE TABLE `Questionnaire` (
	`id` text PRIMARY KEY NOT NULL,
	`screeningId` text NOT NULL,
	`isAdult` integer DEFAULT false NOT NULL,
	`swelling` integer,
	`painDisturbingSleepOrEating` integer,
	`fever` integer,
	`gumPimpleOrFistula` integer,
	`trauma` integer,
	`bleedingGums` integer,
	`smoker` integer,
	`lastCheckupAdult` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Questionnaire_screeningId_unique` ON `Questionnaire` (`screeningId`);--> statement-breakpoint
CREATE TABLE `ScreeningImage` (
	`id` text PRIMARY KEY NOT NULL,
	`screeningId` text NOT NULL,
	`ref` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ScreeningReview` (
	`id` text PRIMARY KEY NOT NULL,
	`screeningId` text NOT NULL,
	`reviewedById` text NOT NULL,
	`confirmedLevel` text NOT NULL,
	`note` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ScreeningReview_screeningId_unique` ON `ScreeningReview` (`screeningId`);--> statement-breakpoint
CREATE TABLE `Screening` (
	`id` text PRIMARY KEY NOT NULL,
	`childKey` text NOT NULL,
	`classId` text NOT NULL,
	`schoolId` text NOT NULL,
	`seasonId` text NOT NULL,
	`screenedById` text NOT NULL,
	`triageLevel` text NOT NULL,
	`triageScore` real NOT NULL,
	`triageConfidentWording` integer NOT NULL,
	`triageReason` text,
	`modelName` text NOT NULL,
	`modelVersion` text,
	`contentVersionId` text NOT NULL,
	`capturedAt` integer NOT NULL,
	`deviceId` text,
	`createdAt` integer NOT NULL,
	`syncedAt` integer
);
--> statement-breakpoint
CREATE INDEX `Screening_childKey_idx` ON `Screening` (`childKey`);--> statement-breakpoint
CREATE INDEX `Screening_child_season_idx` ON `Screening` (`childKey`,`seasonId`);--> statement-breakpoint
CREATE INDEX `Screening_school_season_idx` ON `Screening` (`schoolId`,`seasonId`);--> statement-breakpoint
CREATE INDEX `Screening_school_triage_idx` ON `Screening` (`schoolId`,`triageLevel`);--> statement-breakpoint
CREATE INDEX `Screening_classId_idx` ON `Screening` (`classId`);--> statement-breakpoint
CREATE INDEX `Screening_capturedAt_idx` ON `Screening` (`capturedAt`);--> statement-breakpoint
CREATE TABLE `ToothFinding` (
	`id` text PRIMARY KEY NOT NULL,
	`screeningId` text NOT NULL,
	`fdi` integer,
	`className` text NOT NULL,
	`classId` integer NOT NULL,
	`confidence` real NOT NULL,
	`boxX1` real NOT NULL,
	`boxY1` real NOT NULL,
	`boxX2` real NOT NULL,
	`boxY2` real NOT NULL,
	`longitudinal` text
);
--> statement-breakpoint
CREATE TABLE `AuditLog` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`entityType` text NOT NULL,
	`entityId` text NOT NULL,
	`action` text NOT NULL,
	`oldValue` text,
	`newValue` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `AuditLog_userId_idx` ON `AuditLog` (`userId`);--> statement-breakpoint
CREATE INDEX `AuditLog_entity_idx` ON `AuditLog` (`entityType`,`entityId`);--> statement-breakpoint
CREATE TABLE `ContentVersion` (
	`id` text PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`locale` text NOT NULL,
	`publishedAt` integer NOT NULL,
	`publishedById` text NOT NULL
);
