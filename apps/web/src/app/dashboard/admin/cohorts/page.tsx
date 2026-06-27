'use client'

import { useState } from 'react'
import { PlusIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline'
import { useSchools, useCreateSchool } from '@/hooks/useSchools'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'
import { useMe } from '@/hooks/useMe'
import SchoolSection from '@/components/admin/cohorts/SchoolSection'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonTable } from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

const CohortsPage = () => {
  const { data: schools, isLoading } = useSchools()
  const { data: me } = useMe()
  const create = useCreateSchool()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [district, setDistrict] = useState('')

  useSetPageHeader({ title: 'Сургууль ба анги бүлгүүд', subtitle: 'Үзүүлэлтийн хамрах сургуулиуд' })

  const isAdmin = me?.role === 'admin'

  const onAdd = () => {
    if (!name.trim()) return
    create.mutate({ name: name.trim(), district: district.trim() || undefined }, {
      onSuccess: () => { setAdding(false); setName(''); setDistrict('') },
    })
  }

  if (isLoading) return <SkeletonTable />

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-text-muted">
          {schools?.length ?? 0} сургууль
        </p>
        {isAdmin && (
          <Button variant="primary" size="sm" onClick={() => setAdding(true)}>
            <PlusIcon className="size-4" /> Сургууль нэмэх
          </Button>
        )}
      </div>

      {(!schools || schools.length === 0) ? (
        <EmptyState
          Icon={BuildingLibraryIcon}
          title="Сургууль бүртгэгдээгүй"
          hint="Сургуулийн мэдээлэл нэмснээр ангиуд энд харагдана."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {schools.map((s) => <SchoolSection key={s.id} school={s} />)}
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="Сургууль нэмэх" size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdding(false)}>Болих</Button>
            <Button variant="primary" onClick={onAdd} disabled={!name.trim() || create.isPending}>Нэмэх</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Сургуулийн нэр" autoFocus
            className="rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-text-base placeholder:text-text-muted focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input value={district} onChange={(e) => setDistrict(e.target.value)}
            placeholder="Дүүрэг / сум (заавал биш)"
            className="rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-text-base placeholder:text-text-muted focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </Modal>
    </section>
  )
}

export default CohortsPage
