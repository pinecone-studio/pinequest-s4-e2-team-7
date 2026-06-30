import { useState, useCallback, useEffect, useRef } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import { Outbox } from '@pinequest/sync'
import { SQLiteStore } from './sqliteStore'
import { getToken } from './auth'
import { API_BASE as BASE } from './config'

const store = new SQLiteStore()
export const outbox = new Outbox(store)

export type SyncState = {
  syncing: boolean
  lastResult: string | null
  pendingCount: number
  deadCount: number
}

const refreshCounts = async (): Promise<{ pendingCount: number; deadCount: number }> => {
  const [pendingCount, stuck] = await Promise.all([
    outbox.getPendingCount(),
    outbox.getStuck(),
  ])
  return { pendingCount, deadCount: stuck.length }
}

export const useOutboxSync = () => {
  const [state, setState] = useState<SyncState>({ syncing: false, lastResult: null, pendingCount: 0, deadCount: 0 })

  const sync = useCallback(async () => {
    const token = await getToken()
    const counts = await refreshCounts()
    if (!token) { setState(s => ({ ...s, ...counts })); return }
    setState(s => ({ ...s, syncing: true, lastResult: null, ...counts }))
    try {
      const stats = await outbox.sync(BASE, token)
      const after = await refreshCounts()
      if (stats.sent > 0 || stats.failed > 0) {
        setState({ syncing: false, lastResult: `↑ ${stats.sent} илгээсэн, ${stats.failed} алдаа`, ...after })
      } else {
        setState({ syncing: false, lastResult: null, ...after })
      }
    } catch {
      const after = await refreshCounts()
      setState({ syncing: false, lastResult: 'Синк амжилтгүй', ...after })
    }
  }, [])

  // Re-sync when app returns to foreground after being backgrounded
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && next === 'active') {
        void sync()
      }
      appStateRef.current = next
    })
    return () => sub.remove()
  }, [sync])

  // Re-sync the moment connectivity is restored. This is the key path for
  // no-signal areas: screenings captured offline flush automatically as soon as
  // the phone regains a reachable network, without waiting for a manual refresh
  // or an app foreground cycle. We fire only on the offline→online TRANSITION so
  // a stable connection doesn't re-trigger sync on every NetInfo change event.
  const wasConnectedRef = useRef(true)
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected && state.isInternetReachable !== false
      if (online && !wasConnectedRef.current) void sync()
      wasConnectedRef.current = online
    })
    return () => unsubscribe()
  }, [sync])

  const retryStuck = useCallback(async (id: string) => {
    await outbox.resetStuck(id)
    await sync()
  }, [sync])

  return { ...state, sync, retryStuck }
}
