import type { QuestionnaireAnswer } from '@pinequest/types'

export type Q = { key: string; text: string; type: 'bool' | 'choice'; choices?: string[] }

/** The screener questionnaire, asked in order on the capture device. */
export const QUESTIONS: Q[] = [
  { key: 'toothPain', text: 'Өвддөг шүд байгаа юу?', type: 'bool' },
  {
    key: 'painTrigger', text: 'Ямар үед өвддөг вэ?', type: 'choice', choices: [
      'Хүйтэн зүйл идэхэд өвддөг',
      'Халуун зүйл идэхэд өвддөг',
      'Өөрөө аяндаа өвддөг',
      'Шөнө өвддөг',
    ],
  },
  {
    key: 'painDuration', text: 'Хэзээнээс өвдөж эхлэсэн бэ?', type: 'choice', choices: [
      'Өчигдрөөс',
      '2-оос дээш хоног',
      '4-өөс дээш хоног',
    ],
  },
  { key: 'swellingFever', text: 'Халуурах эсвэл эрүү, нүүр орчмоор хавдаж байсан уу?', type: 'bool' },
]

/**
 * Turn the device's raw answers object (`{ toothPain: true, ... }`) into the
 * verbatim Q&A pairs we store + show on the board — in question order, skipping
 * questions the flow never reached (e.g. pain follow-ups when there's no pain).
 */
export const formatAnswers = (questionnaire: string): QuestionnaireAnswer[] => {
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(questionnaire || '{}') as Record<string, unknown>
  } catch {
    return []
  }
  const out: QuestionnaireAnswer[] = []
  for (const q of QUESTIONS) {
    if (!(q.key in parsed)) continue
    const v = parsed[q.key]
    const a = typeof v === 'boolean' ? (v ? 'Тийм' : 'Үгүй') : String(v)
    out.push({ q: q.text, a })
  }
  return out
}
