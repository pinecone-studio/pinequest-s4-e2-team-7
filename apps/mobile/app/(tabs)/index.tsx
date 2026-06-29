import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { useSession } from '@/lib/SessionContext'
import { roleConfigFor, type HomeSection } from '@/lib/roleConfig'
import { useOutboxSync } from '@/lib/useOutboxSync'
import GreetingHeader from '@/components/home/GreetingHeader'
import ScanHeroCard from '@/components/home/ScanHeroCard'
import HistorySection from '@/components/profile/HistorySection'
import ChildResultSection from '@/components/home/ChildResultSection'
import SchoolOverviewSection from '@/components/home/SchoolOverviewSection'
import RedStudentsBoardSection from '@/components/home/RedStudentsBoardSection'
import HelpRequestsSection from '@/components/dentist/HelpRequestsSection'
import QuickActionGrid from '@/components/home/QuickActionGrid'

const HomeScreen = () => {
  const { colors } = useTheme()
  const router = useRouter()
  const { user, activeRole } = useSession()
  const { sync, syncing, pendingCount, deadCount } = useOutboxSync()

  useFocusEffect(useCallback(() => {
    void sync()
  }, [sync]))

  const config = roleConfigFor(activeRole)

  const actions = config.quickActions.map((a) => ({
    ...a,
    onPress: () => router.push(a.route as never),
  }))

  const renderSection = (section: HomeSection) => {
    switch (section) {
      case 'history':
        return user ? <HistorySection key={section} userId={user.id} role={activeRole ?? undefined} /> : null
      case 'childResult':
        return <ChildResultSection key={section} />
      case 'schoolOverview':
        return <SchoolOverviewSection key={section} />
      case 'redStudents':
        return <RedStudentsBoardSection key={section} />
      case 'helpRequests':
        return (
          <HelpRequestsSection
            key={section}
            limit={4}
            onSeeMore={() => router.push('/(tabs)/hospital' as never)}
          />
        )
      default:
        return null
    }
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <GreetingHeader
          name={user?.name ?? '...'}
          onPressAvatar={() => router.push('/(tabs)/profile' as never)}
          syncing={syncing}
          pendingCount={pendingCount}
          deadCount={deadCount}
        />
        {config.showScanHero && <ScanHeroCard onScan={() => router.push('/scan')} />}
        {config.sections.map(renderSection)}
        <QuickActionGrid actions={actions} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20, gap: 18, paddingBottom: 32 },
})

export default HomeScreen
