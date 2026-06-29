import { Tabs, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import { useSession } from '@/lib/SessionContext'
import { roleConfigFor } from '@/lib/roleConfig'
import CameraTabButton from '@/components/home/CameraTabButton'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

const TabIcon = ({ name, color }: { name: IoniconsName; color: string }) => (
  <Ionicons name={name} size={22} color={color} />
)

const TabLayout = () => {
  const { colors } = useTheme()
  const router = useRouter()
  const { activeRole } = useSession()
  const config = roleConfigFor(activeRole)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          height: 72,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 16,
        },
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Нүүр',
          tabBarIcon: ({ color }) => <TabIcon name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: 'Заавар',
          tabBarIcon: ({ color }) => <TabIcon name="book-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={
          config.tabs.camera
            ? {
                title: '',
                tabBarButton: (props) => (
                  <CameraTabButton {...props} onPress={() => router.push('/scan')} />
                ),
              }
            : { href: null }
        }
      />
      <Tabs.Screen
        name="hospital"
        options={{
          title: config.tabs.hospitalLabel,
          tabBarIcon: ({ color }) => <TabIcon name="medkit-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профайл',
          tabBarIcon: ({ color }) => <TabIcon name="person-outline" color={color} />,
        }}
      />
      <Tabs.Screen name="classes" options={{ href: null }} />
      <Tabs.Screen name="calendar" options={{ href: null }} />
    </Tabs>
  )
}

export default TabLayout
