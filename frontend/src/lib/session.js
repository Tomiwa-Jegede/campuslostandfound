// The logged-in user is remembered in localStorage so a refresh
// does not log you out. The token is fake while we run on mock data;
// the real server will send a JWT with a signature.
const KEY = 'clf.session.v1'

export function readSession() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem(KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(KEY)
}
