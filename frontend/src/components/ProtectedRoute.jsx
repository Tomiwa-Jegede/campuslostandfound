import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from './ui/Spinner.jsx'

/** Sends guests to the login page and keeps where they were going. */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, checked, isAdmin } = useAuth()
  const location = useLocation()

  if (!checked) {
    return (
      <div className="container page">
        <Spinner dark label="Checking your session" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
