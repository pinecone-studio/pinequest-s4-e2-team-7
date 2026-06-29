/** Tooth arch layout + visual state for the SVG monitor. Mirror of brushMl.ts. */

import type { ToothId } from './types'

export type ToothVisualState = 'clean' | 'partial' | 'missed'

export const toothVisualState = (coverage: number): ToothVisualState => {
  if (coverage >= 75) return 'clean'
  if (coverage >= 25) return 'partial'
  return 'missed'
}

export type ToothLayout = {
  id: ToothId
  x: number
  y: number
  w: number
  h: number
  rot: number
}

/** Arch layout for SVG rendering (patient view, mouth opens downward). */
export const buildToothLayout = (): ToothLayout[] => {
  const layouts: ToothLayout[] = []
  const cx = 200
  const rx = 138

  for (const arch of ['upper', 'lower'] as const) {
    for (const side of ['left', 'right'] as const) {
      for (let i = 1; i <= 8; i++) {
        const t = (i - 1) / 7
        const spread = side === 'left' ? Math.PI * (0.92 - t * 0.72) : Math.PI * (0.08 + t * 0.72)
        const cy = arch === 'upper' ? 118 : 192
        const ry = arch === 'upper' ? 52 : 48
        const x = cx + rx * Math.cos(spread)
        const y = cy + ry * Math.sin(spread)
        const w = 14 + (8 - i) * 0.6
        const h = 22 + (8 - i) * 0.8
        const rot = ((spread * 180) / Math.PI - 90) * (side === 'left' ? 1 : -1) * 0.35
        const prefix = arch === 'upper' ? 'U' : 'L'
        const id = `${prefix}-${side === 'left' ? 'L' : 'R'}${i}` as ToothId
        layouts.push({ id, x, y, w, h, rot })
      }
    }
  }
  return layouts
}
