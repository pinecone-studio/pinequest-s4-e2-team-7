import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { seasonLabelMn, seasonOrdinal } from '@pinequest/core'
import { useTheme } from '@/lib/ThemeContext'
import ScreenHeader from '@/components/teacher/ScreenHeader'
import InlineDropdown from '@/components/teacher/InlineDropdown'
import { getMyClasses, updateSchedule, type TeacherClass } from '@/lib/api'
import { scheduleScreeningReminder, syncScreeningReminders } from '@/lib/notifications'
import { toMongolian } from '@/lib/errorMessages'
import MonthCalendar from '@/components/teacher/MonthCalendar'

const startOfDay = (d: string | Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
// Standard numeric date: YYYY.MM.DD (device-independent, no verbose month names).
const fmt = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const CalendarScreen = () => {
  const { colors } = useTheme()
  const [classes, setClasses] = useState<TeacherClass[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  // The teacher picks a class + a season (like the Анги/Статистик screens); the
  // calendar below is always shown and sets the schedule for that class × season.
  const [className, setClassName] = useState<string | null>(null)
  const [season, setSeason] = useState<string | null>(null)

  const load = useCallback(() => {
    setError(null)
    getMyClasses()
      .then((list) => { setClasses(list); void syncScreeningReminders(list) })
      .catch((e) => setError(toMongolian(e)))
  }, [])
  useFocusEffect(useCallback(() => { load() }, [load]))

  const today = startOfDay(new Date())
  const list = classes ?? []
  const overdue = list.filter((k) => k.scheduledAt && startOfDay(k.scheduledAt) < today).length
  const unscheduled = list.filter((k) => !k.scheduledAt).length
  const alerts = overdue + unscheduled

  // Distinct class names — one option per class (its seasons live under it).
  const classNames = useMemo(() => [...new Set(list.map((k) => k.name))], [list])
  // Seasons available for the selected class, newest first.
  const seasonOptions = useMemo(
    () =>
      className
        ? [...new Set(list.filter((k) => k.name === className).map((k) => k.seasonId))]
            .sort((a, b) => seasonOrdinal(b) - seasonOrdinal(a))
        : [],
    [list, className],
  )
  const selected = useMemo(
    () => list.find((k) => k.name === className && k.seasonId === season) ?? null,
    [list, className, season],
  )

  // Default the class once loaded.
  useEffect(() => {
    if (!className && classNames.length) setClassName(classNames[0])
  }, [classNames, className])
  // Keep the season valid for the chosen class (default to newest).
  useEffect(() => {
    if (!seasonOptions.length) { if (season) setSeason(null); return }
    if (!season || !seasonOptions.includes(season)) setSeason(seasonOptions[0])
  }, [seasonOptions, season])

  const pick = async (k: TeacherClass, date: Date) => {
    setSavingId(k.id)
    try {
      await updateSchedule(k.id, date.toISOString(), k.reminderPhone)
      load()
      // Local reminder is best-effort (unsupported on web) — never block the update.
      void scheduleScreeningReminder({ id: k.id, name: k.name, scheduledAt: date.toISOString() }).catch(() => {})
    }
    catch (e) { setError(toMongolian(e)) } finally { setSavingId(null) }
  }

  const over = selected?.scheduledAt ? startOfDay(selected.scheduledAt) < today : false

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[s.safe, { backgroundColor: colors.bg }]}>
      <View style={s.head}>
        <ScreenHeader
          title="Хуанли"
          right={
            <View style={s.bell}>
              <Ionicons name="notifications-outline" size={22} color={alerts ? colors.primary : colors.textMuted} />
              {alerts > 0 && <View style={[s.dot, { backgroundColor: colors.triageRedText }]}><Text style={s.dotText}>{alerts}</Text></View>}
            </View>
          }
        />
      </View>

      {classes === null && !error ? (
        <View style={s.center}><ActivityIndicator color={colors.primary} /></View>
      ) : error ? (
        <View style={s.center}><Text style={[s.muted, { color: colors.textMuted }]}>{error}</Text></View>
      ) : list.length === 0 ? (
        <View style={s.center}><Text style={[s.muted, { color: colors.textMuted }]}>Анги бүртгээгүй байна.</Text></View>
      ) : (
        <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: 24 }]} showsVerticalScrollIndicator={false}>
          {alerts > 0 && (
            <View style={[s.alert, { backgroundColor: colors.triageRedBg }]}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.triageRedText} />
              <Text style={[s.alertText, { color: colors.triageRedText }]}>
                {overdue ? `${overdue} ангийн хяналт хийх хугацаа хэтэрсэн. ` : ''}{unscheduled ? `${unscheduled} анги товлоогүй.` : ''}
              </Text>
            </View>
          )}

          {/* Class + season selectors (same style as the Анги/Статистик screens). */}
          <View style={s.selectors}>
            <InlineDropdown
              value={className}
              options={classNames.map((n) => ({ value: n, label: n }))}
              onChange={setClassName}
              icon="school-outline"
            />
            <InlineDropdown
              value={season}
              options={seasonOptions.map((sid) => ({ value: sid, label: seasonLabelMn(sid) }))}
              onChange={setSeason}
              icon="calendar-outline"
            />
          </View>

          <Text style={[s.hint, { color: colors.textMuted }]}>Улирал бүр (намар/өвөл/хавар) дор хаяж нэг удаа хяналт хийнэ үү.</Text>

          {selected && (
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={s.statusRow}>
                <Text style={[s.statusLabel, { color: colors.textMuted }]}>Хяналтын огноо</Text>
                {savingId === selected.id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={[s.statusValue, { color: over ? colors.triageRedText : selected.scheduledAt ? colors.textBase : colors.textMuted }]}>
                    {selected.scheduledAt ? fmt(selected.scheduledAt) : 'Товлоогүй'}
                  </Text>
                )}
              </View>
              <MonthCalendar
                value={selected.scheduledAt ? new Date(selected.scheduledAt) : null}
                onChange={(d) => pick(selected, d)}
              />
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  head: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  bell: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 2, right: 0, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  dotText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold' },
  scroll: { paddingHorizontal: 20, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  alert: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 12 },
  alertText: { flex: 1, fontSize: 12, fontFamily: 'Inter_500Medium' },
  selectors: { flexDirection: 'row', gap: 10, zIndex: 10 },
  hint: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  statusValue: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  muted: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
})

export default CalendarScreen
