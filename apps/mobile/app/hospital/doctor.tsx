import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import { getDoctor } from '@/lib/doctorsData'

const DoctorScreen = () => {
  const { colors } = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const doctor = getDoctor(id)

  if (!doctor) return null

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.textBase} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textBase }]}>Эмчийн профайл</Text>
        <View style={s.placeholder} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[s.avatar, { backgroundColor: colors.triageGreenBg }]}>
            <Text style={s.avatarText}>{doctor.name[0]}</Text>
          </View>
          <Text style={[s.name, { color: colors.textBase }]}>{doctor.name}</Text>
          <Text style={[s.specialty, { color: colors.textMuted }]}>{doctor.specialty}</Text>
          <View style={s.badges}>
            {[doctor.clinic, doctor.district, doctor.exp].map((b) => (
              <View key={b} style={[s.badge, { backgroundColor: colors.surfaceRaised }]}>
                <Text style={[s.badgeText, { color: colors.textSecondary }]}>{b}</Text>
              </View>
            ))}
          </View>
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Ionicons name="star" size={16} color="#F2B705" />
              <Text style={[s.statVal, { color: colors.textBase }]}> {doctor.rating}</Text>
            </View>
          </View>
        </View>
        <View style={s.actions}>
          <TouchableOpacity
            style={[s.btn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(`/hospital/chat?id=${doctor.id}`)}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.primary} />
            <Text style={[s.btnText, { color: colors.textBase }]}>Чат</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btn, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/hospital/call?id=${doctor.id}`)}
            activeOpacity={0.8}
          >
            <Ionicons name="videocam-outline" size={22} color={colors.primaryText} />
            <Text style={[s.btnText, { color: colors.primaryText }]}>Видео дуудлага</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
  placeholder: { width: 24 },
  content: { padding: 16, gap: 16 },
  card: { borderRadius: 16, borderWidth: 1, padding: 20, alignItems: 'center', gap: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 32 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  specialty: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stat: { flexDirection: 'row', alignItems: 'center' },
  statVal: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },

  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  btnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
})

export default DoctorScreen
