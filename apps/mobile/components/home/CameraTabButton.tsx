import { TouchableOpacity, View, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

type Props = {
  onPress: () => void
  style?: StyleProp<ViewStyle>
  [key: string]: unknown
}

const CameraTabButton = ({ onPress, style, ...rest }: Props) => {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      {...rest}
      style={[style, s.wrap]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[s.circle, { backgroundColor: colors.primary }]}>
        <Ionicons name="camera-outline" size={26} color={colors.primaryText} />
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  wrap: {
    top: -22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F2B705',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
})

export default CameraTabButton
