import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'

type Props = {
  onSend: (text: string) => void
}

const ChatInputBar = ({ onSend }: Props) => {
  const { colors } = useTheme()
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.row, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TextInput
          style={[s.input, { backgroundColor: colors.surfaceRaised, color: colors.textBase }]}
          value={text}
          onChangeText={setText}
          placeholder="Мессеж бичих..."
          placeholderTextColor={colors.textDisabled}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[s.btn, { backgroundColor: text.trim() ? colors.primary : colors.border }]}
          onPress={handleSend}
          activeOpacity={0.8}
        >
          <Ionicons
            name="send"
            size={18}
            color={text.trim() ? colors.primaryText : colors.textDisabled}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  btn: {
    width: 42,
    height: 42,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default ChatInputBar
