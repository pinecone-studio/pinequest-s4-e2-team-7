import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getQuestionnaire, questionnaireSymptoms, type ScanResult } from '@/lib/consumerState'
import { useSession } from '@/components/providers'
import { saveScreening } from '@/lib/screeningApi'
import type { ScreenTarget } from '@/components/consumer/caries/ClassChildPicker'

// Багш скрининг хадгалмагц дашбордын эдгээр кэшийг шинэчилнэ → самбар, ажлын жагсаалт,
// эмчийн хяналт, статистик, тухайн хүүхдийн түүх бүгд автоматаар синк болно.
const SYNC_KEYS = [
  'board-students', 'screenings', 'review-queue', 'stats',
  'child-summary', 'child-history', 'children', 'classes',
]

const toPayload = (scan: ScanResult, target: ScreenTarget, persistUrl: string) => {
  const base64 = persistUrl.includes(',') ? persistUrl.slice(persistUrl.indexOf(',') + 1) : persistUrl
  const id = crypto.randomUUID()
  return {
    id,
    childKey: target.childKey,
    classId: target.classId,
    schoolId: target.schoolId,
    seasonId: target.seasonId,
    screenedById: '',
    imageRefs: [`web:${id}:0`],
    imageData: [base64],
    findings: scan.findings ?? [],
    symptoms: questionnaireSymptoms(getQuestionnaire()),
    triage: { level: scan.triage, score: scan.triageScore ?? 0, confidentWording: scan.confidentWording ?? false },
    modelName: 'yolov8+gemini',
    contentVersionId: 'default',
    capturedAt: scan.createdAt,
    summary: { advice: scan.advice, guidance: scan.guidance },
  }
}

/** Persist a teacher/doctor screening to the DB, then refresh every dashboard view. */
export const useSaveScreening = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { scan: ScanResult; target: ScreenTarget; persistUrl: string }) =>
      saveScreening(token, toPayload(v.scan, v.target, v.persistUrl)),
    onSuccess: () => {
      for (const key of SYNC_KEYS) qc.invalidateQueries({ queryKey: [key] })
    },
  })
}
