import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { apiFetch } from '@/lib/api'
import { useTheme } from '@/lib/ThemeContext'
import { toMongolian } from '@/lib/errorMessages'

type Screening = {
  id: string
  triageLevel: string
  capturedAt: string
  childKey: string
  childName: string | null
}

const LEVEL_LABEL: Record<string, string> = {
  green: 'Нормаль',
  yellow: 'Хянах',
  red: 'Яаралтай',
}

export default function HistoryScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<Screening[]>('/api/screenings')
      .then(setScreenings)
      .catch((e: unknown) => setError(toMongolian(e)))
      .finally(() => setLoading(false))
  }, [])

  const badgeColor = (level: string) =>
    level === 'green' ? colors.badgeGreen : level === 'red' ? colors.badgeRed : colors.badgeYellow

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
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <Text style={[s.header, { color: colors.textBase }]}>Дүгнэлт</Text>
      <FlatList
        data={screenings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}
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
            <View style={[s.badge, { backgroundColor: badgeColor(item.triageLevel) }]}>
              <Text style={s.badgeText}>{LEVEL_LABEL[item.triageLevel] ?? item.triageLevel}</Text>
            </View>
            <View style={s.body}>
              <Text style={[s.name, { color: colors.textBase }]} numberOfLines={1}>
                {item.childName || 'Нэр тодорхойгүй'}
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
  header: { fontSize: 20, fontWeight: '700', padding: 20, paddingBottom: 8 },
  card: {
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 1,
  },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  body: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  date: { fontSize: 13 },
  empty: { textAlign: 'center', paddingTop: 40 },
})
