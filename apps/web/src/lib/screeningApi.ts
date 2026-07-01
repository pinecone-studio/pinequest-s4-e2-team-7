import type { ScreeningCreateInput } from '@pinequest/core'
import { apiFetch } from '@/lib/api'

// ── Teacher/doctor screening: class + roster + DB persistence ────────────────────
// The web screening screen mirrors the mobile flow — pick a class, pick or add a
// roster child (PII stays in the roster), then persist the screening (image + AI
// summary included) to the DB via the authenticated server.

export type MyClass = {
  id: string
  schoolId: string
  name: string
  seasonId: string
  gradeLevel: number | null
  /** Planned class size set at creation (null until set) — denominator for coverage. */
  expectedTotal: number | null
  enrolled: number
  screened: number
}

export type RosterChild = {
  id: string
  childKey: string
  rosterSlot: number
  firstName: string
  lastName: string
  birthYear: number
  latestLevel: 'green' | 'yellow' | 'red' | null
  screenedAt: string | null
}

export type AddedChild = {
  childKey: string
  rosterSlot: number
  firstName: string
  lastName: string
  birthYear: number
}

export type NewStudentInput = {
  firstName: string
  lastName: string
  birthYear: number
  gender?: 'M' | 'F'
  guardianPhone?: string
  guardianEmail?: string
}

/** The teacher's own classes (with enrolled/screened counts). */
export const getMyClasses = (token: string | null) =>
  apiFetch<MyClass[]>('/api/teacher/classes', { token })

/** Roster of one class — each child carries its childKey + latest triage. */
export const getRosterStatus = (token: string | null, classId: string) =>
  apiFetch<RosterChild[]>(`/api/teacher/classes/${classId}/roster-status`, { token })

/** Append a child to a class; returns the created rows (incl. childKey). */
export const addStudent = (token: string | null, classId: string, student: NewStudentInput) =>
  apiFetch<{ added: number; children: AddedChild[] }>(
    `/api/teacher/classes/${classId}/students`,
    { token, method: 'POST', body: { students: [student] } },
  )

/** Update a class's "total kids to evaluate" (expectedTotal) — the coverage denominator. */
export const updateClassTotal = (token: string | null, classId: string, expectedTotal: number) =>
  apiFetch<{ id: string; expectedTotal: number | null }>(
    `/api/teacher/classes/${classId}`,
    { token, method: 'PATCH', body: { expectedTotal } },
  )

/** Persist a completed screening (findings + triage + image bytes + AI summary). */
export const saveScreening = (token: string | null, payload: ScreeningCreateInput) =>
  apiFetch<{ id: string }>('/api/screenings', { token, method: 'POST', body: payload })

export const screeningSaveErrorText = (message: string): string => {
  if (message === 'forbidden') return 'Энэ ангид хандах эрхгүй байна.'
  if (message === 'network_error') return 'Серверт холбогдож чадсангүй — дахин оролдоно уу.'
  if (message === 'request_timeout') return 'Хүсэлт хэт удаан — дахин оролдоно уу.'
  return 'DB-д хадгалахад алдаа гарлаа — дахин оролдоно уу.'
}
