import { useToastContext } from '../../context/ToastContext.jsx'

/** Reads the toast queue and draws it. Nothing else draws toasts. */
export default function ToastHost() {
  const { items, remove } = useToastContext()

  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className={`toast${item.tone === 'error' ? ' toast-error' : ''}`}>
          <span className="grow">{item.message}</span>
          <button type="button" onClick={() => remove(item.id)} aria-label="Dismiss notification">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
