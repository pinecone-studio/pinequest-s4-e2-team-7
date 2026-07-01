-- Migration 0015: student transfers between classes/schools.
-- Additive, nullable. `previousChildKey` links a transferred-in child to the same
-- person's prior record (matched by guardian contact + birth year) so their screening
-- history follows them across classes/schools — childKey itself is unchanged.
-- `transferredAt` marks a child transferred-out during carry-forward: the record is
-- kept (history preserved) but is not copied into the next season.

ALTER TABLE `Child` ADD COLUMN `previousChildKey` text;
ALTER TABLE `Child` ADD COLUMN `transferredAt` integer;
CREATE INDEX IF NOT EXISTS `Child_previousChildKey_idx` ON `Child` (`previousChildKey`);
