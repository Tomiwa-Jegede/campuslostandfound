import { useEffect, useRef } from 'react'
import Button from './Button.jsx'

/**
 * A confirmation step for anything destructive (design §5.2).
 * Escape cancels, and focus starts on Cancel so a stray Enter cannot delete anything.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
  children,
}) {
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    cancelRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape' && !loading) onCancel()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !loading && onCancel()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title">{title}</h2>
        {description ? <p>{description}</p> : null}
        {children}
        <div className="dialog-actions" style={{ marginTop: children ? 20 : 0 }}>
          <Button variant="secondary" onClick={onCancel} ref={cancelRef} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'primary' ? 'primary' : 'danger'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
