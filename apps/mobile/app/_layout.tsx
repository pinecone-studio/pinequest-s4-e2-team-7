import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { View } from 'react-native'
import { useFonts } from 'expo-font'
import { getToken } from '@/lib/auth'
import { ThemeProvider } from '@/lib/ThemeContext'
import { RenderErrorBoundary } from '@/components/RenderErrorBoundary'

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()

  const [fontsLoaded] = useFonts({
    Inter_400Regular: require('../assets/fonts/Inter_400Regular.ttf'),
    Inter_500Medium: require('../assets/fonts/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('../assets/fonts/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('../assets/fonts/Inter_700Bold.ttf'),
  })

  useEffect(() => {
    if (!segments.length) return
    getToken().then((t: string | null) => {
      const inAuthScreen = segments[0] === 'login'
      if (!t && !inAuthScreen) router.replace('/login')
    })
  }, [segments, router])

  if (!fontsLoaded) return <View style={{ flex: 1 }} />

  return (
    <RenderErrorBoundary>
      <ThemeProvider>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="scan" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </RenderErrorBoundary>
  )
}
