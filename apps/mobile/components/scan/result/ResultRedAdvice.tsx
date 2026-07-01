import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { guardianPhone?: string; childKey?: string }

export default function ResultRedAdvice({ guardianPhone }: Props) {
  const { colors } = useTheme()

  const smsGuardian = () => {
    if (!guardianPhone) return
    const body = encodeURIComponent('Шүдний хяналтын дүн: Яаралтай эмчилгээ шаардлагатай ба шүдний эмч онош, эмчилгээг шийдэх болно')
    Linking.openURL(`sms:${guardianPhone}?body=${body}`)
  }

  if (!guardianPhone) return null

  return (
    <View style={s.container}>
      <TouchableOpacity style={[s.smsBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={smsGuardian}>
        <Text style={[s.smsBtnText, { color: colors.textBase }]}>📱 Эцэг эхэд мессеж илгээх</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container: { gap: 10 },
  smsBtn: { borderRadius: 9999, padding: 14, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth },
  smsBtnText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
})
