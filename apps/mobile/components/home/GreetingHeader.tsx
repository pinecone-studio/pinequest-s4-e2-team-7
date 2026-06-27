import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { name: string; onPressAvatar?: () => void }

const GreetingHeader = ({ name, onPressAvatar }: Props) => {
  const { colors } = useTheme()
  const initial = name.charAt(0).toUpperCase() || 'Б'

  return (
    <View style={s.root}>
      <View style={s.left}>
        <Text style={[s.greeting, { color: colors.textBase }]}>
          {`Сайн уу, ${name || '…'} 👋`}
        </Text>
      </View>
      <Pressable
        onPress={onPressAvatar}
        hitSlop={8}
        style={({ pressed }) => [
          s.avatar,
          { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text style={[s.avatarText, { color: colors.primaryText }]}>{initial}</Text>
      </Pressable>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flex: 1, gap: 8 },
  greeting: { fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.3, lineHeight: 30 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  avatarText: { fontSize: 17, fontFamily: 'Inter_700Bold' },
})

export default GreetingHeader
