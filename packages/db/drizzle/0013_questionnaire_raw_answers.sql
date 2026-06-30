-- Migration 0013: persist the verbatim questionnaire Q&A captured on the device.
-- Additive, nullable. Stores the literal question + answer pairs (JSON `{q,a}[]`) exactly
-- as asked on the phone, so the board shows the same questionnaire the screener answered —
-- not a lossy symptom mapping. Legacy rows keep rawAnswers NULL (board falls back to symptoms).

ALTER TABLE `Questionnaire` ADD COLUMN `rawAnswers` text;
