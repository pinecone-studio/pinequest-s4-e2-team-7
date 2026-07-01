import { useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'
import { getStats, getTimeseries, getSeasons, type Stats, type Timeseries } from '@/lib/api'
import { toMongolian } from '@/lib/errorMessages'
import ScreenHeader from '@/components/teacher/ScreenHeader'
import SeasonPicker from '@/components/teacher/SeasonPicker'
import TriageBar from '@/components/charts/TriageBar'
import TrendBars from '@/components/charts/TrendBars'

type KpiProps = {
  label: string
  value: number
  tone: string
  surface: string
  border: string
  muted: string
}

const KpiCard = ({ label, value, tone, surface, border, muted }: KpiProps) => (
  <View style={[s.kpi, { backgroundColor: surface, borderColor: border }]}>
    <Text style={[s.kpiNum, { color: tone }]}>{value}</Text>
    <Text style={[s.kpiLabel, { color: muted }]}>{label}</Text>
  </View>
)

const StatsScreen = () => {
  const { colors } = useTheme()
  const [seasons, setSeasons] = useState<string[]>([])
  const [seasonId, setSeasonId] = useState<string | undefined>()
  const [stats, setStats] = useState<Stats | null>(null)
  const [trend, setTrend] = useState<Timeseries | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback((sid?: string) => {
    setLoading(true)
    setError(null)
    Promise.all([getStats(sid), getTimeseries('D', sid)])
      .then(([s, t]) => {
        setStats(s)
        setTrend(t)
      })
      .catch((e: unknown) => setError(toMongolian(e)))
      .finally(() => setLoading(false))
  }, [])

  useFocusEffect(
    useCallback(() => {
      getSeasons()
        .then((list) => {
          setSeasons(list)
          // Server returns seasons newest-first, so [0] is the latest — mirrors
          // the web SeasonProvider default. (Was list.length-1 = oldest, which
          // opened on a season with no screening, so nothing showed.)
          const latest = list[0]
          setSeasonId(latest)
          loadData(latest)
        })
        .catch(() => loadData(undefined))
    }, [loadData]),
  )

  const changeSeason = (sid: string) => {
    setSeasonId(sid)
    loadData(sid)
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[s.safe, { backgroundColor: colors.bg }]}
    >
      <View style={s.header}>
        <ScreenHeader title="Статистик" />
      </View>

      {seasons.length > 0 && seasonId ? (
        <View style={s.seasonRow}>
          <SeasonPicker value={seasonId} onChange={changeSeason} options={seasons} />
        </View>
      ) : null}

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={[s.err]}>{error}</Text>
        </View>
      ) : stats ? (
        <ScrollView
          style={s.scrollView}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.sectionLabel, { color: colors.textMuted }]}>ХАМРАГДАЛТ</Text>
            <Text style={[s.bigNum, { color: colors.textBase }]}>
              {stats.coverage.screened}
              <Text style={[s.bigSub, { color: colors.textMuted }]}> / {stats.coverage.total}</Text>
            </Text>
            <TriageBar
              green={stats.triage.green}
              yellow={stats.triage.yellow}
              red={stats.triage.red}
              total={stats.coverage.total}
            />
          </View>

          <View style={s.row3}>
            <KpiCard
              label="Нийт шалгасан"
              value={stats.totalScreened}
              tone={colors.triageGreenText}
              surface={colors.surface}
              border={colors.border}
              muted={colors.textMuted}
            />
            <KpiCard
              label="Хяналт шаардлагатай"
              value={stats.flaggedFollowUps}
              tone={colors.triageYellowText}
              surface={colors.surface}
              border={colors.border}
              muted={colors.textMuted}
            />
            <KpiCard
              label="Эмчид үзүүлэх"
              value={stats.pendingReview}
              tone={colors.triageRedText}
              surface={colors.surface}
              border={colors.border}
              muted={colors.textMuted}
            />
          </View>

          {trend && trend.buckets.length > 0 && (
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.sectionLabel, { color: colors.textMuted }]}>7 хоногийн нэгтгэл</Text>
              <TrendBars buckets={trend.buckets} />
            </View>
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  seasonRow: { paddingHorizontal: 20, paddingBottom: 12, zIndex: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  err: { color: '#ef4444', textAlign: 'center' },
  scrollView: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 0, gap: 12, paddingBottom: 24 },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 12 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  bigNum: { fontSize: 32, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  bigSub: { fontSize: 20, fontFamily: 'Inter_400Regular' },
  row3: { flexDirection: 'row', gap: 10 },
  kpi: { flex: 1, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 12, alignItems: 'center', gap: 3 },
  kpiNum: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  kpiLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center' },
})

export default StatsScreen
