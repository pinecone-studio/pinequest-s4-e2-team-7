import bcrypt from 'bcryptjs'
import { users, schools, type DB } from '@pinequest/db/d1'
import { seedDentists } from './seedDentists.js'

// Bootstrap-only seed: real accounts + an empty school. NO demo classes / children /
// screenings — every class, student and screening is created for real via the
// mobile + web flows. Login: admin@screener.mn / admin123
export const runSeed = async (db: DB): Promise<{ adminId: string }> => {
  const passwordHash = await bcrypt.hash('admin123', 10)
  const adminId = 'user-admin'

  await db.insert(users).values({ id: adminId, email: 'admin@screener.mn', name: 'Админ', role: 'admin', schoolId: 'school-demo', passwordHash }).onConflictDoNothing()
  await db.insert(users).values({ id: 'user-screener', email: 'screener@screener.mn', name: 'Шинжээч', role: 'screener', schoolId: 'school-demo', passwordHash }).onConflictDoNothing()
  await db.insert(schools).values({ id: 'school-demo', name: 'Сүхбаатар дүүрэг 23-р сургууль', soumCode: 'UB-SBD' }).onConflictDoNothing()

  await seedDentists(db, passwordHash) // volunteer dentists for the mobile picker

  return { adminId }
}
