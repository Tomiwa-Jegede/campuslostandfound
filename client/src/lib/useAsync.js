import { useState, useEffect, useCallback } from 'react'

/**
 * Runs one async call and tracks loading / data / error.
 * `deps` works like a useEffect dependency list: change one and it re-runs.
 * `reload()` re-runs the same call, for a "Try again" button.
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ loading: true, data: null, error: null })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let alive = true
    setState((current) => ({ ...current, loading: true, error: null }))
    fn()
      .then((data) => {
        if (alive) setState({ loading: false, data, error: null })
      })
      .catch((error) => {
        if (alive) setState({ loading: false, data: null, error })
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  return { ...state, reload }
}
