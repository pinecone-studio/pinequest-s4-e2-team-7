import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import type { ColorTokens } from '@/lib/theme'
import type { TriageLevel } from '@/lib/api'

/** Color-coded triage chip. null = not screened yet. Wording stays non-diagnostic. */
const LABEL: Record<TriageLevel, string> = { green: 'Ногоон', yellow: 'Шар', red: 'Улаан' }

const tone = (c: ColorTokens, level: TriageLevel | null) => {
  if (level === 'red') return { bg: c.triageRedBg, fg: c.triageRedText }
  if (level === 'yellow') return { bg: c.triageYellowBg, fg: c.triageYellowText }
  if (level === 'green') return { bg: c.triageGreenBg, fg: c.triageGreenText }
  return { bg: c.surfaceRaised, fg: c.textMuted }
}

const TriageBadge = ({ level }: { level: TriageLevel | null }) => {
  const { colors } = useTheme()
  const { bg, fg } = tone(colors, level)
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      <View style={[s.dot, { backgroundColor: fg }]} />
      <Text style={[s.text, { color: fg }]}>{level ? LABEL[level] : 'Шалгаагүй'}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
})

export default TriageBadge
