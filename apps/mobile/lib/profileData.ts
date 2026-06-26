export type ProfileRole = 'child' | 'parent' | 'teacher' | 'school_doctor'

export type ScreeningRow = {
  id: string
  childName: string
  triageLevel: 'green' | 'yellow' | 'red'
  date: string
  classId: string
}

/** screener = parent, dentist = school_doctor, admin = teacher, follow_up = child */
export const getProfileRole = (role: string): ProfileRole => {
  if (role === 'dentist') return 'school_doctor'
  if (role === 'admin') return 'teacher'
  if (role === 'follow_up') return 'child'
  return 'parent'
}

export const MOCK_CHILDREN = ['Болор', 'Тэмүүлэн']

export const MOCK_CLASSES = ['5А', '5Б', '6А', '6Б']

export const MOCK_HISTORY: ScreeningRow[] = [
  { id: '1', childName: 'Болор',      triageLevel: 'yellow', date: '2026-06-22', classId: '5А' },
  { id: '2', childName: 'Тэмүүлэн',  triageLevel: 'green',  date: '2026-06-20', classId: '5А' },
  { id: '3', childName: 'Болор',      triageLevel: 'green',  date: '2026-03-15', classId: '5А' },
  { id: '4', childName: 'Нарантуяа', triageLevel: 'red',    date: '2026-06-18', classId: '5Б' },
  { id: '5', childName: 'Баяр',       triageLevel: 'green',  date: '2026-06-15', classId: '5Б' },
  { id: '6', childName: 'Дэлгэр',    triageLevel: 'yellow', date: '2026-06-10', classId: '6А' },
]

export const getChildCount = (role: string): number | undefined =>
  role === 'screener' ? MOCK_CHILDREN.length : undefined

export const getReportName = (role: string, userName: string): string =>
  getProfileRole(role) === 'child' ? userName.split(' ')[0] : MOCK_CHILDREN[0]
