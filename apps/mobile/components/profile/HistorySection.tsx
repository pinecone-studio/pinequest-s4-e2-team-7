import { View, Text, StyleSheet } from 'react-native'
import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import {
  MOCK_HISTORY,
  MOCK_CHILDREN,
  getProfileRole,
  type ProfileRole,
} from '@/lib/profileData'
import HistoryRow from './HistoryRow'
import ClassSelector from './ClassSelector'

type Props = { role: string }

const HistorySection = ({ role }: Props) => {
  const { colors } = useTheme()
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const profileRole: ProfileRole = getProfileRole(role)

  const rows = MOCK_HISTORY.filter((r) => {
    if (profileRole === 'child')        return r.childName === MOCK_HISTORY[0].childName
    if (profileRole === 'parent')       return MOCK_CHILDREN.includes(r.childName)
    if (profileRole === 'teacher')      return true
    if (profileRole === 'school_doctor') return selectedClass ? r.classId === selectedClass : false
    return true
  })

  const emptyText =
    profileRole === 'school_doctor' && !selectedClass
      ? 'Анги сонгоно уу'
      : 'Түүх байхгүй байна'

  return (
    <View>
      <Text style={[s.sectionTitle, { color: colors.textMuted }]}>ШАЛГАЛТЫН ТҮҮХ</Text>
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {profileRole === 'school_doctor' && (
          <ClassSelector selected={selectedClass} onSelect={setSelectedClass} />
        )}
        {rows.length === 0 ? (
          <Text style={[s.empty, { color: colors.textDisabled }]}>{emptyText}</Text>
        ) : (
          rows.map((r) => (
            <HistoryRow
              key={r.id}
              row={r}
              showName={profileRole !== 'child'}
            />
          ))
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  empty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 28,
  },
})

export default HistorySection
