import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'

type TriageLevel = 'green' | 'yellow' | 'red'

const MESSAGES: Record<TriageLevel, { label: string; message: string }> = {
  green: {
    label: 'Нормаль',
    message: 'Шүдний байдал хэвийн байна. Жилд нэгээс доошгүй удаа шүдний эмчид хяналт хийлгэнэ үү.',
  },
  yellow: {
    label: 'Хянах шаардлагатай',
    message: 'Хүүхдийн шүдэнд анхаарах асуудал илэрлээ. Ойрын хугацаанд шүдний эмчид үзүүлнэ үү.',
  },
  red: {
    label: 'Яаралтай эмчид хандах',
    message: 'Хүүхдийн шүдэнд ноцтой асуудал илэрлээ. Аль болох богино хугацаанд шүдний эмчид хандах хэрэгтэй.',
  },
}

export default function ResultScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const params = useLocalSearchParams<{ triageLevel: string; triageScore: string; detectionsCount: string; screeningId: string }>()

  const level = (params.triageLevel ?? 'green') as TriageLevel
  const info = MESSAGES[level] ?? MESSAGES.green
  const count = Number(params.detectionsCount ?? '0')
  const score = Number(params.triageScore ?? '0')

  const triageBg = level === 'green' ? colors.triageGreenBg : level === 'yellow' ? colors.triageYellowBg : colors.triageRedBg
  const triageText = level === 'green' ? colors.triageGreenText : level === 'yellow' ? colors.triageYellowText : colors.triageRedText

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={[s.badge, { backgroundColor: triageBg }]}>
        <Text style={[s.badgeText, { color: triageText }]}>{info.label}</Text>
      </View>
      <Text style={[s.message, { color: colors.textSecondary }]}>{info.message}</Text>
      <View style={s.meta}>
        <Text style={[s.metaText, { color: colors.textMuted }]}>{count} илрэл олдлоо</Text>
        <Text style={[s.metaText, { color: colors.textMuted }]}>Оноо: {score.toFixed(2)}</Text>
      </View>
      <View style={s.actions}>
        <TouchableOpacity style={[s.homeBtn, { backgroundColor: colors.sidebar }]} onPress={() => router.replace('/(tabs)')}>
          <Text style={s.homeBtnText}>Нүүр хуудас руу буцах</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.retakeBtn, { borderColor: colors.border }]} onPress={() => router.back()}>
          <Text style={[s.retakeBtnText, { color: colors.textMuted }]}>Дахин авах</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, padding: 24 },
  badge: { borderRadius: 16, padding: 20, alignItems: 'center', marginVertical: 20 },
  badgeText: { fontSize: 22, fontWeight: '800' },
  message: { fontSize: 16, lineHeight: 24, marginBottom: 20 },
  meta: { flexDirection: 'row', gap: 20, marginBottom: 32 },
  metaText: { fontSize: 14 },
  actions: { gap: 12 },
  homeBtn: { borderRadius: 12, padding: 16, alignItems: 'center' },
  homeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  retakeBtn: { borderWidth: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  retakeBtnText: { fontWeight: '600', fontSize: 15 },
})
