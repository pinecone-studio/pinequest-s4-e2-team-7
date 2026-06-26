'use client'

import { CheckIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { usePublishContent, type ContentVersion } from '@/hooks/useContent'
import StatusPill from '@/components/ui/StatusPill'
import Spinner from '@/components/ui/Spinner'

const ContentRow = ({ item }: { item: ContentVersion }) => {
  const publish = usePublishContent()
  const published = item.status === 'published'

  return (
    <div className="flex items-center gap-3 border-t border-border-muted px-5 py-3.5 first:border-t-0">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-text-base">
          {item.version} <span className="font-normal text-text-muted">· {item.locale}</span>
        </p>
        {item.notes
          ? <p className="truncate text-[11px] text-text-muted">{item.notes}</p>
          : <p className="text-[11px] text-text-muted">{new Date(item.publishedAt).toLocaleDateString('mn-MN')}</p>}
      </div>

      <StatusPill tone={published ? 'safe' : 'check'} variant="soft">
        {published ? 'Идэвхтэй' : 'Хүлээгдэж байна'}
      </StatusPill>

      {published ? (
        <span className="flex items-center gap-1 text-[12px] font-medium text-triage-green"><CheckIcon className="size-4" /></span>
      ) : (
        <button
          onClick={() => publish.mutate(item.id)}
          disabled={publish.isPending}
          className="btn flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-text-on-primary transition-all duration-150 hover:bg-primary-hover disabled:opacity-60"
        >
          {publish.isPending ? <Spinner className="size-3.5" /> : <><PaperAirplaneIcon className="size-3.5" /> Идэвхжүүлэх</>}
        </button>
      )}
    </div>
  )
}

export default ContentRow
