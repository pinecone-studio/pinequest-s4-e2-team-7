import { View } from 'react-native'

// Placeholder screen behind the center camera tab button. The button's onPress pushes
// /scan, so this is never actually displayed — it only anchors the tab slot.
export default function ScanTabPlaceholder() {
  return <View />
}
