import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

export type TriageLevel = 'green' | 'yellow' | 'red'

// SCREENING-not-diagnosis wording: green = "no danger signs seen in THESE photos", never "healthy/no cavities"
const CONFIG: Record<
  TriageLevel,
  { label: string; subtitle: string; icon: 'checkmark-circle-outline' | 'time-outline' | 'alert-circle-outline'; iconColor: string }
> = {
  green: {
    label: 'Одоогоор аюулын шинж харагдсангүй',
    subtitle: 'Эдгээр зурагт тодорхой аюулын шинж тэмдэг илрээгүй',
    icon: 'checkmark-circle-outline',
    iconColor: '#2A7D4F',
  },
  yellow: {
    label: 'Шүдний эмчид үзүүлэх шаардлагатай',
    subtitle: 'Анхаарал шаарддаг шинж тэмдэг илэрсэн тул эмчид үзүүлэхийг зөвлөж байна',
    icon: 'time-outline',
    iconColor: '#8A6500',
  },
  red: {
    label: 'Яаралтай эмчид хандана уу',
    subtitle: 'Яаралтай эмчилгээ шаардлагатай шинж тэмдэг илэрсэн',
    icon: 'alert-circle-outline',
    iconColor: '#B83838',
  },
}

type Props = { level: TriageLevel; score: number; confidentWording?: boolean }

export default function ResultTriageCard({ level, score, confidentWording = false }: Props) {
  const { colors } = useTheme()
  const bg = level === 'green' ? colors.triageGreenBg : level === 'yellow' ? colors.triageYellowBg : colors.triageRedBg
  const textColor = level === 'green' ? colors.triageGreenText : level === 'yellow' ? colors.triageYellowText : colors.triageRedText
  const { label, subtitle, icon, iconColor } = CONFIG[level]
  const pct = Math.round(Math.min(100, score > 1 ? score : score * 100))

  return (
    <View style={[s.card, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={38} color={iconColor} />
      <Text style={[s.label, { color: textColor }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{label}</Text>
      <Text style={[s.subtitle, { color: textColor }]}>{subtitle}</Text>
      {pct > 0 && confidentWording && (
        <View style={s.badge}>
          <Text style={[s.badgeText, { color: textColor }]}>Шинжилгээний итгэмжлэл {pct}%</Text>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  card: { borderRadius: 18, padding: 20, alignItems: 'center', gap: 7 },
  label: { fontSize: 18, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  badge: { backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  badgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
})
