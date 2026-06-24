import { Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'

export default function ScanChildScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const [schoolId, setSchoolId] = useState('')
  const [classId, setClassId] = useState('')
  const [seasonId, setSeasonId] = useState('2026-spring')
  const [rosterSlot, setRosterSlot] = useState('')

  const ready = !!schoolId && !!classId && !!rosterSlot

  const onNext = () => {
    if (!ready) return
    const childKey = `${schoolId}:${classId}:${rosterSlot}`
    router.push({ pathname: '/scan/camera', params: { childKey, classId, schoolId, seasonId } })
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={[s.label, { color: colors.textMuted }]}>Сургуулийн ID</Text>
        <TextInput style={[s.input, { borderColor: colors.border, backgroundColor: colors.surface }]} value={schoolId} onChangeText={setSchoolId} placeholder="school-demo" autoCapitalize="none" />
        <Text style={[s.label, { color: colors.textMuted }]}>Ангийн ID</Text>
        <TextInput style={[s.input, { borderColor: colors.border, backgroundColor: colors.surface }]} value={classId} onChangeText={setClassId} placeholder="class-demo" autoCapitalize="none" />
        <Text style={[s.label, { color: colors.textMuted }]}>Улирал</Text>
        <TextInput style={[s.input, { borderColor: colors.border, backgroundColor: colors.surface }]} value={seasonId} onChangeText={setSeasonId} placeholder="2026-spring" autoCapitalize="none" />
        <Text style={[s.label, { color: colors.textMuted }]}>Суудлын дугаар</Text>
        <TextInput style={[s.input, { borderColor: colors.border, backgroundColor: colors.surface }]} value={rosterSlot} onChangeText={setRosterSlot} placeholder="1" keyboardType="number-pad" />
        <TouchableOpacity
          style={[s.btn, { backgroundColor: ready ? colors.primary : colors.textDisabled }]}
          onPress={onNext}
          disabled={!ready}
        >
          <Text style={s.btnText}>Камер нээх</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, gap: 6 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  btn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
