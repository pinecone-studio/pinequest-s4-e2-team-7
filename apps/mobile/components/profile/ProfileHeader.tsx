import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import type { AuthUser } from '@/lib/auth'

const ROLE_LABEL: Record<string, string> = {
  screener:  'Эцэг эх',
  dentist:   'Сургуулийн эмч',
  follow_up: 'Хүүхэд',
  admin:     'Багш',
}

type Props = {
  user: AuthUser
  childCount?: number
}

const ProfileHeader = ({ user, childCount }: Props) => {
  const { colors } = useTheme()
  const initial = user.name.charAt(0).toUpperCase()
  const roleLabel = ROLE_LABEL[user.role] ?? user.role

  return (
    <View style={[s.row, { backgroundColor: colors.surface }]}>
      <View style={[s.avatar, { backgroundColor: colors.primary }]}>
        <Text style={[s.avatarText, { color: colors.primaryText }]}>{initial}</Text>
      </View>
      <View style={s.info}>
        <Text style={[s.name, { color: colors.textBase }]}>{user.name}</Text>
        <View style={s.badges}>
          <View style={[s.badge, { backgroundColor: colors.triageGreenBg }]}>
            <Text style={[s.badgeText, { color: colors.triageGreenText }]}>{roleLabel}</Text>
          </View>
          {childCount !== undefined && (
            <View style={[s.badge, { backgroundColor: colors.surfaceRaised }]}>
              <Text style={[s.badgeText, { color: colors.textSecondary }]}>
                {childCount} хүүхэд
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 22 },
  info: { flex: 1 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 20, marginBottom: 8 },
  badges: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontFamily: 'Inter_500Medium', fontSize: 13 },
})

export default ProfileHeader
