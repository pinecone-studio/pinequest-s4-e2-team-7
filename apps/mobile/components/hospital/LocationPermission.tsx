import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

type Props = {
  onAllow: () => void
}

const LocationPermission = ({ onAllow }: Props) => {
  const { colors } = useTheme()

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={[s.iconWrap, { backgroundColor: colors.triageGreenBg }]}>
        <Ionicons name="location-outline" size={48} color={colors.triageGreenText} />
      </View>
      <Text style={[s.title, { color: colors.textBase }]}>Байршилаа хуваалцах уу?</Text>
      <Text style={[s.desc, { color: colors.textMuted }]}>
        Ойр байрлах шүдний эмнэлэгүүдийг харуулахын тулд таны байршил ашиглагдана.
      </Text>
      <TouchableOpacity
        style={[s.btn, { backgroundColor: colors.primary }]}
        onPress={onAllow}
        activeOpacity={0.8}
      >
        <Ionicons name="location" size={18} color={colors.primaryText} />
        <Text style={[s.btnText, { color: colors.primaryText }]}>Байршилаа хуваалцах</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    textAlign: 'center',
  },
  desc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 9999,
    marginTop: 8,
  },
  btnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
})

export default LocationPermission
