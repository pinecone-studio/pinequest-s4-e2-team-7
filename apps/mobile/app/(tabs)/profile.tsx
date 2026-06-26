import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { getUser, saveUser, clearToken, clearUser } from '@/lib/auth'
import { getMe, updateMe, type MeResult } from '@/lib/api'
import { useTheme } from '@/lib/ThemeContext'
import { toMongolian } from '@/lib/errorMessages'
import TextField from '@/components/auth/TextField'
import PrimaryButton from '@/components/auth/PrimaryButton'
import OutlineButton from '@/components/auth/OutlineButton'

const ROLE_LABEL: Record<string, string> = {
  screener: 'Хэрэглэгч', teacher: 'Багш', parent: 'Эцэг эх',
  school_doctor: 'Сургуулийн эмч', dentist: 'Шүдний эмч', follow_up: 'Дагах ажилтан', admin: 'Администратор',
}

const ProfileScreen = () => {
  const { colors } = useTheme()
  const router = useRouter()
  const [me, setMe] = useState<MeResult | null>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMe()
      .then((m) => { setMe(m); setName(m.name); setPhone(m.phone ?? '') })
      .catch(async () => {
        const u = await getUser()
        if (u) { setMe({ id: u.id, name: u.name, role: u.role, email: '', phone: null, schoolId: u.schoolId ?? null, isActive: true }); setName(u.name) }
      })
  }, [])

  const save = async () => {
    setSaving(true); setError(null)
    try {
      const updated = await updateMe({ name, phone })
      setMe((prev) => (prev ? { ...prev, name: updated.name, phone: updated.phone } : prev))
      const u = await getUser()
      if (u) await saveUser({ ...u, name: updated.name })
      setEditing(false)
    } catch (err) { setError(toMongolian(err)) } finally { setSaving(false) }
  }

  const logout = async () => { await clearToken(); await clearUser(); router.replace('/login') }

  if (!me) {
    return <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}><ActivityIndicator color={colors.primary} style={s.loader} /></SafeAreaView>
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={[s.avatar, { backgroundColor: colors.primary }]}><Text style={[s.avatarText, { color: colors.primaryText }]}>{me.name.charAt(0).toUpperCase()}</Text></View>
          <Text style={[s.name, { color: colors.textBase }]}>{me.name}</Text>
          <Text style={[s.role, { color: colors.textMuted }]}>{ROLE_LABEL[me.role] ?? me.role}</Text>
        </View>

        {editing ? (
          <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextField label="НЭР" value={name} onChange={setName} placeholder="Нэр" />
            <TextField label="УТАС" value={phone} onChange={setPhone} placeholder="Утас" keyboard="phone-pad" />
            {error ? <Text style={s.error}>{error}</Text> : null}
            <PrimaryButton label="Хадгалах" onPress={save} loading={saving} disabled={!name.trim()} />
            <OutlineButton label="Болих" onPress={() => { setEditing(false); setName(me.name); setPhone(me.phone ?? ''); setError(null) }} />
          </View>
        ) : (
          <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Row label="И-мэйл" value={me.email || '—'} muted={colors.textMuted} base={colors.textBase} />
            <Row label="Утас" value={me.phone || '—'} muted={colors.textMuted} base={colors.textBase} />
            <TouchableOpacity style={[s.editBtn, { borderColor: colors.primary }]} onPress={() => setEditing(true)} activeOpacity={0.7}>
              <Ionicons name="create-outline" size={18} color={colors.primary} />
              <Text style={[s.editText, { color: colors.primary }]}>Засах</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={[s.logoutBtn, { borderColor: colors.triageRedText }]} onPress={logout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={18} color={colors.triageRedText} />
          <Text style={[s.logoutText, { color: colors.triageRedText }]}>Гарах</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const Row = ({ label, value, muted, base }: { label: string; value: string; muted: string; base: string }) => (
  <View style={s.row}>
    <Text style={[s.rowLabel, { color: muted }]}>{label}</Text>
    <Text style={[s.rowValue, { color: base }]} numberOfLines={1}>{value}</Text>
  </View>
)

const s = StyleSheet.create({
  root: { flex: 1 },
  loader: { marginTop: 48 },
  scroll: { padding: 20, gap: 18 },
  header: { alignItems: 'center', gap: 6, paddingVertical: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 30, fontFamily: 'Inter_700Bold' },
  name: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  role: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  rowValue: { fontSize: 14, fontFamily: 'Inter_500Medium', flexShrink: 1 },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderRadius: 12, paddingVertical: 12 },
  editText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  error: { fontSize: 13, color: '#ef4444' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderRadius: 12, padding: 14 },
  logoutText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
})

export default ProfileScreen
