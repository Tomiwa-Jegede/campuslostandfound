import { Link, NavLink, Outlet } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import AccountMenu from '../components/AccountMenu.jsx'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/claims', label: 'Claims' },
  { to: '/admin/items', label: 'Items' },
]

/** Admin pages: a left sidebar on desktop, a tab row on phones. */
export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <Link className="brand" to="/admin">
          <Logo size={26} />
          <span>Lost &amp; Found</span>
        </Link>

        <p className="side-label">Admin</p>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className="side-link">
            {link.label}
          </NavLink>
        ))}

        <p className="side-label">Site</p>
        <Link className="side-link" to="/">
          View public site
        </Link>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <span className="small">Campus Lost &amp; Found · administrator</span>
          <AccountMenu />
        </div>
        <Outlet />
      </div>
    </div>
  )
}
