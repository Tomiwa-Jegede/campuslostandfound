import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Logo from '../components/Logo.jsx'
import AccountMenu from '../components/AccountMenu.jsx'
import { useAuth } from '../context/AuthContext.jsx'

/** Public and student pages: one top bar, one footer. */
export default function SiteLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <Link className="brand" to="/">
            <Logo />
            <span>Campus Lost &amp; Found</span>
          </Link>

          <button
            type="button"
            className="menu-btn mobile-only"
            aria-expanded={menuOpen}
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>

          <nav className={`nav${menuOpen ? ' open' : ''}`} aria-label="Main">
            <NavLink to="/lost">Lost items</NavLink>
            <NavLink to="/found">Found items</NavLink>
            {user ? <NavLink to="/dashboard">Dashboard</NavLink> : null}
            <NavLink className="mobile-only" to="/report">Report an item</NavLink>
            {user ? (
              <>
                <NavLink className="mobile-only" to="/my-reports">My reports</NavLink>
                <NavLink className="mobile-only" to="/my-claims">My claims</NavLink>
                <NavLink className="mobile-only" to="/profile">Profile</NavLink>
              </>
            ) : null}
          </nav>

          <span className="spacer" />

          <Link className="btn btn-primary btn-sm" to="/report" style={{ marginRight: 8 }}>
            Report an item
          </Link>
          <AccountMenu />
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>Campus Lost &amp; Found — an IFT305 project. Local demonstration only.</span>
          <span>
            <Link to="/lost">Lost</Link> · <Link to="/found">Found</Link>
          </span>
        </div>
      </footer>
    </>
  )
}
