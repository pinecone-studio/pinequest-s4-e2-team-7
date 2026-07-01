import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import { seasonForDate, seasonOrdinal, nextSeason } from '@pinequest/core'
import { useTheme } from '@/lib/ThemeContext'
import { getMyClasses, carryForwardClass, type TeacherClass } from '@/lib/api'
import { toMongolian } from '@/lib/errorMessages'
import ClassCard from '@/components/teacher/ClassCard'
import SeasonPicker from '@/components/teacher/SeasonPicker'
import CarryForwardSheet from '@/components/teacher/CarryForwardSheet'
import ScreenHeader from '@/components/teacher/ScreenHeader'

const ClassesScreen = () => {
  const { colors } = useTheme()
  const router = useRouter()
  const [classes, setClasses] = useState<TeacherClass[] | null>(null)
  const [season, setSeason] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)

  const load = useCallback((silent = false) => {
    if (!silent) setError(null)
    // A teacher owns one class per season, chained by carry-forward. We fetch them
    // all and filter client-side by the selected season.
    return getMyClasses()
      .then((cls) => setClasses(cls))
      .catch((err) => setError(toMongolian(err)))
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
      return () => {}
    }, [load]),
  )

  // The newest season the teacher actually has a class in (chain head).
  const latestClassSeason = useMemo(() => {
    if (!classes?.length) return null
    return classes.reduce((a, k) => (seasonOrdinal(k.seasonId) > seasonOrdinal(a) ? k.seasonId : a), classes[0].seasonId)
  }, [classes])

  // Default to the newest season the teacher has a class in; brand-new teachers
  // (class created at signup) fall back to the current season.
  useEffect(() => {
    if (season || classes === null) return
    setSeason(latestClassSeason ?? seasonForDate(new Date()))
  }, [classes, season, latestClassSeason])

  // Selector options: the seasons the teacher has classes in, plus the single next
  // season after the chain head (so they can carry the roster forward one term).
  const seasonOptions = useMemo(() => {
    const fromClasses = classes?.map((k) => k.seasonId) ?? []
    const withNext = latestClassSeason ? [...fromClasses, nextSeason(latestClassSeason)] : fromClasses
    const opts = [...new Set(withNext)].sort((a, b) => seasonOrdinal(b) - seasonOrdinal(a))
    return opts.length ? opts : [season ?? seasonForDate(new Date())]
  }, [classes, latestClassSeason, season])

  const visibleClasses = useMemo(
    () => classes?.filter((k) => k.seasonId === season) ?? null,
    [classes, season],
  )

  // When the selected (empty) season sits after an existing class, that class is the
  // carry-forward source — its roster rolls forward, un-screened, into this season.
  const carrySource = useMemo(() => {
    if (!season || !classes?.length) return null
    if (classes.some((k) => k.seasonId === season)) return null
    const priors = classes.filter((k) => seasonOrdinal(k.seasonId) < seasonOrdinal(season))
    if (!priors.length) return null
    return priors.reduce((a, k) => (seasonOrdinal(k.seasonId) > seasonOrdinal(a.seasonId) ? k : a), priors[0])
  }, [season, classes])

  const onConfirmTransfer = useCallback(async (excludeChildKeys: string[]) => {
    if (!carrySource || !season) return
    await carryForwardClass(carrySource.id, season, { excludeChildKeys })
    setShowTransfer(false)
    await load(true)
  }, [carrySource, season, load])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    load(true).finally(() => setRefreshing(false))
  }, [load])

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[s.safe, { backgroundColor: colors.bg }]}>
      <View style={s.head}>
        <ScreenHeader title="Анги" />
      </View>

      {classes !== null && !error && season ? (
        <View style={s.seasonBar}>
          <SeasonPicker value={season} onChange={setSeason} options={seasonOptions} />
        </View>
      ) : null}

      {classes === null && !error ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={[s.muted, { color: colors.textMuted }]}>{error}</Text>
        </View>
      ) : visibleClasses && visibleClasses.length === 0 ? (
        <View style={s.center}>
          <Ionicons name="school-outline" size={40} color={colors.textDisabled} />
          {carrySource ? (
            <>
              <Text style={[s.muted, { color: colors.textMuted }]}>
                {carrySource.name} ангийн сурагчдыг энэ улиралд шилжүүлэх үү?{'\n'}
                Шинэ улирал тул хяналт хийгдээгүй байдлаар орж ирнэ.
              </Text>
              <TouchableOpacity
                style={[s.carryBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowTransfer(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="arrow-forward" size={18} color={colors.primaryText} />
                <Text style={[s.carryBtnText, { color: colors.primaryText }]}>Сурагчдыг шилжүүлэх</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={[s.muted, { color: colors.textMuted }]}>
              {classes && classes.length === 0
                ? 'Анги бүртгэгдээгүй байна.\nБүртгүүлэхдээ ангиа үүсгэсэн эсэхээ шалгана уу.'
                : 'Энэ улиралд анги алга.'}
            </Text>
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[s.list, { paddingBottom: 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {visibleClasses?.map((k) => (
            <ClassCard
              key={k.id}
              klass={k}
              onPress={() => router.push(`/class/${k.id}` as never)}
            />
          ))}
        </ScrollView>
      )}

      <CarryForwardSheet
        visible={showTransfer}
        sourceClassId={carrySource?.id ?? null}
        sourceName={carrySource?.name ?? ''}
        targetSeason={season ?? ''}
        onClose={() => setShowTransfer(false)}
        onConfirm={onConfirmTransfer}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  head: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  seasonBar: { paddingHorizontal: 20, paddingBottom: 12, zIndex: 10 },
  carryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 9999,
  },
  carryBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  list: { paddingHorizontal: 20, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 30 },
  muted: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 21 },
})

export default ClassesScreen
