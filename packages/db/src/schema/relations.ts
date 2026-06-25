import { relations } from 'drizzle-orm'
import { users } from './people.js'
import { screenings, toothFindings, screeningImages, questionnaires, screeningReviews } from './screening.js'
import { auditLogs } from './content.js'

// Declared for Drizzle's relational query API (db.query.*.findMany({ with })).
export const screeningsRelations = relations(screenings, ({ many, one }) => ({
  findings: many(toothFindings),
  images: many(screeningImages),
  questionnaire: one(questionnaires),
  review: one(screeningReviews),
}))

export const toothFindingsRelations = relations(toothFindings, ({ one }) => ({
  screening: one(screenings, { fields: [toothFindings.screeningId], references: [screenings.id] }),
}))

export const screeningImagesRelations = relations(screeningImages, ({ one }) => ({
  screening: one(screenings, { fields: [screeningImages.screeningId], references: [screenings.id] }),
}))

export const questionnairesRelations = relations(questionnaires, ({ one }) => ({
  screening: one(screenings, { fields: [questionnaires.screeningId], references: [screenings.id] }),
}))

export const screeningReviewsRelations = relations(screeningReviews, ({ one }) => ({
  screening: one(screenings, { fields: [screeningReviews.screeningId], references: [screenings.id] }),
}))

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}))
