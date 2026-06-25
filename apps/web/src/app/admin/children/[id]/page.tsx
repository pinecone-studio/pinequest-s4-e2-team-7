'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { TriageBadge } from '@/components/TriageBadge'
import { useChild } from '@/hooks/useChildren'
import { useScreenings } from '@/hooks/useScreenings'

const ChildDetailPage = () => {
  const id = useParams().id as string
  const { data: child } = useChild(id)
  const { data: screenings } = useScreenings({ childKey: child?.childKey })

  return (
    <section className="flex flex-col gap-5">
      <Link href="/admin" className="text-sm text-primary hover:underline">
        ← Сургуулиуд
      </Link>

      <div className="rounded-xl border border-border bg-surface p-5 shadow-(--shadow-card)">
        <h1 className="text-xl font-semibold tracking-tight text-text-base">
          {child ? `${child.lastName} ${child.firstName}` : '…'}
        </h1>
        {child && (
          <p className="mt-1 text-sm text-text-muted">
            Суудал {child.rosterSlot} · {child.birthYear} · <span className="font-mono">{child.childKey}</span>
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-(--shadow-card)">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text-muted">Скринингийн түүх</h2>
        </div>
        {screenings && screenings.length > 0 ? (
          <ul className="divide-y divide-border">
            {screenings.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <TriageBadge level={s.triageLevel} />
                <span className="text-text-base">{new Date(s.capturedAt).toLocaleDateString('mn-MN')}</span>
                <span className="text-text-muted">{s.seasonId}</span>
                <span className="text-text-muted">{s.findings.length} илрэл</span>
                <Link href={`/dentist/screenings/${s.id}`} className="ml-auto text-xs text-primary hover:underline">
                  Дэлгэрэнгүй
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-4 text-sm text-text-muted">Скрининг бүртгэгдээгүй байна.</p>
        )}
      </div>
    </section>
  )
}

export default ChildDetailPage
