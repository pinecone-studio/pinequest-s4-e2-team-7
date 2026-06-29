import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { UserRole } from '@pinequest/types'
import { getMe, switchRole as switchRoleApi } from './api'
import { getUser, saveToken, saveUser, type AuthUser } from './auth'

type SessionValue = {
  user: AuthUser | null
  /** The role the UI should render for — the JWT's CURRENT (possibly switched) role. */
  activeRole: UserRole | null
  /** The provisioned (registered) role — unchanged by switching. */
  baseRole: UserRole | null
  /** True when the user also linked their own child. */
  hasParentLink: boolean
  /** Only a dual-role registration (staff role + linked child, i.e. Багш + Эцэг эх)
   *  may switch views. A plain parent or plain staff member cannot. */
  canSwitchRole: boolean
  loading: boolean
  /** Re-read the session (after login, or to pick up server-side changes). */
  refresh: () => Promise<void>
  /** Re-scope between the provisioned role and `parent`; persists the new token. */
  switchRole: (target: 'parent' | 'self') => Promise<void>
}

const SessionContext = createContext<SessionValue>({
  user: null,
  activeRole: null,
  baseRole: null,
  hasParentLink: false,
  canSwitchRole: false,
  loading: true,
  refresh: async () => {},
  switchRole: async () => {},
})

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [activeRole, setActiveRole] = useState<UserRole | null>(null)
  const [baseRole, setBaseRole] = useState<UserRole | null>(null)
  const [hasParentLink, setHasParentLink] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    // Stored user first → instant render even offline; then reconcile with the server.
    const stored = await getUser()
    if (stored) {
      setUser(stored)
      setActiveRole(stored.role as UserRole)
    }
    try {
      const me = await getMe()
      const role = (me.activeRole ?? me.role) as UserRole
      setActiveRole(role)
      setBaseRole(me.role as UserRole)
      setHasParentLink(!!me.hasParentLink)
      setUser((prev) => (prev ? { ...prev, name: me.name, role, schoolId: me.schoolId } : prev))
    } catch {
      // Offline / unauthenticated: keep the stored snapshot.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const switchRole = useCallback(async (target: 'parent' | 'self') => {
    const data = await switchRoleApi(target)
    await saveToken(data.token)
    await saveUser(data.user)
    setUser(data.user)
    setActiveRole(data.user.role as UserRole)
  }, [])

  // Dual-role = a STAFF provisioned role that ALSO has a linked child (the
  // "Багш + Эцэг эх" registration). A plain parent (baseRole 'parent') or a plain
  // staff member (no link) gets no switcher.
  const canSwitchRole = hasParentLink && !!baseRole && baseRole !== 'parent'

  const value = useMemo<SessionValue>(
    () => ({ user, activeRole, baseRole, hasParentLink, canSwitchRole, loading, refresh, switchRole }),
    [user, activeRole, baseRole, hasParentLink, canSwitchRole, loading, refresh, switchRole],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export const useSession = (): SessionValue => useContext(SessionContext)
