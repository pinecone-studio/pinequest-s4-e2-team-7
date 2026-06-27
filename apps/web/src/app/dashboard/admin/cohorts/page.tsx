'use client'

import { useState, type FormEvent } from 'react'
import { PlusIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline'
import { useSchools, useCreateSchool } from '@/hooks/useSchools'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import CohortCard from '@/components/admin/cohorts/CohortCard'
import Modal from '@/components/ui/Modal'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'

const CohortsPage = () => {
  const { data: schools } = useSchools()
  const createSchool = useCreateSchool()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  useSetPageHeader({
    title: 'Сургууль ба анги бүлгүүд',
    subtitle: 'Үзүүлэлтийн хамрах сургуулиуд',
    actions: (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <PlusIcon className="size-3.5" /> Сургууль нэмэх
      </Button>
    ),
  })

  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return
    createSchool.mutate({ name: name.trim() })
    setName('')
    setOpen(false)
  }

  return (
    <>
      <Modal
        open={open}
        onClose={() => { setOpen(false); setName('') }}
        title="Сургууль нэмэх"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Болих</Button>
            <Button type="submit" form="add-school-form" loading={createSchool.isPending}>Нэмэх</Button>
          </>
        }
      >
        <form id="add-school-form" onSubmit={onAdd}>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Сургуулийн нэр"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>
      </Modal>

      {!schools || schools.length === 0 ? (
        <Card>
          <EmptyState Icon={BuildingLibraryIcon} title="Сургууль алга" hint="Эхний сургуулиа нэмж үзүүлэлт хамралтыг эхлүүл." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {schools.map((s) => <CohortCard key={s.id} school={s} />)}
        </div>
      )}
    </>
  )
}

export default CohortsPage
