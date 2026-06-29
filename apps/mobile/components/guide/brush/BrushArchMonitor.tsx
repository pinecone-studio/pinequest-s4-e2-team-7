import { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg'
import { buildToothLayout, toothVisualState } from '@/lib/brushMl/layout'
import type { BrushMlState } from '@/lib/brushMl/types'

const FILL: Record<ReturnType<typeof toothVisualState>, { fill: string; stroke: string }> = {
  clean: { fill: 'url(#tClean)', stroke: '#E2E8F0' },
  partial: { fill: 'url(#tPartial)', stroke: '#FCD34D' },
  missed: { fill: 'url(#tMissed)', stroke: '#38BDF8' },
}

type Props = { mlState: BrushMlState; running: boolean }

/** Per-tooth arch coverage — white = clean, yellow = partial, blue = missed. */
export const BrushArchMonitor = ({ mlState, running }: Props) => {
  const layouts = useMemo(() => buildToothLayout(), [])
  const coverageById = useMemo(
    () => Object.fromEntries(mlState.teeth.map((t) => [t.id, t.coverage])),
    [mlState.teeth],
  )
  const ring = 2 * Math.PI * 46
  const progress = Math.min(100, mlState.overallCoverage)

  return (
    <View style={s.card}>
      <Text style={s.zoneLabel}>{mlState.zoneLabel}</Text>
      <Svg viewBox="0 0 400 310" width="100%" height={236}>
        <Defs>
          <LinearGradient id="tClean" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#F1F5F9" />
          </LinearGradient>
          <LinearGradient id="tPartial" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FEF9C3" />
            <Stop offset="1" stopColor="#FDE047" />
          </LinearGradient>
          <LinearGradient id="tMissed" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#7DD3FC" />
            <Stop offset="1" stopColor="#0EA5E9" />
          </LinearGradient>
        </Defs>

        <Ellipse cx="200" cy="155" rx="168" ry="118" fill="rgba(255,255,255,0.12)" />
        {layouts.map((l) => {
          const colors = FILL[toothVisualState(coverageById[l.id] ?? 0)]
          const active = running && mlState.activeToothId === l.id
          return (
            <G key={l.id} transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}>
              <Rect
                x={-l.w / 2} y={-l.h / 2} width={l.w} height={l.h} rx={l.w * 0.35}
                fill={colors.fill} stroke={active ? '#0EA5E9' : colors.stroke} strokeWidth={active ? 2.5 : 1.2}
              />
            </G>
          )
        })}

        <Circle cx="200" cy="155" r="52" fill="rgba(255,255,255,0.22)" />
        <Circle cx="200" cy="155" r="46" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="6" />
        <Circle
          cx="200" cy="155" r="46" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${(progress / 100) * ring} ${ring}`} transform="rotate(-90 200 155)"
        />
        <SvgText x="200" y="160" textAnchor="middle" fill="#FFFFFF" fontSize="26" fontWeight="bold">
          {`${progress}%`}
        </SvgText>
      </Svg>
      <Text style={s.legend}>Цагаан = угаасан · шар = дутуу · цэнхэр = алгассан</Text>
    </View>
  )
}

const s = StyleSheet.create({
  card: { borderRadius: 20, backgroundColor: '#BAE6FD', paddingVertical: 18, paddingHorizontal: 12, overflow: 'hidden' },
  zoneLabel: { textAlign: 'center', color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  legend: { textAlign: 'center', color: 'rgba(255,255,255,0.92)', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 8 },
})
