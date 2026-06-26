'use client'

import { useState, type FormEvent } from 'react'
import { PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { useContent, useCreateContent } from '@/hooks/useContent'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import ContentRow from '@/components/admin/content/ContentRow'

const inp =
  'rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary'

const ContentPage = () => {
  const { data, isLoading } = useContent()
  const create = useCreateContent()
  const [showAdd, setShowAdd] = useState(false)
  const [version, setVersion] = useState('')
  const [notes, setNotes] = useState('')

  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!version.trim()) return
    create.mutate(
      { version: version.trim(), notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          setVersion('')
          setNotes('')
          setShowAdd(false)
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-text-base">Дүгнэлтийн сан</h1>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowAdd((v) => !v)}>
          <PlusIcon className="size-3.5" /> Хувилбар нэмэх
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={onAdd} className="flex flex-wrap gap-2">
          <input
            autoFocus
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="Хувилбар (ж: 2026.2)"
            className={`${inp} w-40`}
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Тайлбар (заавал биш)"
            className={`${inp} flex-1`}
          />
          <Button type="submit" loading={create.isPending}>
            Нэмэх
          </Button>
          <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>
            Болих
          </Button>
        </form>
      )}

      <Card pad={false}>
        {isLoading ? (
          <PageSpinner className="py-8" />
        ) : !data || data.length === 0 ? (
          <EmptyState
            Icon={DocumentTextIcon}
            title="Дүгнэлтийн сан хоосон байна"
            hint="Эхний хувилбараа нэмж идэвхжүүлнэ үү."
          />
        ) : (
          data.map((item) => <ContentRow key={item.id} item={item} />)
        )}
      </Card>
    </div>
  )
}

export default ContentPage
