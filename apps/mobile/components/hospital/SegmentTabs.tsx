import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Segment = 'doctors' | 'map'

type Props = {
  active: Segment
  onChange: (s: Segment) => void
}

const SegmentTabs = ({ active, onChange }: Props) => {
  const { colors } = useTheme()

  const Tab = ({ label, value }: { label: string; value: Segment }) => {
    const isActive = active === value
    return (
      <TouchableOpacity
        style={[s.tab, isActive && { backgroundColor: colors.primary }]}
        onPress={() => onChange(value)}
        activeOpacity={0.8}
      >
        <Text style={[s.label, { color: isActive ? colors.primaryText : colors.textMuted }]}>
          {label}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[s.row, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
      <Tab label="Эмч" value="doctors" />
      <Tab label="Газрын зураг" value="map" />
    </View>
  )
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9999,
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
})

export default SegmentTabs
