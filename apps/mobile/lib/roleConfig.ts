import type { Ionicons } from '@expo/vector-icons'
import type { UserRole } from '@pinequest/types'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

/** A home quick-action tile → an in-app route. */
export type QuickAction = { id: string; icon: IoniconsName; label: string; route: string }

/** Home body blocks, rendered in order. The home screen owns each block's markup;
 *  roleConfig only decides WHICH blocks (and quick actions) a role sees. */
export type HomeSection =
  | 'history' // teacher/screener screening summary
  | 'childResult' // parent: their own child's latest result
  | 'schoolOverview' // school_doctor: school-wide stats
  | 'redStudents' // school_doctor: flagged children worklist
  | 'helpRequests' // dentist: incoming volunteer help requests

export type RoleConfig = {
  label: string
  /** Capture is for screeners; a reviewing dentist doesn't scan. */
  showScanHero: boolean
  sections: HomeSection[]
  quickActions: QuickAction[]
  tabs: {
    camera: boolean
    hospital: boolean
    hospitalLabel: string
    /** What the help/hospital tab shows for this role. */
    hospitalMode: 'find-doctor' | 'help-requests'
  }
}

export const ROLE_LABEL: Record<string, string> = {
  screener: 'Хэрэглэгч',
  teacher: 'Багш',
  parent: 'Эцэг эх',
  school_doctor: 'Сургуулийн эмч',
  dentist: 'Шүдний эмч',
  follow_up: 'Дагах ажилтан',
  admin: 'Администратор',
}

const TEACHER: RoleConfig = {
  label: ROLE_LABEL.teacher,
  showScanHero: true,
  sections: ['history'],
  quickActions: [
    { id: 'classes', icon: 'school', label: 'Анги', route: '/classes' },
    { id: 'stats', icon: 'stats-chart', label: 'Статистик', route: '/stats' },
    { id: 'calendar', icon: 'calendar', label: 'Хуанли', route: '/calendar' },
    { id: 'history', icon: 'bar-chart', label: 'Дүгнэлт', route: '/history' },
  ],
  tabs: { camera: true, hospital: true, hospitalLabel: 'Тусламж', hospitalMode: 'find-doctor' },
}

const PARENT: RoleConfig = {
  label: ROLE_LABEL.parent,
  showScanHero: true,
  sections: ['childResult'],
  quickActions: [
    { id: 'result', icon: 'person', label: 'Хүүхэд', route: '/history' },
    { id: 'dentist', icon: 'medkit', label: 'Эмч хайх', route: '/(tabs)/hospital' },
    { id: 'guide', icon: 'book', label: 'Сойз заавар', route: '/(tabs)/guide' },
    { id: 'history', icon: 'list', label: 'Түүх', route: '/history' },
  ],
  tabs: { camera: true, hospital: true, hospitalLabel: 'Эмч хайх', hospitalMode: 'find-doctor' },
}

const SCHOOL_DOCTOR: RoleConfig = {
  label: ROLE_LABEL.school_doctor,
  showScanHero: true,
  sections: ['schoolOverview', 'redStudents'],
  quickActions: [
    { id: 'stats', icon: 'stats-chart', label: 'Статистик', route: '/stats' },
    { id: 'history', icon: 'clipboard', label: 'Хяналт', route: '/history' },
    { id: 'calendar', icon: 'calendar', label: 'Хуанли', route: '/calendar' },
    { id: 'dentist', icon: 'medkit', label: 'Тусламж', route: '/(tabs)/hospital' },
  ],
  tabs: { camera: true, hospital: true, hospitalLabel: 'Тусламж', hospitalMode: 'find-doctor' },
}

const DENTIST: RoleConfig = {
  label: ROLE_LABEL.dentist,
  showScanHero: false,
  sections: ['helpRequests'],
  quickActions: [
    { id: 'requests', icon: 'hand-left', label: 'Хүсэлтүүд', route: '/(tabs)/hospital' },
    { id: 'stats', icon: 'stats-chart', label: 'Статистик', route: '/stats' },
    { id: 'history', icon: 'clipboard', label: 'Хяналт', route: '/history' },
  ],
  tabs: { camera: false, hospital: true, hospitalLabel: 'Хүсэлтүүд', hospitalMode: 'help-requests' },
}

const BY_ROLE: Partial<Record<UserRole, RoleConfig>> = {
  teacher: TEACHER,
  parent: PARENT,
  school_doctor: SCHOOL_DOCTOR,
  dentist: DENTIST,
}

/** Resolve the home/tab config for a role. Unknown roles (screener / admin /
 *  follow_up) fall back to the capture-centric teacher layout. */
export const roleConfigFor = (role: UserRole | string | null): RoleConfig =>
  BY_ROLE[(role ?? '') as UserRole] ?? TEACHER
