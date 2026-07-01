import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import { shortChildNameFromFull } from '@/lib/childName'
import type { ScreeningRow } from '@/lib/profileData'


const LEVEL_LABEL: Record<string, string> = {
  green:  'Эрүүл',
  yellow: 'Анхааруул',
  red:    'Яаралтай',
}

type Props = {
  row: ScreeningRow
  showName: boolean
}

const HistoryRow = ({ row, showName }: Props) => {
  const { colors } = useTheme()
  const levelText = LEVEL_LABEL[row.triageLevel] ?? row.triageLevel
  const label = showName ? `${shortChildNameFromFull(row.childName)} · ${levelText}` : levelText

  const dotColor =
    row.triageLevel === 'green'  ? colors.badgeGreen :
    row.triageLevel === 'red'    ? colors.badgeRed   :
    colors.primary

  return (
    <TouchableOpacity
      style={[s.row, { borderBottomColor: colors.border }]}
      activeOpacity={0.7}
    >
      <View style={[s.dot, { backgroundColor: dotColor }]} />
      <View style={s.info}>
        <Text style={[s.label, { color: colors.textBase }]}>{label}</Text>
        <Text style={[s.date, { color: colors.textMuted }]}>{row.date}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  info: { flex: 1 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 15 },
  date: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },
})

export default HistoryRow
