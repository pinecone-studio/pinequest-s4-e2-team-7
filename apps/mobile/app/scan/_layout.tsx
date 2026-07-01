import { Stack } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'

export default function ScanLayout() {
  const { colors } = useTheme()
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.textBase,
        headerTitleStyle: { color: colors.textBase },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="consent"
        options={{ title: 'Зөвшөөрөл', headerBackTitle: 'Буцах' }}
      />
      <Stack.Screen name="questionnaire" options={{ headerShown: false }} />
      <Stack.Screen
        name="camera"
        options={{ title: 'Зураг авах', headerShown: false }}
      />
      <Stack.Screen
        name="result"
        options={{ title: 'Дүгнэлт', headerBackVisible: false }}
      />
    </Stack>
  )
}
