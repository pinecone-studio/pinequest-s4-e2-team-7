import { verify } from 'hono/jwt'
import { createMiddleware } from 'hono/factory'
import type { Context } from 'hono'
import type { UserRole } from '@pinequest/types'
import type { AppEnv, JwtPayload } from '../types.js'

const secretOf = (c: Context<AppEnv>) => c.env.JWT_SECRET ?? 'dev-secret-change-me'

const readToken = async (c: Context<AppEnv>): Promise<JwtPayload | null> => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try {
    return (await verify(token, secretOf(c), 'HS256')) as unknown as JwtPayload
  } catch {
    return null
  }
}

export const authenticate = createMiddleware<AppEnv>(async (c, next) => {
  const payload = await readToken(c)
  if (!payload) return c.json({ success: false, data: null, message: 'unauthorized' }, 401)
  c.set('jwtPayload', payload)
  await next()
})

export const authorize = (...roles: UserRole[]) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const payload = await readToken(c)
    if (!payload) return c.json({ success: false, data: null, message: 'unauthorized' }, 401)
    if (!roles.includes(payload.role)) return c.json({ success: false, data: null, message: 'forbidden' }, 403)
    c.set('jwtPayload', payload)
    await next()
  })
