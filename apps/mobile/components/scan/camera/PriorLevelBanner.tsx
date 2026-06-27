import { View, Text, StyleSheet } from 'react-native'

const LEVEL: Record<string, { bg: string; label: string }> = {
  red:    { bg: 'rgba(220,38,38,0.84)',  label: 'Өнгөрсөн улирал: Яаралтай эмчилгээ шаардлагатай байсан' },
  yellow: { bg: 'rgba(202,138,4,0.84)',  label: 'Өнгөрсөн улирал: Эмчилгээ шаардлагатай байсан' },
  green:  { bg: 'rgba(22,163,74,0.84)',  label: 'Өнгөрсөн улирал: Аюулын тэмдэг харагдаагүй байсан' },
}

export const PriorLevelBanner = ({ level }: { level: string }) => {
  const info = LEVEL[level]
  if (!info) return null
  return (
    <View style={[s.banner, { backgroundColor: info.bg }]}>
      <Text style={s.text}>{info.label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  banner: {
    position: 'absolute', top: 56, left: 16, right: 16,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  text: { color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
})
