import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { UserRole } from '@pinequest/types'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; role: UserRole; schoolId?: string }
    user: { sub: string; role: UserRole; schoolId?: string }
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    /** preHandler: require a valid JWT. */
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
    /** preHandler factory: require a valid JWT AND one of the given roles. */
    authorize: (
      ...roles: UserRole[]
    ) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

const unauthorized = { success: false, data: null, message: 'unauthorized' }
const forbidden = { success: false, data: null, message: 'forbidden' }

/** JWT auth + role-scoping. Roles are the single boundary; views scope off them. */
export const authPlugin = fp(async (app) => {
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  })

  app.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify()
    } catch {
      await reply.code(401).send(unauthorized)
    }
  })

  app.decorate('authorize', (...roles: UserRole[]) => {
    return async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        await req.jwtVerify()
      } catch {
        await reply.code(401).send(unauthorized)
        return
      }
      if (!roles.includes(req.user.role)) {
        await reply.code(403).send(forbidden)
      }
    }
  })
})
