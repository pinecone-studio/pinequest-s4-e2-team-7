'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { useCreateSchool, useSchools } from '@/hooks/useSchools'
import HeroStrip from '@/components/dashboard/HeroStrip'

const AdminDashboardPage = () => {
  const { data: schools, isLoading } = useSchools()
  const createSchool = useCreateSchool()
  const [name, setName] = useState('')

  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return
    createSchool.mutate({ name: name.trim() })
    setName('')
  }

  return (
    <section className="flex flex-col gap-5">
      <HeroStrip />

      <h2 className="text-lg font-semibold tracking-tight text-text-base">Сургуулиуд</h2>

      <form onSubmit={onAdd} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Шинэ сургуулийн нэр"
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-primary hover:bg-primary-hover transition-colors">
          Нэмэх
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-text-muted">Ачааллаж байна…</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {schools?.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/schools/${s.id}`}
                className="flex items-center rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-text-base transition-colors hover:bg-primary-subtle"
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default AdminDashboardPage
