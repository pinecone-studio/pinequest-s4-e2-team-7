'use client'

import { ChevronUpIcon } from '@heroicons/react/24/solid'
import type { FollowUpStatus } from '@pinequest/types'
import type { BoardStudent } from '@/hooks/useBoard'
import FollowUpCard from './FollowUpCard'

type ColMeta = { status: FollowUpStatus; label: string; dot: string; count: string }

type Props = {
  col: ColMeta
  cards: BoardStudent[]
  limit: number
  pageSize: number
  isOver: boolean
  draggingKey: string | null
  onDragOver: () => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: () => void
  onSend: (s: BoardStudent) => void
  onStatus: (childKey: string, status: FollowUpStatus) => void
  onEdit: (s: BoardStudent) => void
  onDragStart: (childKey: string) => void
  onDragEnd: () => void
  onShowMore: () => void
  onCollapse: () => void
}

const KanbanColumn = ({ col, cards, limit, pageSize, isOver, draggingKey, onDragOver, onDragLeave, onDrop, onSend, onStatus, onEdit, onDragStart, onDragEnd, onShowMore, onCollapse }: Props) => {
  const shown = cards.slice(0, limit)
  const remaining = cards.length - shown.length

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragOver() }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex min-w-70 flex-1 flex-col gap-3 rounded-2xl p-2 transition-all duration-150 ${isOver ? 'bg-primary-subtle/60 ring-2 ring-primary/30' : ''}`}
    >
      <div className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-[12.5px] font-bold ${col.count}`}>
        <span className={`size-2 rounded-full ${col.dot}`} />
        {col.label}
        <span className="rounded-full bg-surface/80 px-1.5 py-0.5 text-[11px] tabular-nums shadow-sm">{cards.length}</span>
      </div>

      <div className="flex min-h-[60px] flex-col gap-2.5">
        {cards.length === 0 ? (
          <div className={`rounded-2xl border-2 border-dashed py-10 text-center text-[12px] transition-colors duration-150 ${isOver ? 'border-primary/40 text-primary/60' : 'border-border/60 text-text-muted/40'}`}>
            {isOver ? 'Энд тавих' : 'Хоосон'}
          </div>
        ) : shown.map((s) => (
          <FollowUpCard key={s.id} student={s}
            onSend={() => onSend(s)}
            onStatus={(st) => onStatus(s.childKey, st)}
            onEdit={() => onEdit(s)}
            dragging={draggingKey === s.childKey}
            onDragStart={() => onDragStart(s.childKey)}
            onDragEnd={onDragEnd}
          />
        ))}
        {isOver && cards.length > 0 && <div className="h-1.5 rounded-full bg-primary/30" />}
      </div>

      {remaining > 0 && (
        <button onClick={onShowMore} className="btn mt-0.5 w-full rounded-full border border-dashed border-border py-2 text-[12px] font-medium text-text-muted transition-all duration-150 hover:border-primary/40 hover:bg-surface hover:text-primary active:scale-[0.98]">
          + {remaining} дараагийн
        </button>
      )}
      {limit > pageSize && remaining === 0 && (
        <button onClick={onCollapse} className="btn mt-0.5 flex w-full items-center justify-center gap-1 rounded-full py-1.5 text-[11px] text-text-muted/60 transition-colors hover:text-text-muted active:scale-[0.98]">
          Хураах <ChevronUpIcon className="size-3" />
        </button>
      )}
    </div>
  )
}

export default KanbanColumn
