import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { initials } from '../lib/format.js'

/** Account area of the top bar. Guests see log in / sign up; students see a menu. */
export default function AccountMenu() {
  const { user, isAdmin, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    if (!open) return undefined
    const onDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) {
    return (
      <div className="row" style={{ gap: 8 }}>
        <Link className="btn btn-ghost btn-sm" to="/login">
          Log in
        </Link>
        <Link className="btn btn-primary btn-sm" to="/register">
          Sign up
        </Link>
      </div>
    )
  }

  const signOut = () => {
    logout()
    toast.success('You are logged out.')
    navigate('/')
  }

  return (
    <div className="menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className="menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="avatar" aria-hidden="true">{initials(user.full_name)}</span>
        <span className="small" style={{ color: 'inherit' }}>{user.full_name.split(' ')[0]}</span>
      </button>

      {open ? (
        <div className="menu" role="menu">
          <Link role="menuitem" to="/dashboard">Dashboard</Link>
          <Link role="menuitem" to="/my-reports">My reports</Link>
          <Link role="menuitem" to="/my-claims">My claims</Link>
          <Link role="menuitem" to="/profile">Profile</Link>
          {isAdmin ? (
            <>
              <div className="sep" />
              <Link role="menuitem" to="/admin">Admin</Link>
            </>
          ) : null}
          <div className="sep" />
          <button type="button" role="menuitem" className="danger" onClick={signOut}>
            Log out
          </button>
        </div>
      ) : null}
    </div>
  )
}
