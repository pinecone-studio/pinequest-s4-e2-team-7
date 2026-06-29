import { useEffect, useState } from 'react'
import { getBoardStudents, type BoardStudent } from '@/lib/api'
import RedStudentsSection from '@/components/teacher/RedStudentsSection'

// School doctor home: flagged children across the whole school (board/students is
// school-scoped server-side). Reuses the teacher RedStudentsSection — BoardStudent
// is a structural superset of RosterStatusRow.
const RedStudentsBoardSection = () => {
  const [roster, setRoster] = useState<BoardStudent[]>([])

  useEffect(() => {
    getBoardStudents()
      .then(setRoster)
      .catch(() => setRoster([]))
  }, [])

  return <RedStudentsSection roster={roster} />
}

export default RedStudentsBoardSection
