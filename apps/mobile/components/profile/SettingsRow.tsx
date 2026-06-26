import { Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

type Props = {
  icon: IoniconsName
  label: string
  value?: string
  valueColor?: string
  showChevron?: boolean
  onPress?: () => void
}

const SettingsRow = ({ icon, label, value, valueColor, showChevron, onPress }: Props) => {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      style={[s.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Ionicons name={icon} size={20} color={colors.textSecondary} style={s.icon} />
      <Text style={[s.label, { color: colors.textBase }]}>{label}</Text>
      {value ? (
        <Text style={[s.value, { color: valueColor ?? colors.textMuted }]}>{value}</Text>
      ) : null}
      {showChevron ? (
        <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
      ) : null}
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
  icon: { marginRight: 12 },
  label: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15 },
  value: { fontFamily: 'Inter_400Regular', fontSize: 15, marginRight: 4 },
})

export default SettingsRow
