import { children, screenings, toothFindings, screeningReviews, followUpEpisodes, type DB } from '@pinequest/db/d1'
import { inChunks } from './chunk.js'

const SCHOOL = 'school-demo', CLS = 'class-demo', SCREENER = 'user-screener'
const FALL = '2025-fall', WINTER = '2025-winter', SPRING = '2026-spring'
const ago = (days: number) => new Date(Date.now() - days * 86_400_000)

const KIDS = [
  { slot: 1, key: 'ck-001', fn: 'Болд',     ln: 'Бат' },
  { slot: 2, key: 'ck-002', fn: 'Сараа',    ln: 'Дорж' },
  { slot: 3, key: 'ck-003', fn: 'Тэмүүлэн', ln: 'Ган' },
  { slot: 4, key: 'ck-004', fn: 'Нараа',    ln: 'Сүх' },
  { slot: 5, key: 'ck-005', fn: 'Болор',    ln: 'Цог' },
  { slot: 6, key: 'ck-006', fn: 'Анар',     ln: 'Бямба' },
]

// Current season — level mix + spread for area chart + some reviewed
const SPRING_SCR = [
  { id: 'scr-1', key: 'ck-001', season: SPRING, level: 'red',    score: 0.92, reason: 'Цооролт сэжиглэгдэж байна', d: 2,   fdi: 36, conf: 0.86, reviewed: false },
  { id: 'scr-2', key: 'ck-002', season: SPRING, level: 'yellow', score: 0.55, reason: 'Өнгө өөрчлөгдсөн',          d: 4,   fdi: 26, conf: 0.54, reviewed: false },
  { id: 'scr-3', key: 'ck-003', season: SPRING, level: 'green',  score: 0.08, reason: null,                         d: 9,   fdi: 0,  conf: 0,    reviewed: true  },
  { id: 'scr-4', key: 'ck-004', season: SPRING, level: 'red',    score: 0.88, reason: 'Буйлны хаван',               d: 13,  fdi: 46, conf: 0.78, reviewed: false },
  { id: 'scr-5', key: 'ck-005', season: SPRING, level: 'yellow', score: 0.48, reason: 'Бага зэргийн цооролт',       d: 26,  fdi: 75, conf: 0.61, reviewed: true  },
  { id: 'scr-6', key: 'ck-006', season: SPRING, level: 'green',  score: 0.05, reason: null,                         d: 41,  fdi: 0,  conf: 0,    reviewed: true  },
]

// 2025-fall: starting state — shows how each child entered the system
// ck-001: green → yellow (winter) → red (spring) = deteriorating
// ck-002: red → yellow (spring) = improved
// ck-003: yellow → green (spring) = improved
// ck-004: green → yellow (winter) → red (spring) = deteriorating + escalation
// ck-005: yellow → yellow (spring) = chronic
// ck-006: green → green (spring) = stable
const FALL_SCR = [
  { id: 'scr-f1', key: 'ck-001', season: FALL,   level: 'green',  score: 0.06, reason: null,                   d: 255, fdi: 0,  conf: 0,    reviewed: true },
  { id: 'scr-f2', key: 'ck-002', season: FALL,   level: 'red',    score: 0.85, reason: 'Цооролт илэрсэн',      d: 250, fdi: 46, conf: 0.82, reviewed: true },
  { id: 'scr-f3', key: 'ck-003', season: FALL,   level: 'yellow', score: 0.52, reason: 'Цагаан толбо ажиглав', d: 248, fdi: 26, conf: 0.55, reviewed: true },
  { id: 'scr-f4', key: 'ck-004', season: FALL,   level: 'green',  score: 0.09, reason: null,                   d: 245, fdi: 0,  conf: 0,    reviewed: true },
  { id: 'scr-f5', key: 'ck-005', season: FALL,   level: 'yellow', score: 0.46, reason: 'Эрт шатны цооролт',    d: 242, fdi: 75, conf: 0.60, reviewed: true },
  { id: 'scr-f6', key: 'ck-006', season: FALL,   level: 'green',  score: 0.04, reason: null,                   d: 238, fdi: 0,  conf: 0,    reviewed: true },
]

// 2025-winter: intermediate check for ck-001 and ck-004 (both deteriorating)
const WINTER_SCR = [
  { id: 'scr-w1', key: 'ck-001', season: WINTER, level: 'yellow', score: 0.52, reason: 'Өнгө өөрчлөгдөж эхэлсэн', d: 160, fdi: 16, conf: 0.52, reviewed: true },
  { id: 'scr-w4', key: 'ck-004', season: WINTER, level: 'yellow', score: 0.58, reason: 'Бага зэргийн хаван',        d: 155, fdi: 36, conf: 0.60, reviewed: true },
]

const ALL_SCR = [...SPRING_SCR, ...FALL_SCR, ...WINTER_SCR]

