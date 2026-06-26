import { View, Text, StyleSheet } from 'react-native'
import type { TimeseriesBucket } from '@/lib/api'
import { useTheme } from '@/lib/ThemeContext'

type Props = { buckets: TimeseriesBucket[] }

const TrendBars = ({ buckets }: Props) => {
  const { colors } = useTheme()
  const last8 = buckets.slice(-8)
  const maxVal = Math.max(...last8.map((b) => b.screened), 1)
  const BAR_MAX_H = 80

  return (
    <View style={s.wrap}>
      <View style={[s.chart, { borderColor: colors.border }]}>
        {last8.map((b, i) => {
          const barH = Math.max(4, (b.screened / maxVal) * BAR_MAX_H)
          const flagH = b.screened > 0 ? Math.round((b.flagged / b.screened) * barH) : 0
          const label = new Date(b.ts).toLocaleDateString('mn-MN', { month: 'numeric', day: 'numeric' })
          return (
            <View key={i} style={s.col}>
              <View style={[s.barContainer, { height: BAR_MAX_H }]}>
                <View style={[s.bar, { height: barH, backgroundColor: colors.badgeGreen }]}>
                  {flagH > 0 && (
                    <View style={[s.flagOverlay, { height: flagH, backgroundColor: colors.badgeYellow }]} />
                  )}
                </View>
              </View>
              <Text style={[s.axisLabel, { color: colors.textDisabled }]} numberOfLines={1}>{label}</Text>
            </View>
          )
        })}
      </View>
      <View style={s.legend}>
        <View style={s.legendItem}>
          <View style={[s.dot, { backgroundColor: colors.badgeGreen }]} />
          <Text style={[s.legendText, { color: colors.textMuted }]}>Шалгасан</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.dot, { backgroundColor: colors.badgeYellow }]} />
          <Text style={[s.legendText, { color: colors.textMuted }]}>Тэмдэглэгдсэн</Text>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, paddingBottom: 6, borderBottomWidth: 1 },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  barContainer: { justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: 16, borderRadius: 4, position: 'relative', overflow: 'hidden' },
  flagOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  axisLabel: { fontSize: 10, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  legend: { flexDirection: 'row', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
})

export default TrendBars
