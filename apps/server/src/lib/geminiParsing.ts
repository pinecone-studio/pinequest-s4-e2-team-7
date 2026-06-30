import type { ScreeningGuidance } from '@pinequest/types'

/** Gemini API хариунаас текст хэсгүүдийг нэгтгэж гаргана. */
export const extractGeminiResponseText = (data: unknown): string => {
  const candidates =
    (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> } | undefined)
      ?.candidates ?? []
  const parts = candidates.flatMap((c) => c.content?.parts ?? [])
  return parts
    .map((p) => p.text ?? '')
    .filter(Boolean)
    .join('\n')
    .trim()
}

const asText = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

/**
 * Structured хариунаас дүгнэлт (advice) + дэлгэрэнгүй зөвлөмжийг (guidance) салгана.
 * responseSchema-ийн ачаар хариу нь markdown/тайлбаргүй цэвэр JSON тул шууд parse хийнэ.
 * Ховор parse алдаа гарвал бүх текстийг advice болгон буцаана.
 */
export const parseGuidance = (text: string): { advice: string; guidance?: ScreeningGuidance } => {
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(text.trim()) as Record<string, unknown>
  } catch {
    return { advice: text.trim() }
  }
  const guidance: ScreeningGuidance = {
    homeCare: asText(parsed.homeCare),
    brushing: asText(parsed.brushing),
    diet: asText(parsed.diet),
    prevention: asText(parsed.prevention),
    nextStep: asText(parsed.nextStep),
  }
  const hasGuidance = Object.values(guidance).some(Boolean)
  return { advice: asText(parsed.advice) || text.trim(), guidance: hasGuidance ? guidance : undefined }
}

export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

// Gemini-д өгөх ил тод JSON гэрээ (responseSchema). Загвар яг эдгээр 6 талбарыг,
// энэ дарааллаар, цэвэр JSON-оор буцаахаас өөр сонголтгүй болно.
export const GUIDANCE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    advice: { type: 'STRING' },
    homeCare: { type: 'STRING' },
    brushing: { type: 'STRING' },
    diet: { type: 'STRING' },
    prevention: { type: 'STRING' },
    nextStep: { type: 'STRING' },
  },
  required: ['advice', 'homeCare', 'brushing', 'diet', 'prevention', 'nextStep'],
  propertyOrdering: ['advice', 'homeCare', 'brushing', 'diet', 'prevention', 'nextStep'],
} as const
