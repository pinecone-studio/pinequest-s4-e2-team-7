import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import BackButton from '@/components/BackButton'

type Props = { title: string; subtitle?: string; right?: React.ReactNode; onBack?: () => void }

const ScreenHeader = ({ title, subtitle, right, onBack }: Props) => {
  const { colors } = useTheme()
  return (
    <View style={s.row}>
      <BackButton onPress={onBack} />
      <View style={s.titles}>
        <Text style={[s.title, { color: colors.textBase }]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[s.sub, { color: colors.textMuted }]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {/* Right slot balances the back button so the title stays centered. */}
      {right ?? <View style={s.spacer} />}
    </View>
  )
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  titles: { flex: 1, alignItems: 'center' },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold', letterSpacing: -0.3, textAlign: 'center' },
  sub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2, textAlign: 'center' },
  spacer: { width: 40 },
})

export default ScreenHeader
