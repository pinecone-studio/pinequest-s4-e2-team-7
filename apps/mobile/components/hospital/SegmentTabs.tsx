import { useEffect, useRef, useState } from 'react'
import { Animated, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Segment = 'doctors' | 'map'

type Props = {
  active: Segment
  onChange: (s: Segment) => void
}

const TABS: { id: Segment; label: string }[] = [
  { id: 'doctors', label: 'Эмч' },
  { id: 'map', label: 'Газрын зураг' },
]

const TAB_PAD = 4

const SegmentTabs = ({ active, onChange }: Props) => {
  const { colors } = useTheme()
  const [tabsW, setTabsW] = useState(0)
  // 0 = doctors (left), 1 = map (right) — drives the sliding pill.
  const pill = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(pill, {
      toValue: active === 'doctors' ? 0 : 1,
      useNativeDriver: true,
      friction: 9,
      tension: 90,
    }).start()
  }, [active, pill])

  const pillW = tabsW ? (tabsW - TAB_PAD * 2) / TABS.length : 0
  const pillX = pill.interpolate({ inputRange: [0, 1], outputRange: [0, pillW] })

  return (
    <View style={[s.container, { borderBottomColor: colors.border }]}>
      <View
        style={[s.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onLayout={(e) => setTabsW(e.nativeEvent.layout.width)}
      >
        {pillW > 0 && (
          <Animated.View
            style={[
              s.pill,
              { width: pillW, backgroundColor: colors.primary, transform: [{ translateX: pillX }] },
            ]}
          />
        )}
        {TABS.map(({ id, label }) => {
          const isActive = active === id
          return (
            <TouchableOpacity
              key={id}
              style={s.tab}
              onPress={() => onChange(id)}
              activeOpacity={0.8}
            >
              <Text
                style={[s.label, { color: isActive ? colors.primaryText : colors.textMuted }]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  row: { flexDirection: 'row', borderRadius: 12, padding: TAB_PAD, borderWidth: 1, position: 'relative' },
  pill: {
    position: 'absolute',
    top: TAB_PAD,
    left: TAB_PAD,
    bottom: TAB_PAD,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  tab: { flex: 1, paddingVertical: 9, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
})

export default SegmentTabs
