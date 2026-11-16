import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const nextId = useRef(1)

  const remove = useCallback((id) => {
    setItems((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (message, tone = 'success') => {
      const id = nextId.current++
      setItems((list) => [...list, { id, message, tone }])
      // Auto-dismiss after 4 seconds, as the design requires.
      window.setTimeout(() => remove(id), 4000)
    },
    [remove]
  )

  const value = useMemo(
    () => ({
      toast: {
        success: (message) => push(message, 'success'),
        error: (message) => push(message, 'error'),
      },
      items,
      remove,
    }),
    [push, items, remove]
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToastContext() {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used inside ToastProvider')
  return value
}

/** Most components only need to fire a toast. */
export function useToast() {
  return useToastContext().toast
}
