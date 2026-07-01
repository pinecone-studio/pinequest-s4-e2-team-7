import { View, Text, TextInput, StyleSheet, type KeyboardTypeOptions } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = {
  value: string
  onChange: (v: string) => void
  /** Optional label above the field. Auth forms omit it (placeholder-only, like web). */
  label?: string
  placeholder?: string
  keyboard?: KeyboardTypeOptions
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
}

const TextField = ({ value, onChange, label, placeholder, keyboard, autoCapitalize }: Props) => {
  const { colors } = useTheme()
  const input = (
    <TextInput
      style={[s.input, { borderColor: colors.border, backgroundColor: colors.surfaceRaised, color: colors.textBase }]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textDisabled}
      keyboardType={keyboard}
      autoCapitalize={autoCapitalize}
    />
  )
  if (!label) return input
  return (
    <View style={s.group}>
      <Text style={[s.label, { color: colors.textMuted }]}>{label}</Text>
      {input}
    </View>
  )
}

const s = StyleSheet.create({
  group: { gap: 6 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 9999, paddingHorizontal: 18, height: 52, fontSize: 16, fontFamily: 'Inter_500Medium' },
})

export default TextField
