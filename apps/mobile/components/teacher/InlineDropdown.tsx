import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

export type DropdownOption = { value: string; label: string }

type Props = {
  value: string | null
  options: DropdownOption[]
  onChange: (value: string) => void
  icon?: React.ComponentProps<typeof Ionicons>['name']
  placeholder?: string
}

/** A compact inline dropdown: tapping the pill floats the options right below it,
 *  overlaying content (no separate dialog). Shared by the season/class selectors. */
const InlineDropdown = ({ value, options, onChange, icon, placeholder }: Props) => {
  const { colors } = useTheme()
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value)

  const select = (v: string) => {
    onChange(v)
    setOpen(false)
  }

  return (
    <View style={s.wrap}>
      <TouchableOpacity
        style={[s.field, { borderColor: colors.border, backgroundColor: colors.surface }]}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
      >
        {icon ? <Ionicons name={icon} size={16} color={colors.textMuted} /> : null}
        <Text style={[s.fieldLabel, { color: current ? colors.textBase : colors.textMuted }]} numberOfLines={1}>
          {current?.label ?? placeholder ?? ''}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </TouchableOpacity>

      {open ? (
        <View style={[s.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {options.map((o) => {
            const active = o.value === value
            return (
              <TouchableOpacity key={o.value} style={s.item} onPress={() => select(o.value)} activeOpacity={0.7}>
                <Text style={[s.itemLabel, { color: active ? colors.primary : colors.textBase }]} numberOfLines={1}>
                  {o.label}
                </Text>
                {active ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
              </TouchableOpacity>
            )
          })}
        </View>
      ) : null}
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, zIndex: 100 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  fieldLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  menu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 6,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
    overflow: 'hidden',
    zIndex: 100,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
})

export default InlineDropdown
