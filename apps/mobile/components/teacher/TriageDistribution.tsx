import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

// Segmented horizontal bar of green/yellow/red counts (hand-built, no chart lib).
const TriageDistribution = ({ green, yellow, red }: { green: number; yellow: number; red: number }) => {
  const { colors } = useTheme()
  const total = green + yellow + red
  const items = [
    { label: 'Ногоон', n: green, color: colors.triageGreenText },
    { label: 'Шар', n: yellow, color: colors.triageYellowText },
    { label: 'Улаан', n: red, color: colors.triageRedText },
  ]
  return (
    <View style={s.wrap}>
      <View style={[s.bar, { backgroundColor: colors.surfaceRaised }]}>
        {total > 0 && items.map((it) => (it.n > 0 ? <View key={it.label} style={{ flex: it.n, backgroundColor: it.color }} /> : null))}
      </View>
      <View style={s.legend}>
        {items.map((it) => (
          <View key={it.label} style={s.item}>
            <View style={[s.swatch, { backgroundColor: it.color }]} />
            <Text style={[s.text, { color: colors.textSecondary }]}>{it.label} · {it.n}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  bar: { flexDirection: 'row', height: 16, borderRadius: 999, overflow: 'hidden' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  text: { fontSize: 12, fontFamily: 'Inter_500Medium' },
})

export default TriageDistribution
