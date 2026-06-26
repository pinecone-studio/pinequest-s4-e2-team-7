import { StyleSheet, View } from 'react-native'
import { useState } from 'react'
import MapView from 'react-native-maps'
import { CLINICS, UB_CENTER, type Clinic } from '@/lib/clinics'
import ClinicMarker from './ClinicMarker'
import NearbyClinicList from './NearbyClinicList'

type Props = {
  userLat: number
  userLng: number
}

const ClinicMapView = ({ userLat, userLng }: Props) => {
  const [selected, setSelected] = useState<Clinic | null>(null)

  return (
    <View style={s.root}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: UB_CENTER.lat,
          longitude: UB_CENTER.lng,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {CLINICS.map((clinic) => (
          <ClinicMarker
            key={clinic.id}
            clinic={clinic}
            isSelected={selected?.id === clinic.id}
            onPress={() => setSelected(clinic)}
          />
        ))}
      </MapView>
      <NearbyClinicList
        userLat={userLat}
        userLng={userLng}
        selectedId={selected?.id}
        onSelect={setSelected}
      />
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
})

export default ClinicMapView
