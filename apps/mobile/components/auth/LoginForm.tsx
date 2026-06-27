import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAuth } from '@/lib/useAuth'
import LoginIdentifierField from './LoginIdentifierField'
import PinField from './PinField'
import PrimaryButton from './PrimaryButton'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const LoginForm = () => {
  const { submit, busy, error } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [formErr, setFormErr] = useState('')

  // Validate the identifier shape before hitting the server: digits → phone (8),
  // otherwise → email. Lets us show "check your number/email" precisely.
  const identifierError = (v: string): string => {
    if (/^\d+$/.test(v)) return v.length === 8 ? '' : 'Утасны дугаар буруу байна'
    return EMAIL_RE.test(v) ? '' : 'И-мэйл хаяг буруу байна'
  }

  const onLogin = () => {
    const id = identifier.trim()
    if (!id || !password) return
    const e = identifierError(id)
    setFormErr(e)
    if (e) return
    submit('/api/auth/login', { email: id, password })
  }

  return (
    <View style={s.root}>
      <LoginIdentifierField value={identifier} onChange={(v) => { setIdentifier(v); setFormErr('') }} />
      <PinField value={password} onChange={setPassword} />
      {formErr ? <Text style={s.error}>{formErr}</Text> : error ? <Text style={s.error}>{error}</Text> : null}
      <PrimaryButton
        label="Нэвтрэх"
        onPress={onLogin}
        loading={busy}
        disabled={!identifier.trim() || !password}
      />
    </View>
  )
}

const s = StyleSheet.create({
  root: { gap: 14 },
  error: { fontSize: 13, color: '#ef4444' },
})

export default LoginForm
