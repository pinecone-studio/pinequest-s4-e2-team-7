import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import QuickActionCard from './QuickActionCard'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

type Action = { id: string; icon: IoniconsName; label: string; onPress: () => void }

type Props = { actions: Action[] }

const QuickActionGrid = ({ actions }: Props) => (
  <View style={s.grid}>
    {actions.slice(0, 4).map((a) => (
      <View key={a.id} style={s.cell}>
        <QuickActionCard icon={a.icon} label={a.label} onPress={a.onPress} />
      </View>
    ))}
  </View>
)

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '48%', flexGrow: 1 },
})

export default QuickActionGrid
