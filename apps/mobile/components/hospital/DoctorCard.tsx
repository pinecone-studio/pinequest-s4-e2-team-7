import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import type { Doctor } from '@/lib/doctorsData'

type Props = {
  doctor: Doctor
  onPress: () => void
}

const DoctorCard = ({ doctor, onPress }: Props) => {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[s.avatar, { backgroundColor: colors.triageGreenBg }]}>
        <Text style={s.avatarText}>{doctor.name[0]}</Text>
      </View>
      <View style={s.info}>
        <Text style={[s.name, { color: colors.textBase }]}>{doctor.name}</Text>
        <Text style={[s.specialty, { color: colors.textMuted }]}>{doctor.specialty}</Text>
        <Text style={[s.clinic, { color: colors.textSecondary }]}>
          {doctor.clinic} · {doctor.district} · {doctor.exp}
        </Text>
      </View>
      <View style={s.right}>
        <View style={s.ratingRow}>
          <Ionicons name="star" size={12} color="#F2B705" />
          <Text style={[s.rating, { color: colors.textBase }]}> {doctor.rating}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  info: { flex: 1 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  specialty: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  clinic: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  rating: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },

})

export default DoctorCard
