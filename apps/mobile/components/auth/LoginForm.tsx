import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAuth } from '@/lib/useAuth'
import LoginIdentifierField from './LoginIdentifierField'
import PinField from './PinField'
import PrimaryButton from './PrimaryButton'

const LoginForm = () => {
  const { submit, busy, error } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  const onLogin = () => {
    if (!identifier.trim() || !password) return
    submit('/api/auth/login', { email: identifier.trim(), password })
  }

  return (
    <View style={s.root}>
      <LoginIdentifierField value={identifier} onChange={setIdentifier} />
      <PinField value={password} onChange={setPassword} />
      {error ? <Text style={s.error}>{error}</Text> : null}
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
