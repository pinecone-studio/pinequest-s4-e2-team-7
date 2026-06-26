'use client'

import Modal from './Modal'
import Button from './Button'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  isPending?: boolean
  variant?: 'danger' | 'primary'
}

const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Устгах', isPending, variant = 'danger' }: Props) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={isPending}>Болих</Button>
        <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={isPending}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <p className="text-sm leading-relaxed text-text-secondary">{message}</p>
  </Modal>
)

export default ConfirmModal
