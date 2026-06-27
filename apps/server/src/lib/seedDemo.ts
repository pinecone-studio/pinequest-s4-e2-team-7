import { children, screenings, toothFindings, screeningReviews, followUps, type DB } from '@pinequest/db/d1'
import { inChunks } from './chunk.js'

const SCHOOL = 'school-demo', CLS = 'class-demo', SEASON = '2026-spring', SCREENER = 'user-screener'
const ago = (days: number) => new Date(Date.now() - days * 86_400_000)

const KIDS = [
  { slot: 1, key: 'ck-001', fn: 'Болд', ln: 'Бат' },
  { slot: 2, key: 'ck-002', fn: 'Сараа', ln: 'Дорж' },
  { slot: 3, key: 'ck-003', fn: 'Тэмүүлэн', ln: 'Ган' },
  { slot: 4, key: 'ck-004', fn: 'Нараа', ln: 'Сүх' },
  { slot: 5, key: 'ck-005', fn: 'Болор', ln: 'Цог' },
  { slot: 6, key: 'ck-006', fn: 'Анар', ln: 'Бямба' },
]

// level mix + spread over months (for the area chart / monthly delta) + some
// reviewed (so the review queue keeps a few pending), some with findings.
const SCR = [
  { id: 'scr-1', key: 'ck-001', level: 'red',    score: 0.92, reason: 'Цооролт сэжиглэгдэж байна', d: 2,   fdi: 36, conf: 0.86, reviewed: false },
  { id: 'scr-2', key: 'ck-002', level: 'yellow', score: 0.55, reason: 'Өнгө өөрчлөгдсөн',          d: 4,   fdi: 26, conf: 0.54, reviewed: false },
  { id: 'scr-3', key: 'ck-003', level: 'green',  score: 0.08, reason: null,                         d: 9,   fdi: 0,  conf: 0,    reviewed: true  },
  { id: 'scr-4', key: 'ck-004', level: 'red',    score: 0.88, reason: 'Буйлны хаван',               d: 13,  fdi: 46, conf: 0.78, reviewed: false },
  { id: 'scr-5', key: 'ck-005', level: 'yellow', score: 0.48, reason: 'Бага зэргийн цооролт',       d: 26,  fdi: 75, conf: 0.61, reviewed: true  },
  { id: 'scr-6', key: 'ck-006', level: 'green',  score: 0.05, reason: null,                         d: 41,  fdi: 0,  conf: 0,    reviewed: true  },
  { id: 'scr-7', key: 'ck-001', level: 'yellow', score: 0.50, reason: 'Дахин шалгах',               d: 63,  fdi: 16, conf: 0.57, reviewed: true  },
  { id: 'scr-8', key: 'ck-002', level: 'green',  score: 0.07, reason: null,                         d: 92,  fdi: 0,  conf: 0,    reviewed: true  },
  { id: 'scr-9', key: 'ck-003', level: 'red',    score: 0.90, reason: 'Цооролт',                    d: 118, fdi: 85, conf: 0.83, reviewed: true  },
]

export const seedDemo = async (db: DB, adminId: string) => {
  // D1 caps ~100 bound params/query → insert in small chunks.
  await inChunks(KIDS.map((k) => ({
    id: `child-${k.slot}`, classId: CLS, schoolId: SCHOOL, childKey: k.key,
    firstName: k.fn, lastName: k.ln, birthYear: 2016, rosterSlot: k.slot, guardianPhone: '99001122',
  })), (b) => db.insert(children).values(b).onConflictDoNothing())

  await inChunks(SCR.map((s) => ({
    id: s.id, childKey: s.key, classId: CLS, schoolId: SCHOOL, seasonId: SEASON, screenedById: SCREENER,
    triageLevel: s.level, triageScore: s.score, triageConfidentWording: s.level !== 'yellow',
    triageReason: s.reason, modelName: 'yolov8',
    capturedAt: ago(s.d), syncedAt: ago(s.d),
  })), (b) => db.insert(screenings).values(b).onConflictDoNothing())

  const findings = SCR.filter((s) => s.fdi > 0).map((s) => ({
    id: `tf-${s.id}`, screeningId: s.id, fdi: s.fdi, className: 'caries', classId: 1,
    confidence: s.conf, boxX1: 0.2, boxY1: 0.2, boxX2: 0.4, boxY2: 0.4,
  }))
  await inChunks(findings, (b) => db.insert(toothFindings).values(b).onConflictDoNothing())

  const reviews = SCR.filter((s) => s.reviewed).map((s) => ({
    id: `rev-${s.id}`, screeningId: s.id, reviewedById: adminId, confirmedLevel: s.level,
  }))
  await inChunks(reviews, (b) => db.insert(screeningReviews).values(b).onConflictDoNothing())

  const flaggedKeys = [...new Set(SCR.filter((s) => s.level !== 'green').map((s) => s.key))]
  await inChunks(flaggedKeys.map((key, i) => ({
    childKey: key, schoolId: SCHOOL, status: i % 2 === 0 ? 'flagged' : 'contacted',
    updatedById: SCREENER, version: 1, appointmentAt: i < 2 ? ago(-(i + 1)) : null,
  })), (b) => db.insert(followUps).values(b).onConflictDoNothing())
}
