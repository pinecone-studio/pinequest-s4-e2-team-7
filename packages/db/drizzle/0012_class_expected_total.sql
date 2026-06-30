-- Migration 0012: planned class size ("expected total children") for screening coverage.
-- Additive, nullable. Teachers set this when creating a class so the screening board can
-- show screened-vs-remaining against the planned size before every child is entered.

ALTER TABLE `SchoolClass` ADD COLUMN `expectedTotal` integer;
