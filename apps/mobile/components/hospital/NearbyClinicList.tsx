import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useMemo } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { CLINICS, distanceKm, type Clinic } from '@/lib/clinics'
import NearbyClinicCard from './NearbyClinicCard'

type Props = {
  userLat: number
  userLng: number
  selectedId?: string
  onSelect: (clinic: Clinic) => void
}

const NearbyClinicList = ({ userLat, userLng, selectedId, onSelect }: Props) => {
  const { colors } = useTheme()

  const sorted = useMemo(
    () =>
      [...CLINICS]
        .map((c) => ({ ...c, dist: distanceKm(c, userLat, userLng) }))
        .sort((a, b) => a.dist - b.dist),
    [userLat, userLng],
  )

  return (
    <View style={[s.sheet, { backgroundColor: colors.surface }]}>
      <View style={[s.handle, { backgroundColor: colors.border }]} />
      <Text style={[s.title, { color: colors.textBase }]}>
        Ойролцоо {sorted.length} эмнэлэг
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {sorted.map((c) => (
          <NearbyClinicCard
            key={c.id}
            clinic={c}
            distance={c.dist}
            isSelected={c.id === selectedId}
            onPress={() => onSelect(c)}
          />
        ))}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
})

export default NearbyClinicList
