import { useCallback, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useFocusEffect } from 'expo-router'
import { seasonLabelMn } from '@pinequest/core'
import { useTheme } from '@/lib/ThemeContext'
import { getClass, getRosterStatus, type ClassMeta, type RosterStatusRow } from '@/lib/api'
import { toMongolian } from '@/lib/errorMessages'
import ScreenHeader from '@/components/teacher/ScreenHeader'
import CoverageBar from '@/components/teacher/CoverageBar'
import TriageBadge from '@/components/teacher/TriageBadge'
import RedStudentsSection from '@/components/teacher/RedStudentsSection'

const ClassDetailScreen = () => {
  const { colors } = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [meta, setMeta] = useState<ClassMeta | null>(null)
  const [roster, setRoster] = useState<RosterStatusRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback((id: string) => {
    setError(null)
    return Promise.all([getClass(id), getRosterStatus(id)])
      .then(([m, r]) => { setMeta(m); setRoster(r) })
      .catch((err) => setError(toMongolian(err)))
  }, [])

  useFocusEffect(useCallback(() => { void load(id); return () => {} }, [id, load]))

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    load(id).finally(() => setRefreshing(false))
  }, [id, load])

  const screened = roster?.filter((r) => r.screenedAt).length ?? 0
  const redCount = roster?.filter((r) => r.latestLevel === 'red').length ?? 0
  const yellowCount = roster?.filter((r) => r.latestLevel === 'yellow').length ?? 0

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]}>
      <View style={s.headWrap}>
        <ScreenHeader title={meta?.name ?? 'Анги'} subtitle={meta ? seasonLabelMn(meta.seasonId) : undefined} />
      </View>
      {roster === null && !error ? (
        <View style={s.center}><ActivityIndicator color={colors.primary} /></View>
      ) : error ? (
        <View style={s.center}><Text style={[s.muted, { color: colors.textMuted }]}>{error}</Text></View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <CoverageBar screened={screened} enrolled={roster?.length ?? 0} label="Хяналтын хамрагдалт" />
            <View style={s.stats}>
              <Stat label="Улаан" value={redCount} tone={colors.triageRedText} colors={colors} />
              <Stat label="Шар" value={yellowCount} tone={colors.triageYellowText} colors={colors} />
              <Stat label="Шалгасан" value={screened} tone={colors.triageGreenText} colors={colors} />
            </View>
          </View>

          {roster ? <RedStudentsSection roster={roster} /> : null}

          <Text style={[s.section, { color: colors.textMuted }]}>СУРАГЧИД</Text>
          {roster && roster.length === 0 ? (
            <Text style={[s.muted, { color: colors.textMuted }]}>Энэ ангид сурагч бүртгэгдээгүй байна.</Text>
          ) : (
            roster?.map((r) => (
              <View key={r.id} style={[s.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.slot, { color: colors.textMuted }]}>{r.rosterSlot}</Text>
                <Text style={[s.name, { color: colors.textBase }]} numberOfLines={1}>{r.lastName} {r.firstName}</Text>
                <TriageBadge level={r.latestLevel} />
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const Stat = ({ label, value, tone, colors }: { label: string; value: number; tone: string; colors: { textMuted: string } }) => (
  <View style={s.stat}>
    <Text style={[s.statValue, { color: tone }]}>{value}</Text>
    <Text style={[s.statLabel, { color: colors.textMuted }]}>{label}</Text>
  </View>
)

const s = StyleSheet.create({
  safe: { flex: 1 },
  headWrap: { paddingHorizontal: 20, paddingTop: 8 },
  scroll: { padding: 20, paddingTop: 8, gap: 12, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 16 },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  section: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  slot: { fontSize: 13, fontFamily: 'Inter_600SemiBold', width: 22 },
  name: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  muted: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
})

export default ClassDetailScreen
