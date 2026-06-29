'use client'

import Link from 'next/link'
import type { QueueRow } from '@/hooks/useScreening'

const TINT:  Record<string, string> = { red: 'border-triage-red/30 bg-triage-red-bg', yellow: 'border-triage-yellow/30 bg-triage-yellow-bg', green: 'border-triage-green/30 bg-triage-green-bg' }
const DOT:   Record<string, string> = { red: 'bg-triage-red', yellow: 'bg-triage-yellow', green: 'bg-triage-green' }
const TXT:   Record<string, string> = { red: 'text-triage-red', yellow: 'text-triage-yellow', green: 'text-triage-green' }
const LABEL: Record<string, string> = { red: 'Яаралтай', yellow: 'Эмчилгээ', green: 'Дараагийн хяналт' }

// Review-queue item. "Холбогдох" opens the full screening detail where the
// dentist confirms or overrides the AI triage level (audited review event).
const ReviewQueueCard = ({ row }: { row: QueueRow }) => {
  const lvl = row.triageLevel

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border p-4 shadow-(--shadow-card) ${TINT[lvl] ?? 'border-border bg-surface'}`}>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2">
          <span className={`size-2.5 rounded-full ${DOT[lvl]}`} />
          <span className={`text-[13px] font-semibold ${TXT[lvl]}`}>{LABEL[lvl] ?? lvl}</span>
        </span>
        <span className="text-[11px] text-text-muted">{new Date(row.capturedAt).toLocaleDateString('mn-MN')}</span>
      </div>
      <span className="font-mono text-[12px] text-text-muted">{row.childKey.slice(0, 16)}…</span>

      <div className="mt-1 flex items-center gap-2">
        <Link
          href={`/dashboard/dentist/screenings/${row.id}`}
          className="btn rounded-full border border-border px-3 py-2 text-[12px] font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
        >
          Холбогдох
        </Link>
      </div>
    </div>
  )
}

export default ReviewQueueCard
