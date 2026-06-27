import { useEffect } from 'react'
import type { HistoryCacheEntry } from '@pinequest/sync'
import { historyCache } from './sqliteHistoryCache'
import { getToken } from './auth'

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000'

/** Silently refreshes the history cache for a class on every mount. No-op when offline. */
export const useHistoryPrefetch = (classId: string, currentSeasonId: string) => {
  useEffect(() => {
    const run = async () => {
      const token = await getToken()
      if (!token) return
      const res = await fetch(
        `${BASE}/api/teacher/classes/${classId}/history-cache?excludeSeasonId=${currentSeasonId}`,
        { headers: { authorization: `Bearer ${token}` } },
      )
      if (!res.ok) return
      const { data } = (await res.json()) as { data: HistoryCacheEntry[] }
      if (Array.isArray(data) && data.length) await historyCache.putEntries(data)
    }
    run().catch(() => { /* offline — existing cache remains valid */ })
  }, [classId, currentSeasonId])
}
