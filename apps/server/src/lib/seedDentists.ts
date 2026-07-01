import { users, volunteerDentists, type DB } from '@pinequest/db/d1'

// 3 volunteer dentists shown on the mobile red-result picker.
// TODO(user): replace name / phone / licenseNo with the real dentists' details.
// avatarUrl uses a public placeholder photo so the card renders an image immediately.
const DENTISTS = [
  { uid: 'user-dentist-1', name: 'М.Ариунзул', phone: '99746330', licenseNo: '86779', specialty: 'Нүүр амны мэс заслын эмч', experienceYears: 4, isAvailable: true,  avatar: 'https://i.pravatar.cc/200?img=12' },
  { uid: 'user-dentist-2', name: 'Б.Билгүүнзаяа', phone: '99281549', licenseNo: '88743', specialty: 'Тулгуур эд сувгийн эмчилгээний эмч',          experienceYears: 4,  isAvailable: true,  avatar: 'https://i.pravatar.cc/200?img=32' },
  { uid: 'user-dentist-3', name: 'Н.Мөрөн', phone: '89503025', licenseNo: '86772', specialty: 'Хүүхдийн шүдний эмч', experienceYears: 5, isAvailable: false, avatar: 'https://i.pravatar.cc/200?img=5' },
]

export const seedDentists = async (db: DB, passwordHash: string) => {
  for (const d of DENTISTS) {
    await db.insert(users).values({ id: d.uid, email: `${d.uid}@screener.mn`, name: d.name, role: 'dentist', phone: d.phone, passwordHash }).onConflictDoNothing()
    // Upsert the PROFILE fields so re-seeding repairs a stale row (e.g. one created
    // before `specialty`/`experienceYears` existed) instead of keeping the old data.
    // `isAvailable` stays insert-only so a dentist's live on/off toggle isn't clobbered.
    const profile = {
      displayName: d.name,
      specialty: d.specialty,
      org: 'Бүртгэлтэй шүдний эмч',
      area: 'Улаанбаатар',
      avatarUrl: d.avatar,
      experienceYears: d.experienceYears,
      licenseNo: d.licenseNo,
    }
    await db.insert(volunteerDentists)
      .values({ id: `vol-${d.uid}`, userId: d.uid, isAvailable: d.isAvailable, ...profile })
      .onConflictDoUpdate({ target: volunteerDentists.userId, set: profile })
  }
}
