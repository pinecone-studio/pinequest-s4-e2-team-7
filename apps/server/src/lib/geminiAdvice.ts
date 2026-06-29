/**
 * Gemini зөвхөн эцэг эхэд зориулсан ЗӨВЛӨМЖ-ийн текст гаргана — detection/triage
 * биш. Энэ нь web дэх /api/inference/analyze-ийн advice seam-тэй ижил зарчим:
 * triage логик TS (packages/core) дотор үлдэнэ, загвар/AI зөвхөн илрүүлэлт + зөвлөмж.
 */
import type { InferenceDetection, SymptomSet, TriageLevel } from '@pinequest/types'

// YOLO class_name (snake_case) → УI дээр харуулах нэр.
const CLASS_LABEL: Record<string, string> = {
  caries: 'Кариес',
  cavity: 'Цооролт',
  crack: 'Хагарал',
}

const SYMPTOM_LABEL: Record<keyof SymptomSet, string> = {
  swelling: 'хавдар',
  painDisturbingSleepOrEating: 'нойр/хооллолтыг алдагдуулах өвдөлт',
  fever: 'халуурах',
  gumPimpleOrFistula: 'буйлны буглаа',
  trauma: 'гэмтэл',
}

/** Gemini унавал / тохиргоогүй үед ашиглах энгийн зөвлөмж. */
export const fallbackAdvice = (level: TriageLevel, count: number): string => {
  if (level === 'red')
    return `Яаралтай тусламж шаардлагатай байна. ${count} газарт ноцтой өөрчлөлт илэрлээ. Өнөөдөр эсвэл маргааш шүдний эмчид заавал үзүүлнэ үү.`
  if (level === 'yellow')
    return `${count} газарт анхаарал шаарддаг өөрчлөлт илэрлээ. Ойрын 1-2 долоо хоногт шүдний эмчид үзүүлэхийг зөвлөж байна.`
  return 'Шүдний байдал харьцангуй хэвийн байна. Жил бүрийн урьдчилан сэргийлэх үзлэгээ тогтмол хийлгэж байгаарай.'
}

const extractGeminiResponseText = (data: unknown): string => {
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

const parseAdvice = (text: string): string => {
  const cleaned = text.trim()
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const candidate = (fenced?.[1] ?? cleaned).trim()
  const firstBrace = candidate.indexOf('{')
  const lastBrace = candidate.lastIndexOf('}')
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      const parsed = JSON.parse(candidate.slice(firstBrace, lastBrace + 1)) as { advice?: unknown }
      if (typeof parsed.advice === 'string' && parsed.advice.trim()) return parsed.advice.trim()
    } catch {
      // fall through to raw text
    }
  }
  return candidate
}

const buildAdvicePrompt = (params: {
  triageLevel: TriageLevel
  detections: InferenceDetection[]
  symptoms: SymptomSet
}): string => {
  const findingLines = params.detections.length
    ? params.detections
        .slice()
        .sort((a, b) => b.confidence - a.confidence)
        .map(
          (d, i) =>
            `  ${i + 1}. ${CLASS_LABEL[d.className] ?? d.className} — итгэлцэл ${(d.confidence * 100).toFixed(0)}%`,
        )
        .join('\n')
    : '  (Загвар зургаас цоорол/хагарал илрүүлээгүй)'

  const symptomLines = (Object.keys(params.symptoms) as Array<keyof SymptomSet>)
    .filter((k) => params.symptoms[k])
    .map((k) => `  • ${SYMPTOM_LABEL[k] ?? k}`)
    .join('\n')

  return `Та хүүхдийн шүдний мэргэжилтэн эмч юм. Та өвчтөний эцэг эхтэй тайван, ойлгомжтой, найрсаг байдлаар ярьж байна. Хариуг ЗААВАЛ цэвэр монгол хэлээр бичнэ. Хятад, орос, англи үг огт хэрэглэхгүй.

ЧУХАЛ: Шүдний зураг дээрх илрүүлэлтийг (detection) АГ загвар (YOLO) аль хэдийн хийсэн. Доорх илрүүлсэн зүйлс болон аюулын зэрэглэл (triage) нь АЛБАН ЁСНЫ үр дүн — та үүнийг өөрчлөхгүй, зөвхөн эцэг эхэд зориулсан ойлгомжтой ЗӨВЛӨМЖ бичнэ.

═══════════════════════════════
ЗАГВАРЫН ИЛРҮҮЛСЭН ЗҮЙЛС (албан ёсны)
═══════════════════════════════
Аюулын зэрэглэл (triage): ${params.triageLevel}
${findingLines}

═══════════════════════════════
АСУУМЖИЙН ШИНЖ ТЭМДЭГ
═══════════════════════════════
${symptomLines || '  (Шинж тэмдэг тэмдэглээгүй)'}

═══════════════════════════════
ЗӨВЛӨМЖ БИЧИХ ЗАГВАР
═══════════════════════════════
3-4 өгүүлбэрээр эцэг эхэд хандан бичнэ үү:
  • 1-р өгүүлбэр: зургаас юу илэрсэн тухай (загварын илрүүлэлтэд тулгуурла)
  • 2-р өгүүлбэр: шинж тэмдэгтэй хэрхэн холбогдох тухай
  • 3-р өгүүлбэр: дараагийн алхам (яаралтай эсэх, хэзээ эмчид очих)
  • 4-р өгүүлбэр: гэрт авах арга хэмжээ

Зөвхөн дараах JSON-ийг буцаана. Өөр текст огт бичихгүй:
{ "advice": "Монгол хэлээр 3-4 өгүүлбэр." }`
}

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

/**
 * Gemini зөвлөмжийн текст гаргана (зураг + загварын илрүүлэлт + асуумж дээр
 * тулгуурлан). Тохиргоо/сүлжээ алдаа гарвал null буцаана — дуудагч fallback хийнэ.
 */
export const runGeminiAdvice = async (params: {
  apiKey: string
  model: string
  triageLevel: TriageLevel
  detections: InferenceDetection[]
  symptoms: SymptomSet
  image?: File
}): Promise<string | null> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    params.model,
  )}:generateContent?key=${params.apiKey}`

  const promptText = buildAdvicePrompt({
    triageLevel: params.triageLevel,
    detections: params.detections,
    symptoms: params.symptoms,
  })

  const parts: Array<Record<string, unknown>> = [{ text: promptText }]
  if (params.image) {
    try {
      const base64 = arrayBufferToBase64(await params.image.arrayBuffer())
      parts.push({ inlineData: { mimeType: params.image.type || 'image/jpeg', data: base64 } })
    } catch {
      // image optional — fall back to text-only prompt
    }
  }

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: { temperature: 0, maxOutputTokens: 2048, responseMimeType: 'application/json' },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error('Gemini advice request failed:', await res.text().catch(() => ''))
      return null
    }
    const text = extractGeminiResponseText(await res.json())
    return text ? parseAdvice(text) : null
  } catch (err) {
    console.error('Gemini advice error:', err)
    return null
  }
}
