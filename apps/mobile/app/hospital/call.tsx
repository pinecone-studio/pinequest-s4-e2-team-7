import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect } from 'react'
import { getDoctor } from '@/lib/doctorsData'
import CallControls from '@/components/hospital/CallControls'

const CallScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const doctor = getDoctor(id)
  const [secs, setSecs] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (!doctor) return null

  return (
    <SafeAreaView style={s.root}>
      <View style={s.topBar}>
        <View style={s.timerBadge}>
          <View style={s.greenDot} />
          <Text style={s.timerText}>{formatTime(secs)}</Text>
        </View>
        <View style={s.encryptBadge}>
          <Ionicons name="lock-closed" size={12} color="#FFF" />
          <Text style={s.encryptText}>Шифрлэгдсэн</Text>
        </View>
      </View>

      <View style={s.miniUser}>
        <Text style={s.miniEmoji}>👦</Text>
      </View>

      <View style={s.center}>
        <View style={s.doctorAvatar}>
          <Text style={s.doctorEmoji}>👩‍⚕️</Text>
        </View>
        <Text style={s.doctorName}>{doctor.name}</Text>
        <Text style={s.doctorRole}>{doctor.specialty}</Text>
        <TouchableOpacity style={s.sharedBadge}>
          <Text style={s.sharedText}>🟡 Таны шалгалтын зураг хуваалцагдсан</Text>
        </TouchableOpacity>
      </View>

      <CallControls onEnd={() => router.back()} />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1C2433' },
  topBar: { flexDirection: 'row', justifyContent: 'center', gap: 12, paddingTop: 8 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
  timerText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFF' },
  encryptBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  encryptText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#FFF' },
  miniUser: { position: 'absolute', top: 90, right: 16, width: 100, height: 130, backgroundColor: '#C4A08F', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  miniEmoji: { fontSize: 44 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  doctorAvatar: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#5B8DB8', alignItems: 'center', justifyContent: 'center' },
  doctorEmoji: { fontSize: 64 },
  doctorName: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#FFF' },
  doctorRole: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  sharedBadge: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 6 },
  sharedText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#FFF' },
})

export default CallScreen
