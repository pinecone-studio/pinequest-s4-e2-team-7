import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import type { UserRole } from '@pinequest/types'
import { useAuth } from '@/lib/useAuth'
import { useTheme } from '@/lib/ThemeContext'
import Dropdown, { type DropdownOption } from './Dropdown'
import TextField from './TextField'
import PinField from './PinField'
import PrimaryButton from './PrimaryButton'

const INST_TYPES = ['Сургууль', 'Цэцэрлэг', 'Бусад'] as const
type InstType = (typeof INST_TYPES)[number]

// Role choices mirror the web register dropdown exactly. 'teacher_parent' is a
// register-only combo → role=teacher + a parent child link (so the user can later
// switch between teacher and parent views). Default is the plain user (эцэг эх).
type RoleChoice = UserRole | 'teacher_parent'

const ROLE_OPTIONS: DropdownOption<RoleChoice>[] = [
  { value: 'parent', label: 'Хэрэглэгч (эцэг эх)' },
  { value: 'teacher', label: 'Багш' },
  { value: 'school_doctor', label: 'Сургууль/цэцэрлэгийн эмч' },
  { value: 'teacher_parent', label: 'Багш + эцэг эх (хамт)' },
]

const NEEDS_SCHOOL: RoleChoice[] = ['teacher', 'school_doctor', 'teacher_parent']
const NEEDS_CHILD: RoleChoice[] = ['parent', 'teacher_parent']
// A teacher owns one class → capture it (name + planned size) at signup.
const NEEDS_CLASS: RoleChoice[] = ['teacher', 'teacher_parent']

