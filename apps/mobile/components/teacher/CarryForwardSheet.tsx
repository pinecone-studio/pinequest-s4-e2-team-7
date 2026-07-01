import { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { seasonLabelMn } from '@pinequest/core'
import { useTheme } from '@/lib/ThemeContext'
import { getRosterStatus, type RosterStatusRow } from '@/lib/api'
import { toMongolian } from '@/lib/errorMessages'
import { shortChildName } from '@/lib/childName'
import PrimaryButton from '@/components/auth/PrimaryButton'

type Props = {
  visible: boolean
  sourceClassId: string | null
  sourceName: string
  targetSeason: string
  onClose: () => void
  /** Resolves the carry-forward; receives the childKeys of transferred-out students. */
  onConfirm: (excludeChildKeys: string[]) => Promise<void>
}

/**
 * Confirms a carry-forward: lists every student in the source class so the teacher can
 * mark who has transferred out. Unchecked students don't roll into the next season
 * (their record is kept, not deleted); the rest come in un-screened.
 */
const CarryForwardSheet = ({ visible, sourceClassId, sourceName, targetSeason, onClose, onConfirm }: Props) => {
  const { colors } = useTheme()
  const [roster, setRoster] = useState<RosterStatusRow[] | null>(null)
  const [excluded, setExcluded] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!visible || !sourceClassId) return
    setRoster(null)
    setExcluded(new Set())
    setError(null)
    getRosterStatus(sourceClassId)
      .then(setRoster)
      .catch((err) => setError(toMongolian(err)))
  }, [visible, sourceClassId])

  const toggle = useCallback((childKey: string) => {
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(childKey)) next.delete(childKey)
      else next.add(childKey)
      return next
    })
  }, [])

  const carryCount = (roster?.length ?? 0) - excluded.size

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      await onConfirm([...excluded])
    } catch (err) {
      setError(toMongolian(err))
      setSaving(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={[s.sheet, { backgroundColor: colors.bg }]}>
          <View style={s.head}>
            <View style={s.headText}>
              <Text style={[s.title, { color: colors.textBase }]}>Сурагчдыг шилжүүлэх</Text>
              <Text style={[s.sub, { color: colors.textMuted }]}>
                {sourceName} → {seasonLabelMn(targetSeason)}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[s.hint, { color: colors.textMuted }]}>
            Шинэ улиралд орох сурагчдаа сонгоно уу. Шилжсэн сурагчийн тэмдэглэгээг авбал дараагийн
            улиралд орж ирэхгүй (мэдээлэл нь устахгүй).
          </Text>

          {roster === null && !error ? (
            <View style={s.center}><ActivityIndicator color={colors.primary} /></View>
          ) : error ? (
            <View style={s.center}><Text style={[s.muted, { color: colors.textMuted }]}>{error}</Text></View>
          ) : roster && roster.length === 0 ? (
            <View style={s.center}><Text style={[s.muted, { color: colors.textMuted }]}>Энэ ангид сурагч алга.</Text></View>
          ) : (
            <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
              {roster?.map((r) => {
                const keep = !excluded.has(r.childKey)
                return (
                  <TouchableOpacity
                    key={r.childKey}
                    style={[s.row, { borderColor: colors.border, backgroundColor: colors.surface }]}
                    onPress={() => toggle(r.childKey)}
                    activeOpacity={0.7}
                  >
                    <View style={[s.check, { borderColor: keep ? colors.primary : colors.border, backgroundColor: keep ? colors.primary : 'transparent' }]}>
                      {keep ? <Ionicons name="checkmark" size={15} color={colors.primaryText} /> : null}
                    </View>
                    <Text style={[s.name, { color: keep ? colors.textBase : colors.textDisabled }]} numberOfLines={1}>
                      {shortChildName(r.lastName, r.firstName)}
                    </Text>
                    {!keep ? <Text style={[s.tag, { color: colors.textMuted }]}>Шилжсэн</Text> : null}
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          )}

          {roster && roster.length > 0 ? (
            <View style={s.footer}>
              <PrimaryButton
                label={`${carryCount} сурагчийг шилжүүлэх`}
                onPress={submit}
                loading={saving}
                disabled={carryCount <= 0}
              />
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '86%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 18 },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8 },
  headText: { flex: 1, gap: 2 },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  sub: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  hint: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18, paddingHorizontal: 20, paddingBottom: 8 },
  center: { padding: 40, alignItems: 'center' },
  muted: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  list: { paddingHorizontal: 20, paddingTop: 4, gap: 8, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingVertical: 12 },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  name: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  tag: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 },
})

export default CarryForwardSheet
