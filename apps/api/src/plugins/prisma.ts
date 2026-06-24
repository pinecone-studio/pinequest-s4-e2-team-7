import fp from 'fastify-plugin'
import { prisma, type PrismaClient } from '@pinequest/db'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

/** Decorate the server with the shared Prisma client singleton. */
export const prismaPlugin = fp(async (app) => {
  app.decorate('prisma', prisma)
  app.addHook('onClose', async () => {
    await app.prisma.$disconnect()
  })
})