// Prior-season episodes (closed — treatment window passed)
const PRIOR_EPISODES = [
  { id: 'ep-ck001-win25', childKey: 'ck-001', season: WINTER, scrId: 'scr-w1', level: 'yellow', score: 0.52, status: 'contacted',   escalation: false, closedAt: ago(45) },
  { id: 'ep-ck002-fall25',childKey: 'ck-002', season: FALL,   scrId: 'scr-f2', level: 'red',    score: 0.85, status: 'treatment_done', escalation: false, closedAt: ago(190) },
  { id: 'ep-ck003-fall25',childKey: 'ck-003', season: FALL,   scrId: 'scr-f3', level: 'yellow', score: 0.52, status: 'treatment_done', escalation: false, closedAt: ago(185) },
  { id: 'ep-ck004-win25', childKey: 'ck-004', season: WINTER, scrId: 'scr-w4', level: 'yellow', score: 0.58, status: 'flagged',       escalation: false, closedAt: ago(40) },
  { id: 'ep-ck005-fall25',childKey: 'ck-005', season: FALL,   scrId: 'scr-f5', level: 'yellow', score: 0.46, status: 'treatment_done', escalation: false, closedAt: ago(180) },
]

// Open episodes for current spring season (what the Kanban board shows)
const OPEN_EPISODES = [
  { id: 'ep-ck001-sp26', childKey: 'ck-001', season: SPRING, scrId: 'scr-1', level: 'red',    score: 0.92, status: 'flagged',   escalation: true,  prevId: 'ep-ck001-win25' },
  { id: 'ep-ck002-sp26', childKey: 'ck-002', season: SPRING, scrId: 'scr-2', level: 'yellow', score: 0.55, status: 'contacted', escalation: false, prevId: null },
  { id: 'ep-ck004-sp26', childKey: 'ck-004', season: SPRING, scrId: 'scr-4', level: 'red',    score: 0.88, status: 'flagged',   escalation: true,  prevId: 'ep-ck004-win25' },
  { id: 'ep-ck005-sp26', childKey: 'ck-005', season: SPRING, scrId: 'scr-5', level: 'yellow', score: 0.48, status: 'contacted', escalation: false, prevId: 'ep-ck005-fall25' },
]

export const seedDemo = async (db: DB, adminId: string) => {
  await inChunks(KIDS.map((k) => ({
    id: `child-${k.slot}`, classId: CLS, schoolId: SCHOOL, childKey: k.key,
    firstName: k.fn, lastName: k.ln, birthYear: 2016, rosterSlot: k.slot, guardianPhone: '99001122',
  })), (b) => db.insert(children).values(b).onConflictDoNothing())

  await inChunks(ALL_SCR.map((s) => ({
    id: s.id, childKey: s.key, classId: CLS, schoolId: SCHOOL, seasonId: s.season, screenedById: SCREENER,
    triageLevel: s.level, triageScore: s.score, triageConfidentWording: s.level !== 'yellow',
    triageReason: s.reason, modelName: 'yolov8',
    capturedAt: ago(s.d), syncedAt: ago(s.d),
  })), (b) => db.insert(screenings).values(b).onConflictDoNothing())

  const findings = ALL_SCR.filter((s) => s.fdi > 0).map((s) => ({
    id: `tf-${s.id}`, screeningId: s.id, fdi: s.fdi, className: 'caries', classId: 1,
    confidence: s.conf, boxX1: 0.2, boxY1: 0.2, boxX2: 0.4, boxY2: 0.4,
  }))
  await inChunks(findings, (b) => db.insert(toothFindings).values(b).onConflictDoNothing())

  const reviews = ALL_SCR.filter((s) => s.reviewed).map((s) => ({
    id: `rev-${s.id}`, screeningId: s.id, reviewedById: adminId, confirmedLevel: s.level,
  }))
  await inChunks(reviews, (b) => db.insert(screeningReviews).values(b).onConflictDoNothing())

  await inChunks(PRIOR_EPISODES.map((e) => ({
    id: e.id, childKey: e.childKey, schoolId: SCHOOL,
    triggerSeasonId: e.season, triggerScreeningId: e.scrId,
    triggerLevel: e.level, triggerScore: e.score,
    status: e.status, escalationFlag: e.escalation,
    closedAt: e.closedAt, closedReason: 'season_closed',
    updatedById: SCREENER,
  })), (b) => db.insert(followUpEpisodes).values(b).onConflictDoNothing())

  await inChunks(OPEN_EPISODES.map((e) => ({
    id: e.id, childKey: e.childKey, schoolId: SCHOOL,
    triggerSeasonId: e.season, triggerScreeningId: e.scrId,
    triggerLevel: e.level, triggerScore: e.score,
    status: e.status, escalationFlag: e.escalation,
    previousEpisodeId: e.prevId,
    updatedById: SCREENER,
  })), (b) => db.insert(followUpEpisodes).values(b).onConflictDoNothing())
}
