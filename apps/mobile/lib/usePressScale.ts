import { useRef } from 'react'
import { Animated } from 'react-native'

const usePressScale = (to = 0.96) => {
  const scale = useRef(new Animated.Value(1)).current
  const cfg = { toValue: 0, useNativeDriver: true, speed: 50, bounciness: 0 }

  const onPressIn  = () => Animated.spring(scale, { ...cfg, toValue: to }).start()
  const onPressOut = () => Animated.spring(scale, { ...cfg, toValue: 1  }).start()

  return { style: { transform: [{ scale }] }, onPressIn, onPressOut } as const
}

export default usePressScale
