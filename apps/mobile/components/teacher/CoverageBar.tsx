import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { screened: number; enrolled: number; label?: string }

/** Screened-vs-enrolled coverage — the project's "attendance" signal. */
const CoverageBar = ({ screened, enrolled, label }: Props) => {
  const { colors } = useTheme()
  const pct = enrolled > 0 ? Math.min(1, screened / enrolled) : 0
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text style={[s.label, { color: colors.textMuted }]}>{label ?? 'Хамрагдалт'}</Text>
        <Text style={[s.value, { color: colors.textSecondary }]}>{screened}/{enrolled} · {Math.round(pct * 100)}%</Text>
      </View>
      <View style={[s.track, { backgroundColor: colors.surfaceRaised }]}>
        <View style={[s.fill, { width: `${pct * 100}%`, backgroundColor: colors.primary }]} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { gap: 6 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  value: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  track: { height: 8, borderRadius: 999, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 999 },
})

export default CoverageBar
