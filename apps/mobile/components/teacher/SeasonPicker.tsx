import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { seasonsForYear, seasonLabelMn } from '@pinequest/core'
import { useTheme } from '@/lib/ThemeContext'

type Props = {
  value: string
  onChange: (seasonId: string) => void
  /** Fallback option source: this year + next. Ignored when `options` is given. */
  year?: number
  /** Explicit season list (e.g. distinct seasons from the server), newest first. */
  options?: string[]
}

/** Horizontal chips of seasons. Uses the server-provided `options` when given,
 *  otherwise the screenable seasons for `year` (this year + next, summer excluded). */
const SeasonPicker = ({ value, onChange, year, options: optionsProp }: Props) => {
  const { colors } = useTheme()
  const fallbackYear = year ?? new Date().getFullYear()
  const options = optionsProp ?? [...seasonsForYear(fallbackYear), ...seasonsForYear(fallbackYear + 1)]
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
      {options.map((id) => {
        const active = id === value
        return (
          <TouchableOpacity
            key={id}
            style={[s.chip, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary + '22' : 'transparent' }]}
            onPress={() => onChange(id)}
            activeOpacity={0.7}
          >
            <Text style={[s.label, { color: active ? colors.primary : colors.textMuted }]}>{seasonLabelMn(id)}</Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  row: { gap: 8, paddingVertical: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 9999, borderWidth: StyleSheet.hairlineWidth },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium' },
})

export default SeasonPicker
