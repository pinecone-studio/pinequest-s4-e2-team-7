import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'expo-router'
import { seasonOrdinal } from '@pinequest/core'
import { apiFetch, getMyClasses } from '@/lib/api'
import { useTheme } from '@/lib/ThemeContext'
import { toMongolian } from '@/lib/errorMessages'
import ScreenHeader from '@/components/teacher/ScreenHeader'
import SeasonPicker from '@/components/teacher/SeasonPicker'
import { shortChildNameFromFull } from '@/lib/childName'

type Screening = {
  id: string
  triageLevel: string
  capturedAt: string
  childKey: string
  classId?: string
  seasonId: string
  childName: string | null
}

// A screening is an immutable event; one child may have several (re-screens,
// or separate upper/lower sessions). The history list is a per-child view, so
// collapse to the latest screening per child. The API already orders by
// capturedAt desc, but we re-sort defensively before keeping the first seen.
const latestPerChild = (rows: Screening[]): Screening[] => {
  const seen = new Set<string>()
  const out: Screening[] = []
  for (const r of [...rows].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))) {
    const key = `${r.classId ?? ''}::${r.childKey}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(r)
  }
  return out
}

const LEVEL_LABEL: Record<string, string> = {
  green: 'Харьцангуй эрүүл',
  yellow: 'Эмчилгээ шаардлагатай',
  red: 'Яаралтай эмчилгээ',
}

export default function HistoryScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [classSeasons, setClassSeasons] = useState<string[]>([])
  const [season, setSeason] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<Screening[]>('/api/screenings')
      .then((rows) => setScreenings(rows))
      .catch((e: unknown) => setError(toMongolian(e)))
      .finally(() => setLoading(false))
    // Season options come from the teacher's classes (like the Анги screen), so every
    // season is selectable even before it has screenings. Parents have no classes —
    // their seasons then come from the screenings themselves (union below).
    getMyClasses().then((cs) => setClassSeasons(cs.map((c) => c.seasonId))).catch(() => {})
  }, [])

  // Newest first: class seasons ∪ screening seasons.
  const seasonOptions = useMemo(
    () => [...new Set([...classSeasons, ...screenings.map((s) => s.seasonId)])]
      .filter(Boolean)
      .sort((a, b) => seasonOrdinal(b) - seasonOrdinal(a)),
    [classSeasons, screenings],
  )
  useEffect(() => {
    if (!seasonOptions.length) { if (season) setSeason(null); return }
    if (!season || !seasonOptions.includes(season)) setSeason(seasonOptions[0])
  }, [seasonOptions, season])

  // Latest screening per child, within the selected season.
  const visible = useMemo(
    () => latestPerChild(screenings.filter((r) => r.seasonId === season)),
    [screenings, season],
  )

  // Match the profile summary tiles: soft triage backgrounds with colored text.
  const badgeBg = (level: string) =>
    level === 'green' ? colors.triageGreenBg : level === 'red' ? colors.triageRedBg : colors.triageYellowBg
  const badgeTextColor = (level: string) =>
    level === 'green' ? colors.triageGreenText : level === 'red' ? colors.triageRedText : colors.triageYellowText

  if (loading)
    return (
      <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    )
  if (error)
    return (
      <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
        <Text style={{ color: '#ef4444', padding: 24 }}>{error}</Text>
      </SafeAreaView>
    )

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={s.header}>
        <ScreenHeader title="Дүгнэлт" />
      </View>
      {season ? (
        <View style={s.seasonBar}>
          <SeasonPicker value={season} onChange={setSeason} options={seasonOptions} />
        </View>
      ) : null}
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={[s.empty, { color: colors.textDisabled }]}>
            Одоогоор дүгнэлт байхгүй байна
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.card, { backgroundColor: colors.surface }]}
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: '/screening/[id]',
                params: { id: item.id, childName: item.childName ?? '', level: item.triageLevel },
              })
            }
          >
            <View style={[s.badge, { backgroundColor: badgeBg(item.triageLevel) }]}>
              <Text style={[s.badgeText, { color: badgeTextColor(item.triageLevel) }]}>
                {LEVEL_LABEL[item.triageLevel] ?? item.triageLevel}
              </Text>
            </View>
            <View style={s.body}>
              <Text style={[s.name, { color: colors.textBase }]} numberOfLines={1}>
                {shortChildNameFromFull(item.childName) || 'Нэр тодорхойгүй'}
              </Text>
              <Text style={[s.date, { color: colors.textSecondary }]}>
                {new Date(item.capturedAt).toLocaleDateString('mn-MN')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  seasonBar: { paddingHorizontal: 20, paddingBottom: 12, zIndex: 10 },
  card: {
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 1,
  },
  badge: {
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, textAlign: 'center' },
  body: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  date: { fontSize: 13 },
  empty: { textAlign: 'center', paddingTop: 40 },
})
