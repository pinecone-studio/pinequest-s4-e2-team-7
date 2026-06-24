import Fastify from 'fastify'
import cors from '@fastify/cors'
import { prismaPlugin } from './plugins/prisma.js'
import { authPlugin } from './plugins/auth.js'
import { healthRoutes } from './routes/health.js'
import { authRoutes } from './routes/auth.js'
import { screeningRoutes } from './routes/screenings.js'
import { schoolRoutes } from './routes/schools.js'
import { classRoutes } from './routes/classes.js'
import { childRoutes } from './routes/children.js'
import { followUpRoutes } from './routes/followups.js'

const start = async (): Promise<void> => {
  const server = Fastify({ logger: true })

  await server.register(cors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  })

  // Decorators first (fastify-plugin propagates them to every route context).
  await server.register(prismaPlugin)
  await server.register(authPlugin)

  // Routes declare full explicit paths, so they register without a prefix.
  await server.register(healthRoutes)
  await server.register(authRoutes)
  await server.register(screeningRoutes)
  await server.register(schoolRoutes)
  await server.register(classRoutes)
  await server.register(childRoutes)
  await server.register(followUpRoutes)

  const port = Number(process.env.PORT) || 4000
  try {
    await server.listen({ port, host: '0.0.0.0' })
    console.log(`API server running at http://localhost:${port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

void start()
