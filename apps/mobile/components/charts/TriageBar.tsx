import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { green: number; yellow: number; red: number; total: number }

const TriageBar = ({ green, yellow, red, total }: Props) => {
  const { colors } = useTheme()
  const none = Math.max(0, total - green - yellow - red)
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0)

  const segments = [
    { pct: pct(green), bg: colors.badgeGreen, label: `Ногоон ${green}` },
    { pct: pct(yellow), bg: colors.badgeYellow, label: `Шар ${yellow}` },
    { pct: pct(red), bg: colors.badgeRed, label: `Улаан ${red}` },
    { pct: pct(none), bg: colors.border, label: `Шалгаагүй ${none}` },
  ].filter((seg) => seg.pct > 0)

  return (
    <View style={s.wrap}>
      <View style={s.bar}>
        {segments.map((seg, i) => (
          <View key={i} style={[s.seg, { flex: seg.pct, backgroundColor: seg.bg }]} />
        ))}
      </View>
      <View style={s.legend}>
        {segments.map((seg, i) => (
          <View key={i} style={s.legendItem}>
            <View style={[s.dot, { backgroundColor: seg.bg }]} />
            <Text style={[s.legendText, { color: colors.textMuted }]}>{seg.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { gap: 8 },
  bar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', backgroundColor: '#E8E4DA' },
  seg: { height: 12 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
})

export default TriageBar
