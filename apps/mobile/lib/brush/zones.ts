/**
 * Brushing zone label space — 12 zones = 4 quadrants × 3 surfaces + 1 idle.
 * Mirror of apps/web/src/lib/brush/zones.ts. Pure, no platform imports.
 */

export type BrushQuadrant = 'UL' | 'UR' | 'LL' | 'LR'
export type BrushSurface = 'outer' | 'inner' | 'occlusal'

/** idle = not brushing / transition. Never counted as coverage. */
export const IDLE_LABEL = 'idle'

export const QUADRANTS: BrushQuadrant[] = ['UL', 'UR', 'LL', 'LR']
export const SURFACES: BrushSurface[] = ['outer', 'inner', 'occlusal']

export type BrushLabel = `${BrushQuadrant}-${BrushSurface}` | typeof IDLE_LABEL

export const BRUSH_LABELS: BrushLabel[] = [
  ...QUADRANTS.flatMap((q) => SURFACES.map((s) => `${q}-${s}` as BrushLabel)),
  IDLE_LABEL,
]

export const parseBrushLabel = (
  label: string,
): { quadrant: BrushQuadrant; surface: BrushSurface } | null => {
  if (label === IDLE_LABEL) return null
  const [q, s] = label.split('-') as [BrushQuadrant, BrushSurface]
  if (!QUADRANTS.includes(q) || !SURFACES.includes(s)) return null
  return { quadrant: q, surface: s }
}

const QUADRANT_MN: Record<BrushQuadrant, string> = {
  UL: 'Дээд зүүн',
  UR: 'Дээд баруун',
  LL: 'Доод зүүн',
  LR: 'Доод баруун',
}

const SURFACE_MN: Record<BrushSurface, string> = {
  outer: 'гадна',
  inner: 'дотор',
  occlusal: 'зажлах',
}

export const quadrantLabelMn = (q: BrushQuadrant): string => QUADRANT_MN[q]
export const surfaceLabelMn = (s: BrushSurface): string => SURFACE_MN[s]

export const brushLabelMn = (label: string): string => {
  if (label === IDLE_LABEL) return 'Хүлээж байна'
  const parsed = parseBrushLabel(label)
  if (!parsed) return label
  return `${QUADRANT_MN[parsed.quadrant]} · ${SURFACE_MN[parsed.surface]}`
}
