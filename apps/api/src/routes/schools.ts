import type { FastifyInstance } from 'fastify'

export const schoolRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/api/schools', { preHandler: [app.authenticate] }, async () => {
    const schools = await app.prisma.school.findMany({ orderBy: { name: 'asc' } })
    return { success: true, data: schools }
  })

  app.post<{ Body: { name: string; soumCode?: string; district?: string } }>(
    '/api/schools',
    { preHandler: [app.authorize('admin')] },
    async (req, reply) => {
      const { name, soumCode, district } = req.body
      const school = await app.prisma.school.create({
        data: { name, soumCode: soumCode ?? null, district: district ?? null },
      })
      return reply.code(201).send({ success: true, data: school })
    },
  )
}
