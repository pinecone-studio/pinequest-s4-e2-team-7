import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { getMyScreenings, getMyClasses, getRosterStatus } from '@/lib/api'
import type { ScreeningRow } from '@/lib/profileData'
import HistoryRow from './HistoryRow'

type Props = { userId: string; role?: string }

const toDate = (ts: number | string) =>
  typeof ts === 'number'
    ? new Date(ts).toISOString().slice(0, 10)
    : new Date(ts).toISOString().slice(0, 10)

const HistorySection = ({ userId, role }: Props) => {
  const { colors } = useTheme()
  const [rows, setRows] = useState<ScreeningRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (role === 'teacher') {
      getMyClasses()
        .then(async (classes) => {
          const rosters = await Promise.all(
            classes.map((c) =>
              getRosterStatus(c.id).then((students) =>
                students.map((s) => ({ ...s, classId: c.id }))
              )
            )
          )
          const screened = rosters.flat().filter((s) => s.screenedAt && s.latestLevel)
          setRows(
            screened.map((s) => ({
              id: s.childKey,
              childName: `${s.lastName} ${s.firstName}`,
              triageLevel: s.latestLevel!,
              date: toDate(s.screenedAt!),
              classId: s.classId,
            }))
          )
        })
        .catch(() => setRows([]))
        .finally(() => setLoading(false))
    } else {
      getMyScreenings(userId)
        .then((items) =>
          setRows(
            items.map((s) => ({
              id: s.id,
              childName: '',
              triageLevel: s.triageLevel,
              date: toDate(s.capturedAt),
              classId: s.classId,
            }))
          )
        )
        .catch(() => setRows([]))
        .finally(() => setLoading(false))
    }
  }, [userId, role])

  return (
    <View>
      <Text style={[s.sectionTitle, { color: colors.textMuted }]}>ШАЛГАЛТЫН ТҮҮХ</Text>
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={s.loader} />
        ) : rows.length === 0 ? (
          <Text style={[s.empty, { color: colors.textDisabled }]}>Түүх байхгүй байна</Text>
        ) : (
          rows.map((r) => <HistoryRow key={r.id} row={r} showName={role === 'teacher'} />)
        )}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
    paddingBottom: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  loader: {
    paddingVertical: 28,
  },
  empty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 28,
  },
})

export default HistorySection
