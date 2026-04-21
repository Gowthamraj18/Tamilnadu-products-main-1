import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Phone, UserPlus, LogIn, Sparkles, ArrowLeft, Truck, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const inputClass =
  'block w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 pl-11 text-white placeholder:text-gray-500 shadow-inner focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 sm:text-sm transition'
const inputClassNoIcon =
  'block w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 shadow-inner focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 sm:text-sm transition'
const labelClass = 'mb-2 block text-sm font-medium text-gray-300'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [pendingOtp, setPendingOtp] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, register, verifyOtp } = useAuth()

  const safeRedirect = useMemo(() => {
    const raw = searchParams.get('redirect')
    if (!raw) return '/'
    try {
      const path = decodeURIComponent(raw)
      if (path.startsWith('/') && !path.startsWith('//')) return path
    } catch {
      /* ignore */
    }
    return '/'
  }, [searchParams])

  useEffect(() => {
    const reg = searchParams.get('register')
    if (reg === '1' || reg === 'true') {
      setIsLogin(false)
    }
  }, [searchParams])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (pendingOtp) {
        const result = await verifyOtp({
          email: pendingOtp.email,
          otp,
          purpose: pendingOtp.purpose
        })
        if (result.success) {
          setPendingOtp(null)
          setOtp('')
          navigate(safeRedirect)
        } else {
          setError(result.error)
        }
      } else {
        let result
        if (isLogin) {
          result = await login({
            identifier: formData.identifier,
            password: formData.password
          })
        } else {
          result = await register({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password
          })
        }

        if (result.success) {
          if (result?.data?.token) {
            navigate(safeRedirect)
          } else if (result?.data?.email && result?.data?.purpose) {
            setPendingOtp({
              email: result.data.email,
              purpose: result.data.purpose
            })
          } else {
            setError('Unexpected auth response')
          }
        } else {
          setError(result.error)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: 'url(/images/home-background.jpg)' }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-950/95 to-primary-950/90" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_80%_0%,rgba(219,39,119,0.18),transparent)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-24 top-1/4 h-64 w-64 rounded-full bg-primary-600/25 blur-[100px]" aria-hidden />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-peach-500/15 blur-[110px]" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <div className="relative flex flex-col justify-between border-b border-white/10 px-6 py-10 lg:w-[42%] lg:border-b-0 lg:border-r lg:px-12 lg:py-14">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-200/90 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to store
            </Link>
            <div className="mt-10 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary-200 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary-300" />
                Tamil Nadu Products
              </div>
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                {isLogin ? (
                  <>
                    Welcome{' '}
                    <span className="bg-gradient-to-r from-peach-200 via-white to-primary-200 bg-clip-text text-transparent">
                      back
                    </span>
                  </>
                ) : (
                  <>
                    Join the{' '}
                    <span className="bg-gradient-to-r from-peach-200 via-white to-primary-200 bg-clip-text text-transparent">
                      community
                    </span>
                  </>
                )}
              </h1>
              <p className="max-w-md text-base leading-relaxed text-gray-400">
                {isLogin
                  ? 'Sign in to track orders and speed up checkout. New here? Create an account in seconds.'
                  : 'Create your account to save addresses and view order history. You can still browse the store as a guest.'}
              </p>
              <ul className="hidden space-y-3 text-sm text-gray-500 sm:block">
                <li className="flex items-center gap-2">
                  <Truck className="h-4 w-4 shrink-0 text-primary-400" />
                  Fast delivery across Tamil Nadu & India
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 shrink-0 text-primary-400" />
                  Secure checkout with Razorpay
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-10 hidden text-xs text-gray-600 lg:block">© {new Date().getFullYear()} Tamil Nadu Products</p>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:py-14">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 shadow-lg shadow-primary-900/50 lg:mx-0">
                <span className="text-lg font-bold text-white">TNP</span>
              </div>
              <h2 className="text-2xl font-bold text-white">{pendingOtp ? 'Verify OTP' : isLogin ? 'Sign in' : 'Create account'}</h2>
              <p className="mt-2 text-sm text-gray-400">
                {pendingOtp
                  ? `Enter the OTP sent to ${pendingOtp.email}.`
                  : isLogin
                    ? 'Enter your email or mobile number and password below.'
                    : 'Fill in your details to get started.'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gray-900/65 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8">
              <form className="space-y-5" onSubmit={handleSubmit}>
                {!pendingOtp && !isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className={labelClass}>
                          First name
                        </label>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          className={inputClassNoIcon}
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className={labelClass}>
                          Last name
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          className={inputClassNoIcon}
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className={labelClass}>
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className={labelClass}>
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="10-digit mobile"
                        />
                      </div>
                    </div>
                  </>
                )}

                {!pendingOtp && isLogin && (
                  <div>
                    <label htmlFor="identifier" className={labelClass}>
                      Email or mobile number
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                      <input
                        id="identifier"
                        name="identifier"
                        type="text"
                        autoComplete="username"
                        required
                        value={formData.identifier}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="you@example.com or 9876543210"
                      />
                    </div>
                  </div>
                )}

                {!pendingOtp && (
                  <div>
                  <label htmlFor="password" className={labelClass}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
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
                )}

                {pendingOtp && (
                  <div>
                    <label htmlFor="otp" className={labelClass}>
                      OTP
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className={inputClassNoIcon}
                      placeholder="Enter 6-digit OTP"
                    />
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3">
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-900/35 transition hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {pendingOtp ? 'Verifying OTP…' : isLogin ? 'Signing in…' : 'Creating account…'}
                    </>
                  ) : pendingOtp ? (
                    <>
                      <Shield className="h-5 w-5" />
                      Verify OTP
                    </>
                  ) : isLogin ? (
                    <>
                      <LogIn className="h-5 w-5" />
                      Sign in
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      Create account
                    </>
                  )}
                </button>

                {!pendingOtp && (
                  <div className="space-y-3 border-t border-white/10 pt-5 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setError('')
                    }}
                    className="text-sm font-medium text-primary-300 transition hover:text-primary-200"
                  >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </button>
                  </div>
                )}
              </form>
            </div>

            <p className="text-center text-sm text-gray-500">
              <Link to="/forgot-password" className="font-medium text-primary-400 transition hover:text-primary-300">
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
