import { useState } from 'react'
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/lib/ThemeContext'
import AuthBrand from '@/components/auth/AuthBrand'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'

type Mode = 'login' | 'register'

const TABS: { mode: Mode; label: string }[] = [
  { mode: 'login', label: 'Нэвтрэх' },
  { mode: 'register', label: 'Бүртгүүлэх' },
]

const LoginScreen = () => {
  const { colors } = useTheme()
  const [mode, setMode] = useState<Mode>('login')

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthBrand subtitle={'Хүүхдийн шүдний эрүүл мэндийн\nанхан шатны хяналт'} />

        <View style={[s.card, { backgroundColor: colors.surface }]}>
          <View style={[s.tabs, { backgroundColor: colors.surfaceRaised }]}>
            {TABS.map(({ mode: m, label }) => (
              <TouchableOpacity
                key={m}
                style={[s.tab, mode === m && { backgroundColor: colors.surface }]}
                onPress={() => setMode(m)}
                activeOpacity={0.8}
              >
                <Text style={[s.tabLabel, { color: mode === m ? colors.textBase : colors.textMuted }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode === 'login' ? <LoginForm /> : <RegisterForm />}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    padding: 24,
    gap: 20,
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    padding: 22,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
})

export default LoginScreen
