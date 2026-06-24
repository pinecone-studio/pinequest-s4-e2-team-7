import type { FastifyInstance } from 'fastify'
import { childKey } from '@pinequest/core'

export const classRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get<{ Params: { schoolId: string } }>(
    '/api/schools/:schoolId/classes',
    { preHandler: [app.authenticate] },
    async (req) => {
      const classes = await app.prisma.schoolClass.findMany({
        where: { schoolId: req.params.schoolId },
        orderBy: [{ seasonId: 'desc' }, { name: 'asc' }],
      })
      return { success: true, data: classes }
    },
  )

  app.post<{ Params: { schoolId: string }; Body: { name: string; seasonId: string; gradeLevel?: number } }>(
    '/api/schools/:schoolId/classes',
    { preHandler: [app.authorize('admin')] },
    async (req, reply) => {
      const { name, seasonId, gradeLevel } = req.body
      const klass = await app.prisma.schoolClass.create({
        data: { schoolId: req.params.schoolId, name, seasonId, gradeLevel: gradeLevel ?? null },
      })
      return reply.code(201).send({ success: true, data: klass })
    },
  )

  // Carry a class forward into a new season: new class + copied roster, linked
  // via sourceClassId. Old class/screenings are untouched.
  app.post<{ Params: { classId: string }; Body: { newSeasonId: string; newName?: string } }>(
    '/api/classes/:classId/carry-forward',
    { preHandler: [app.authorize('admin')] },
    async (req, reply) => {
      const source = await app.prisma.schoolClass.findUnique({
        where: { id: req.params.classId },
        include: { children: { where: { isActive: true } } },
      })
      if (!source) return reply.code(404).send({ success: false, data: null })
      const { newSeasonId, newName } = req.body

      const newClass = await app.prisma.$transaction(async (tx) => {
        const created = await tx.schoolClass.create({
          data: {
            schoolId: source.schoolId,
            name: newName ?? source.name,
            seasonId: newSeasonId,
            gradeLevel: source.gradeLevel,
            sourceClassId: source.id,
          },
        })
        if (source.children.length) {
          await tx.child.createMany({
            data: source.children.map((c) => ({
              classId: created.id,
              schoolId: source.schoolId,
              childKey: childKey({
                schoolId: source.schoolId,
                className: created.name,
                rosterSlot: c.rosterSlot,
                birthYear: c.birthYear,
              }),
              firstName: c.firstName,
              lastName: c.lastName,
              birthYear: c.birthYear,
              rosterSlot: c.rosterSlot,
              gender: c.gender,
              guardianPhone: c.guardianPhone,
            })),
          })
        }
        return created
      })
      return reply.code(201).send({ success: true, data: newClass })
    },
  )
}
