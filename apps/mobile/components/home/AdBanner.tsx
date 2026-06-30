import { useCallback, useEffect, useRef } from 'react'
import {
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import { ADS } from '@/lib/ads'

const GAP = 12
// Each banner fills the content width (Home padding is 20 on each side), so one
// shows at a time and the next is fully off-screen — swipe to page, no peek.
const CARD_W = Dimensions.get('window').width - 40
const CARD_H = 150
const AUTO_MS = 5000 // auto-advance interval

/** Horizontally-scrollable, full-width paging ad banner carousel; auto-slides every 5s. */
const AdBanner = () => {
  const { colors } = useTheme()
  const scrollRef = useRef<ScrollView>(null)
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopAuto = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startAuto = useCallback(() => {
    stopAuto()
    if (ADS.length <= 1) return
    timerRef.current = setInterval(() => {
      const next = (indexRef.current + 1) % ADS.length
      indexRef.current = next
      scrollRef.current?.scrollTo({ x: next * (CARD_W + GAP), animated: true })
    }, AUTO_MS)
  }, [stopAuto])

  useEffect(() => {
    startAuto()
    return stopAuto
  }, [startAuto, stopAuto])

  // Keep the auto-advance in sync with manual swipes, and restart its timer.
  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    indexRef.current = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + GAP))
    startAuto()
  }

  if (ADS.length === 0) return null

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={CARD_W + GAP}
      snapToAlignment="start"
      onScrollBeginDrag={stopAuto}
      onMomentumScrollEnd={onMomentumEnd}
      contentContainerStyle={s.row}
    >
      {ADS.map((ad) => (
        <TouchableOpacity
          key={ad.id}
          activeOpacity={ad.url ? 0.9 : 1}
          disabled={!ad.url}
          onPress={ad.url ? () => Linking.openURL(ad.url as string) : undefined}
          style={[s.card, { width: CARD_W, backgroundColor: ad.bg ?? colors.surface }]}
        >
          <Image source={ad.image} style={s.image} resizeMode={ad.resizeMode ?? 'cover'} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  row: { gap: GAP, paddingVertical: 2 },
  card: {
    height: CARD_H,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
})

export default AdBanner
