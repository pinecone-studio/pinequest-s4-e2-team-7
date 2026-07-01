import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import type { ColorTokens } from '@/lib/theme'
import type { TriageLevel } from '@/lib/api'

/** Color-coded triage chip. null = not screened yet. Wording matches the home summary
 *  tiles and stays non-diagnostic. */
const LABEL: Record<TriageLevel, string> = {
  green: 'Харьцангуй эрүүл',
  yellow: 'Эмчилгээ шаардлагатай',
  red: 'Яаралтай эмчилгээ',
}

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
      <Text style={[s.text, { color: fg }]} numberOfLines={1}>{level ? LABEL[level] : 'Шалгаагүй'}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  text: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
})

export default TriageBadge
