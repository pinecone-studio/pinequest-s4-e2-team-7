import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  onEnd: () => void
}

const CallControls = ({ onEnd }: Props) => (
  <View style={s.row}>
    <TouchableOpacity style={[s.btn, s.btnGray]}>
      <Ionicons name="mic-off-outline" size={24} color="#FFF" />
    </TouchableOpacity>
    <TouchableOpacity style={[s.btn, s.btnGray]}>
      <Ionicons name="videocam-outline" size={24} color="#FFF" />
    </TouchableOpacity>
    <TouchableOpacity style={[s.btn, s.btnGray]}>
      <Ionicons name="copy-outline" size={24} color="#FFF" />
    </TouchableOpacity>
    <TouchableOpacity style={[s.btn, s.btnRed]} onPress={onEnd}>
      <Ionicons name="call" size={24} color="#FFF" />
    </TouchableOpacity>
  </View>
)

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGray: { backgroundColor: 'rgba(255,255,255,0.15)' },
  btnRed: { backgroundColor: '#E57373' },
})

export default CallControls