const RegisterForm = () => {
  const { submit, busy, error } = useAuth()
  const { colors } = useTheme()
  const [role, setRole] = useState<RoleChoice>('parent')
  const [instType, setInstType] = useState<InstType>('Сургууль')
  const [name, setName] = useState('')
  const [extra, setExtra] = useState('')
  const [childName, setChildName] = useState('')
  const [className, setClassName] = useState('')
  const [classTotal, setClassTotal] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({})

  const needsSchool = NEEDS_SCHOOL.includes(role)
  const needsChild = NEEDS_CHILD.includes(role)
  const needsClass = NEEDS_CLASS.includes(role)
  const schoolName = instType === 'Бусад' ? extra.trim() : `${instType} ${extra.trim()}`.trim()

  const clearFieldErr = (k: string) => setFieldErr((p) => ({ ...p, [k]: '' }))

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Та нэрээ бүтнээр нь бичиж оруулна уу'
    if (needsSchool && !extra.trim())
      e.extra =
        instType === 'Бусад'
          ? 'Та байгууллагын нэрээ оруулна уу'
          : 'Та сургууль/цэцэрлэгийн дугаараа оруулна уу'
    if (needsChild && !childName.trim()) e.childName = 'Та хүүхдийнхээ нэрийг оруулна уу'
    if (needsClass && !className.trim()) e.className = 'Та ангийн нэрийг оруулна уу'
    if (needsClass && !(parseInt(classTotal, 10) > 0)) e.classTotal = 'Та сурагчдын тоог оруулна уу'
    if (!phone.trim()) e.phone = 'Та утасны дугаараа оруулна уу'
    else if (!/^\d{8}$/.test(phone.trim())) e.phone = 'Утасны дугаараа шалгана уу'
    if (password.length < 6) e.password = 'Та 6+ тэмдэгтэй нууц үг оруулна уу'
    if (!confirm) e.confirm = 'Та нууц үгээ давтан оруулна уу'
    else if (password !== confirm) e.confirm = 'Таны оруулсан нууц үг таарахгүй байна'
    return e
  }

  const onRegister = () => {
    const e = validate()
    setFieldErr(e)
    if (Object.keys(e).length) return
    // teacher_parent registers as a teacher; the child name creates the parent link.
    const actualRole: UserRole = role === 'teacher_parent' ? 'teacher' : role
    submit('/api/auth/register', {
      name: name.trim(),
      // Send raw digits; the server prefixes +976 for 8-digit numbers (as on web).
      phone: phone.trim(),
      email: email.trim() || undefined,
      password,
      role: actualRole,
      ...(needsSchool ? { schoolName } : {}),
      ...(needsChild ? { childName: childName.trim() } : {}),
      ...(needsClass ? { className: className.trim(), expectedTotal: parseInt(classTotal, 10) } : {}),
    })
  }

  return (
    <View style={s.root}>
      <Dropdown
        value={role}
        options={ROLE_OPTIONS}
        onChange={(k) => {
          setRole(k)
          setExtra('')
          setChildName('')
          setClassName('')
          setClassTotal('')
          clearFieldErr('extra')
          clearFieldErr('childName')
          clearFieldErr('className')
          clearFieldErr('classTotal')
        }}
      />

      <View>
        <TextField
          value={name}
          onChange={(v) => {
            setName(v)
            clearFieldErr('name')
          }}
          placeholder="Нэр"
        />
        {fieldErr.name ? <Text style={s.err}>{fieldErr.name}</Text> : null}
      </View>

      {needsSchool && (
        <View style={s.group}>
          <View style={s.instRow}>
            {INST_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  s.instChip,
                  {
                    borderColor: instType === t ? colors.primary : colors.border,
                    backgroundColor: instType === t ? colors.primary + '22' : 'transparent',
                  },
                ]}
                onPress={() => {
                  setInstType(t)
                  setExtra('')
                  clearFieldErr('extra')
                }}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    s.instChipLabel,
                    { color: instType === t ? colors.primary : colors.textMuted },
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextField
            value={extra}
            onChange={(v) => {
              setExtra(v)
              clearFieldErr('extra')
            }}
            placeholder={instType === 'Бусад' ? 'Байгууллагын нэр' : 'Дугаар'}
            keyboard={instType !== 'Бусад' ? 'numeric' : undefined}
          />
          {fieldErr.extra ? <Text style={s.err}>{fieldErr.extra}</Text> : null}
        </View>
      )}

      {needsClass && (
        <>
          <View>
            <TextField
              value={className}
              onChange={(v) => {
                setClassName(v)
                clearFieldErr('className')
              }}
              placeholder="Ангийн нэр (ж: 3А)"
            />
            {fieldErr.className ? <Text style={s.err}>{fieldErr.className}</Text> : null}
          </View>
          <View>
            <TextField
              value={classTotal}
              onChange={(v) => {
                setClassTotal(v.replace(/[^0-9]/g, ''))
                clearFieldErr('classTotal')
              }}
              placeholder="Нийт сурагч"
              keyboard="numeric"
            />
            {fieldErr.classTotal ? <Text style={s.err}>{fieldErr.classTotal}</Text> : null}
          </View>
        </>
      )}

      {needsChild && (
        <View>
          <TextField
            value={childName}
            onChange={(v) => {
              setChildName(v)
              clearFieldErr('childName')
            }}
            placeholder="Хүүхдийн нэр"
          />
          {fieldErr.childName ? <Text style={s.err}>{fieldErr.childName}</Text> : null}
        </View>
      )}

      <View>
        <TextField
          value={phone}
          onChange={(v) => {
            setPhone(v)
            clearFieldErr('phone')
          }}
          placeholder="Утасны дугаар"
          keyboard="phone-pad"
          autoCapitalize="none"
        />
        {fieldErr.phone ? <Text style={s.err}>{fieldErr.phone}</Text> : null}
      </View>

      <TextField
        value={email}
        onChange={setEmail}
        placeholder="Имэйл (заавал биш)"
        keyboard="email-address"
        autoCapitalize="none"
      />

      <View>
        <PinField
          placeholder="Нууц үг (6+ тэмдэгт)"
          value={password}
          onChange={(v) => {
            setPassword(v)
            clearFieldErr('password')
          }}
        />
        {fieldErr.password ? <Text style={s.err}>{fieldErr.password}</Text> : null}
      </View>

      <View>
        <PinField
          placeholder="Нууц үг давтах"
          value={confirm}
          onChange={(v) => {
            setConfirm(v)
            clearFieldErr('confirm')
          }}
        />
        {fieldErr.confirm ? <Text style={s.err}>{fieldErr.confirm}</Text> : null}
      </View>

      {error ? <Text style={s.err}>{error}</Text> : null}

      <PrimaryButton label="Бүртгүүлэх" onPress={onRegister} loading={busy} disabled={busy} />
    </View>
  )
}

const s = StyleSheet.create({
  root: { gap: 14 },
  group: { gap: 10 },
  instRow: { flexDirection: 'row', gap: 8 },
  instChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  instChipLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  err: { marginTop: 2, fontSize: 12, color: '#ef4444' },
})

export default RegisterForm
