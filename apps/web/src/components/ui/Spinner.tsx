import { cn } from '@/lib/utils'

/** The single loading spinner for the whole admin section. */
const Spinner = ({ className }: { className?: string }) => (
  <span
    role="status"
    aria-label="Ачааллаж байна"
    className={cn('inline-block size-4 animate-spin rounded-full border-2 border-current/30 border-t-current', className)}
  />
)

/** Centered page/section loader. */
export const PageSpinner = ({ className }: { className?: string }) => (
  <div className={cn('flex w-full items-center justify-center py-10 text-text-muted', className)}>
    <Spinner className="size-6" />
  </div>
)

export default Spinner
