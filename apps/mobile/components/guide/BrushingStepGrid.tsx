import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import BrushingStepCard, { BrushingStep } from './BrushingStepCard'

type Props = { steps: BrushingStep[] }

export default function BrushingStepGrid({ steps }: Props) {
  const { colors } = useTheme()

  return (
    <View style={s.container}>
      <Text style={[s.sectionLabel, { color: colors.textMuted }]}>АЛХАМ АЛХМААР</Text>
      <View style={s.timeline}>
        {steps.map((step, i) => {
          const isFirst = i === 0
          const isLast = i === steps.length - 1
          return (
            <View key={i} style={[s.row, isLast && s.rowLast]}>
              <View style={s.rail}>
                {!isFirst && <View style={[s.line, s.lineTop, { backgroundColor: colors.border }]} />}
                {!isLast && <View style={[s.line, s.lineBottom, { backgroundColor: colors.border }]} />}
                <View style={[s.node, { backgroundColor: colors.primary }]}>
                  <Text style={[s.nodeText, { color: colors.primaryText }]}>{i + 1}</Text>
                </View>
              </View>
              <View style={s.cardWrap}>
                <BrushingStepCard {...step} />
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const NODE = 28
const LINE = 2
const GAP = 12

const s = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 20 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 10 },
  timeline: {},
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: GAP },
  rowLast: { marginBottom: 0 },
  rail: { width: NODE, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  line: { position: 'absolute', width: LINE, left: (NODE - LINE) / 2 },
  lineTop: { top: -GAP, bottom: '50%' },
  lineBottom: { top: '50%', bottom: -GAP },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  cardWrap: { flex: 1, marginLeft: 12 },
})
