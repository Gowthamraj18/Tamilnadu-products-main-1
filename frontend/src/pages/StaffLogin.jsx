import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Shield, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const inputClass =
  'block w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 pl-11 text-white placeholder:text-gray-500 shadow-inner focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 sm:text-sm transition'
const labelClass = 'mb-2 block text-sm font-medium text-gray-300'

/**
 * Staff-only sign-in (not linked from the public store).
 */
const StaffLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { adminLogin } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await adminLogin({ email, password })
      if (result.success) {
        navigate('/admin', { replace: true })
      } else {
        setError(result.error || 'Sign in failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-950/95 to-primary-950/90" aria-hidden />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <Link
          to="/"
          className="absolute left-4 top-4 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white sm:left-8 sm:top-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </Link>

        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 ring-1 ring-white/10">
              <Shield className="h-6 w-6 text-primary-400" aria-hidden />
            </div>
            <h1 className="text-xl font-semibold text-white">Staff access</h1>
            <p className="mt-2 text-sm text-gray-500">
              Authorized personnel only. This page is not listed on the public site.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gray-900/70 p-6 shadow-xl backdrop-blur-md sm:p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="staff-email" className={labelClass}>
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    id="staff-email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="admin@…"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="staff-password" className={labelClass}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    id="staff-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-11`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    Sign in to dashboard
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffLogin
