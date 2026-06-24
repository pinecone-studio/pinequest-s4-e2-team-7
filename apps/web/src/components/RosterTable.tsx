import Link from 'next/link'
import type { Child } from '@pinequest/types'

export const RosterTable = ({ rows }: { rows: Child[] }) => {
  if (rows.length === 0) {
    return <p className="text-sm text-text-muted">Хүүхэд бүртгэгдээгүй байна.</p>
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-text-muted">
            <th className="px-4 py-3 font-medium">Суудал</th>
            <th className="px-4 py-3 font-medium">Нэр</th>
            <th className="px-4 py-3 font-medium">Төрсөн он</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-border-muted last:border-0">
              <td className="px-4 py-3 text-text-muted">{c.rosterSlot}</td>
              <td className="px-4 py-3 text-text-base">
                {c.lastName} {c.firstName}
              </td>
              <td className="px-4 py-3 text-text-muted">{c.birthYear}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/children/${c.id}`}
                  className="text-primary hover:text-primary-hover hover:underline"
                >
                  Дэлгэрэнгүй
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
