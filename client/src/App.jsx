import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import ToastHost from './components/ui/ToastHost.jsx'
import AppRoutes from './routes.jsx'

/** A new page starts at the top, like a normal website. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ScrollToTop />
        <AppRoutes />
        <ToastHost />
      </ToastProvider>
    </AuthProvider>
  )
}
