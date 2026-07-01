import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'

// Referral CTA only — the at-home steps live in ResultSummary ("Цаашид хэвшүүлэх арга хэмжээ").
export default function ResultYellowAdvice() {
  const { colors } = useTheme()
  const router = useRouter()
  return (
    <View style={s.container}>
      <View style={[s.referral, { backgroundColor: colors.triageYellowBg, borderColor: colors.triageYellowText }]}>
        <Text style={s.calIcon}>📅</Text>
        <Text style={[s.referralText, { color: colors.triageYellowText }]}>
          7–14 хоногийн дотор эмчид үзүүлэхийг зөвлөж байна
        </Text>
      </View>
      <TouchableOpacity
        style={[s.btn, { backgroundColor: colors.primary }]}
        onPress={() => router.push({ pathname: '/(tabs)/hospital', params: { segment: 'map' } } as never)}
      >
        <Text style={[s.btnText, { color: colors.primaryText }]}>Ойролцоох эмнэлэг санал болгох</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container: { gap: 10 },
  referral: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, borderWidth: 1.5 },
  calIcon: { fontSize: 20 },
  referralText: { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold', lineHeight: 20 },
  btn: { borderRadius: 9999, padding: 16, alignItems: 'center', marginTop: 4 },
  btnText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
})
