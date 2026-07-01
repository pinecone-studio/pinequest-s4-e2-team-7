import type { ChildSummaryPayload } from '@/hooks/useChildSummary'
import { formatDateMn } from '@/lib/dateMn'
import {
  headerHtml, photosHtml, questionnaireHtml, adviceHtml, guidanceHtml,
  dentistNoteHtml, hospitalHtml, contactHtml, disclaimerHtml,
} from '@/lib/parentPdfSections'

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(new Error('read_failed'))
    r.readAsDataURL(blob)
  })

// Screening photos are private (auth-scoped R2) — fetch each with the Bearer token
// and inline it as a data URL so the saved PDF embeds the bytes (a plain <img src>
// to the API can't send the header, exactly why the board uses <AuthImage>).
const fetchImages = async (screeningId: string, count: number, token: string | null): Promise<string[]> => {
  if (!token || !count) return []
  const out = await Promise.all(
    Array.from({ length: count }, async (_, i) => {
      try {
        const res = await fetch(`/api/screenings/${screeningId}/image/${i}`, { headers: { authorization: `Bearer ${token}` } })
        return res.ok ? await blobToDataUrl(await res.blob()) : null
      } catch {
        return null
      }
    }),
  )
  return out.filter((x): x is string => !!x)
}

const SHELL_STYLE = `* { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; padding: 32px 24px; max-width: 640px; margin: 0 auto; color: #111827; }
  @media print { body { padding: 0; } .no-print { display: none; } }`

/**
 * Parent-facing PDF for one child's latest screening. Mirrors the summary modal
 * card (StudentSummaryBody) section-for-section; for a RED child it appends the
 * dentist's confirm/override note with its full details.
 */
export const printChildSummary = async (
  name: string,
  detail: ChildSummaryPayload,
  token: string | null,
): Promise<void> => {
  const s = detail.summary
  if (!s) return

  // Open synchronously (still inside the click gesture) so the popup isn't blocked,
  // then fill it once the private photos have loaded.
  const win = window.open('', '_blank', 'width=760,height=960')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html lang="mn"><head><meta charset="UTF-8"><title>${name}</title></head><body style="font-family:sans-serif;padding:48px;text-align:center;color:#6B7280;">Уншиж байна…</body></html>`)
  win.document.close()

  const level = s.effectiveLevel
  const images = await fetchImages(s.screeningId, detail.imageRefs.length, token)

  const body = [
    headerHtml(name, formatDateMn(s.capturedAt), level),
    photosHtml(images),
    questionnaireHtml(detail),
    adviceHtml(detail, name),
    guidanceHtml(detail),
    level === 'red' && detail.dentistNote ? dentistNoteHtml(detail.dentistNote) : '',
    detail.hospital ? hospitalHtml(detail.hospital) : '',
    contactHtml(detail.child.guardianPhone, detail.child.guardianEmail),
    disclaimerHtml(),
  ].join('')

  const html = `<!DOCTYPE html><html lang="mn"><head>
    <meta charset="UTF-8"><title>Шүдний үзүүлэлт — ${name}</title>
    <style>${SHELL_STYLE}</style>
  </head><body>
    ${body}
    <div class="no-print" style="margin-top:24px;text-align:center;">
      <button onclick="window.print()" style="background:#52A075;border:none;border-radius:10px;padding:10px 28px;font-size:14px;font-weight:700;cursor:pointer;color:#ffffff;">PDF хадгалах / Хэвлэх</button>
    </div>
  </body></html>`

  win.document.open()
  win.document.write(html)
  win.document.close()
  win.focus()
}
