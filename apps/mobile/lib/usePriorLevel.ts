import { useState, useEffect } from 'react'
import { historyCache } from './sqliteHistoryCache'

/** Returns the cached prior-season triage level for a child, or null if not yet cached. */
export const usePriorLevel = (childKey: string) => {
  const [priorLevel, setPriorLevel] = useState<string | null>(null)
  useEffect(() => {
    historyCache.getByChildKey(childKey).then((entry) => {
      if (entry) setPriorLevel(entry.triageLevel)
    }).catch(() => {})
  }, [childKey])
  return priorLevel
}
