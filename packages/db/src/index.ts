import { PrismaClient } from '@prisma/client'

// Singleton client. Reused across hot-reloads in dev so we don't exhaust
// connections. The API server and any future server consumer import this.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export * from '@prisma/client'
