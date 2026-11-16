import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import { clearSession, readSession, saveSession } from '../lib/session.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession())
  const [checked, setChecked] = useState(false)

  // Re-check the stored session once on load: the token might have expired.
  useEffect(() => {
    let cancelled = false
    if (!session?.token) {
      setChecked(true)
      return
    }
    api
      .me(session.token)
      .then((user) => {
        if (!cancelled) setSession((current) => (current ? { ...current, user } : current))
      })
      .catch(() => {
        if (!cancelled) {
          clearSession()
          setSession(null)
        }
      })
      .finally(() => {
        if (!cancelled) setChecked(true)
      })
    return () => {
      cancelled = true
    }
    // Only the token matters here; re-running on every user edit would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const start = useCallback((next) => {
    saveSession(next)
    setSession(next)
  }, [])

  const login = useCallback(
    async (email, password) => {
      const next = await api.login({ email, password })
      start(next)
      return next.user
    },
    [start]
  )

  const register = useCallback(
    async (payload) => {
      const next = await api.register(payload)
      start(next)
      return next.user
    },
    [start]
  )

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const updateUser = useCallback((user) => {
    setSession((current) => {
      if (!current) return current
      const next = { ...current, user }
      saveSession(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.token || null,
      checked,
      isAdmin: session?.user?.role === 'admin',
      login,
      register,
      logout,
      updateUser,
    }),
    [session, checked, login, register, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
