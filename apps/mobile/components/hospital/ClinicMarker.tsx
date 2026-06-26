import { View, Text, StyleSheet } from 'react-native'
import { Marker } from 'react-native-maps'
import type { Clinic } from '@/lib/clinics'

type Props = {
  clinic: Clinic
  isSelected: boolean
  onPress: () => void
}

const ClinicMarker = ({ clinic, isSelected, onPress }: Props) => (
  <Marker
    coordinate={{ latitude: clinic.lat, longitude: clinic.lng }}
    onPress={onPress}
    title={clinic.name}
  >
    <View style={[s.pin, isSelected ? s.pinSelected : s.pinDefault]}>
      <Text style={s.tooth}>🦷</Text>
    </View>
  </Marker>
)

const s = StyleSheet.create({
  pin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pinDefault: { backgroundColor: '#4DB6AC' },
  pinSelected: { backgroundColor: '#E57373' },
  tooth: { fontSize: 20 },
})

export default ClinicMarker
