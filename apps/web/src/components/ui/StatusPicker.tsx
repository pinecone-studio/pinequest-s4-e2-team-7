'use client'

import {
  MinusCircleIcon, UserIcon, CheckCircleIcon,
  XCircleIcon, QuestionMarkCircleIcon,
} from '@heroicons/react/24/solid'
import type { FollowUpStatus } from '@pinequest/types'
import Dropdown, { type DropdownOption } from './Dropdown'

// Follow-up status options for the shared Dropdown. The colour rides on the
// ICON (theme-aware fu-*/triage tokens), so the trigger itself stays neutral
// and identical to every other dropdown in the admin section.
export const STATUS_OPTIONS: DropdownOption<FollowUpStatus>[] = [
  { value: 'flagged',           label: 'Хэвийн',              Icon: MinusCircleIcon,          iconClass: 'text-text-muted' },
  { value: 'doctor_connected',  label: 'Эмчтэй холбосон',     Icon: UserIcon,                 iconClass: 'text-fu-doctor' },
  { value: 'treatment_done',    label: 'Эмчилгээ хийлгэсэн',  Icon: CheckCircleIcon,          iconClass: 'text-fu-done' },
  { value: 'treatment_refused', label: 'Эмчилгээ хийлгээгүй', Icon: XCircleIcon,              iconClass: 'text-triage-red' },
  { value: 'unclear',           label: 'Тодорхойгүй',         Icon: QuestionMarkCircleIcon,   iconClass: 'text-triage-yellow' },
]

type Props = { value: FollowUpStatus; onChange: (v: FollowUpStatus) => void }

const StatusPicker = ({ value, onChange }: Props) => (
  <Dropdown value={value} options={STATUS_OPTIONS} onChange={onChange} ariaLabel="Дагалтын төлөв" className="min-w-0 flex-1" />
)

export default StatusPicker
