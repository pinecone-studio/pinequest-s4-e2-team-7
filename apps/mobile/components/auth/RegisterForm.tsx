import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { apiFetch } from '@/lib/api'
import { saveToken, saveUser, type AuthUser } from '@/lib/auth'
import { toMongolian } from '@/lib/errorMessages'
import { useTheme } from '@/lib/ThemeContext'
import RoleChips, { type RoleKey } from './RoleChips'
import TextField from './TextField'
import PhoneField from './PhoneField'
import PinField from './PinField'
import PrimaryButton from './PrimaryButton'
import OutlineButton from './OutlineButton'

type AuthData = { token: string; user: AuthUser }

const RegisterForm = ({ onBack }: { onBack: () => void }) => {
  const router = useRouter()
  const { colors } = useTheme()
  const [role, setRole] = useState<RoleKey>('teacher')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [school, setSchool] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const needsSchool = role === 'teacher'
  const canSubmit = !!name && !!email && pin.length >= 6 && (!needsSchool || !!school.trim())

  const onRegister = async () => {
    if (!canSubmit) return
    if (pin.length < 6) {
      setError('Нэвтрэх код хамгийн багадаа 6 тэмдэгт байна')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<AuthData>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password: pin,
          phone: phone ? `+976${phone}` : undefined,
          role,
          schoolName: needsSchool ? school.trim() : undefined,
        }),
      })
      await saveToken(data.token)
      await saveUser(data.user)
      router.replace('/(tabs)')
    } catch (err) {
      setError(toMongolian(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={s.root}>
      <View style={s.roleBlock}>
        <Text style={[s.roleLabel, { color: colors.textMuted }]}>ТАНЫ ҮҮРЭГ</Text>
        <RoleChips selected={role} onSelect={setRole} disabled={['parent', 'health']} />
        <Text style={[s.hint, { color: colors.textMuted }]}>Одоогоор зөвхөн багш бүртгүүлнэ — бусад үүрэг удахгүй</Text>
      </View>
      <TextField label="БҮТЭН НЭР" value={name} onChange={setName} placeholder="Нэрээ оруулах" />
      {needsSchool ? (
        <TextField label="СУРГУУЛЬ" value={school} onChange={setSchool} placeholder="Сургуулийн нэр" />
      ) : null}
      <TextField
        label="И-МЭЙ ХАЯГ"
        value={email}
        onChange={setEmail}
        placeholder="name@example.com"
        keyboard="email-address"
        autoCapitalize="none"
      />
      <PhoneField value={phone} onChange={setPhone} />
      <PinField value={pin} onChange={setPin} label="НЭВТРЭХ КОД" hint="хамгийн багадаа 6 тэмдэгт" />
      {error ? <Text style={s.error}>{error}</Text> : null}
      <PrimaryButton label="Бүртгүүлэх" onPress={onRegister} loading={loading} disabled={!canSubmit} />
      <OutlineButton label="Буцах" onPress={onBack} />
    </View>
  )
}

const s = StyleSheet.create({
  root: { gap: 14 },
  roleBlock: { gap: 8 },
  roleLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  hint: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  error: { fontSize: 13, color: '#ef4444' },
})

export default RegisterForm
