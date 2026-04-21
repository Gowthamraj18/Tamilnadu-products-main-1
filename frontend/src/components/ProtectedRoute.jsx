import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, role, loading, isAuthenticated } = useAuth()
  const location = useLocation()
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    // Give AuthContext time to load user data
    const timer = setTimeout(() => {
      setInitialLoad(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Show loading during initial load or auth loading
  if (loading || initialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace state={{ from: location }} />
  }

  // Check admin-only routes
  if (adminOnly && role !== 'admin') {
    return <Navigate to="/" replace />
  }

  if (!adminOnly && role === 'admin' && window.location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default ProtectedRoute
