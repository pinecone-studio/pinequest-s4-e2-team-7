import { TextInput, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { value: string; onChange: (v: string) => void; placeholder?: string }

// Placeholder-only password input — mirrors the web auth form's masked field.
const PinField = ({ value, onChange, placeholder = 'Нууц үг' }: Props) => {
  const { colors } = useTheme()
  return (
    <TextInput
      style={[s.input, { borderColor: colors.border, backgroundColor: colors.surfaceRaised, color: colors.textBase }]}
      value={value}
      onChangeText={onChange}
      secureTextEntry
      placeholder={placeholder}
      placeholderTextColor={colors.textDisabled}
      maxLength={64}
    />
  )
}

const s = StyleSheet.create({
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 9999, paddingHorizontal: 18, height: 52, fontSize: 16, fontFamily: 'Inter_500Medium' },
})

export default PinField
