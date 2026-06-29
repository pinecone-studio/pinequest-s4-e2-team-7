import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROLE_ROUTES: Record<string, string[]> = {
  '/dashboard/dentist': ['dentist', 'admin'],
  '/dashboard/follow-up': ['follow_up', 'admin'],
  '/dashboard': ['admin', 'school_doctor', 'teacher', 'parent', 'screener'],
}

export const middleware = (req: NextRequest): NextResponse => {
  const token = req.cookies.get('toothlings_token')?.value
  if (!token) return NextResponse.redirect(new URL('/?auth=1', req.url))

  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { role?: string; exp?: number }
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL('/?auth=1', req.url))
    }
    // Match on path-segment boundaries, not raw string prefix: otherwise the
    // admin board route '/dashboard/follow-ups' (plural) would be captured by the
    // '/dashboard/follow-up' (singular, worker board) rule and wrongly bounce
    // teachers/school doctors. A key matches only on an exact path or a real '/' boundary.
    const path = req.nextUrl.pathname
    const matched = Object.keys(ROLE_ROUTES).find((p) => path === p || path.startsWith(p + '/'))
    if (matched && !ROLE_ROUTES[matched].includes(payload.role ?? '')) {
      return NextResponse.redirect(new URL('/?auth=1', req.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/?auth=1', req.url))
  }

  return NextResponse.next()
}

export const config = { matcher: ['/dashboard/:path*'] }
