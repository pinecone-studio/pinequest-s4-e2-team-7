import { FlatList, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { DOCTORS } from '@/lib/doctorsData'
import DoctorCard from './DoctorCard'

const DoctorList = () => {
  const router = useRouter()

  return (
    <FlatList
      data={DOCTORS}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <DoctorCard
          doctor={item}
          onPress={() => router.push(`/hospital/doctor?id=${item.id}`)}
        />
      )}
      contentContainerStyle={s.list}
      showsVerticalScrollIndicator={false}
    />
  )
}

const s = StyleSheet.create({
  list: { paddingTop: 4, paddingBottom: 24 },
})

export default DoctorList
