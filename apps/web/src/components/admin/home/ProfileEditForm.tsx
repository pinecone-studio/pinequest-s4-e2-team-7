'use client'

type Props = {
  name: string
  email: string
  phone: string
  onName: (v: string) => void
  onEmail: (v: string) => void
  onPhone: (v: string) => void
  onSave: () => void
  onCancel: () => void
  isPending: boolean
}

const inp = 'w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-[14px] text-text-base placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none'

const ProfileEditForm = ({ name, email, phone, onName, onEmail, onPhone, onSave, onCancel, isPending }: Props) => (
  <div className="w-full space-y-3">
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-text-muted">Нэр</label>
      <input value={name} onChange={(e) => onName(e.target.value)} className={inp} />
    </div>
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-text-muted">И-мэйл</label>
      <input type="email" value={email} onChange={(e) => onEmail(e.target.value)} placeholder="you@example.mn" className={inp} />
    </div>
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-text-muted">Утас</label>
      <input value={phone} onChange={(e) => onPhone(e.target.value)} placeholder="+976 9900 0000" className={inp} />
    </div>
    <div className="flex gap-2 pt-1">
      <button onClick={onCancel} className="btn flex-1 rounded-full bg-btn-fill px-4 py-2.5 text-[13px] font-semibold text-text-base hover:bg-btn-fill-hover">
        Болих
      </button>
      <button onClick={onSave} disabled={isPending} className="btn flex-1 rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-on-primary hover:bg-primary-hover disabled:opacity-60">
        {isPending ? 'Хадгалж байна…' : 'Хадгалах'}
      </button>
    </div>
  </div>
)

export default ProfileEditForm
