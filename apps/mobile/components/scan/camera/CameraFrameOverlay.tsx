import { View, Dimensions, StyleSheet } from 'react-native'

const { width: SW, height: SH } = Dimensions.get('window')
const FT = SH * 0.20        // frame top
const FB = SH * 0.78        // frame bottom
const FL = SW * 0.06        // left/right margin
const FH = FB - FT
const C = 28
const DARK = 'rgba(0,0,0,0.65)'

// The per-tooth `ToothGuide` overlay is temporarily disabled. `mode` is kept on
// the prop contract so callers don't change when the guide is re-enabled.
type Props = { mode: 'upper' | 'lower' }

export default function CameraFrameOverlay(_props: Props) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Blur simulation panels */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: FT, backgroundColor: DARK }} />
      <View style={{ position: 'absolute', top: FB, left: 0, right: 0, bottom: 0, backgroundColor: DARK }} />
      <View style={{ position: 'absolute', top: FT, left: 0, width: FL, height: FH, backgroundColor: DARK }} />
      <View style={{ position: 'absolute', top: FT, right: 0, width: FL, height: FH, backgroundColor: DARK }} />

      {/* Corner brackets */}
      <View style={[s.c, { top: FT, left: FL, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#fff' }]} />
      <View style={[s.c, { top: FT, right: FL, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#fff' }]} />
      <View style={[s.c, { top: FB - C, left: FL, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#fff' }]} />
      <View style={[s.c, { top: FB - C, right: FL, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#fff' }]} />

      {/* tooth guide hidden temporarily */}
    </View>
  )
}

const s = StyleSheet.create({
  c: { position: 'absolute', width: C, height: C },
})
