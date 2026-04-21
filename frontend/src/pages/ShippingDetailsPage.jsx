import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const KEYS = [
  'fullName',
  'phone',
  'email',
  'addressLine1',
  'addressLine2',
  'landmark',
  'city',
  'state',
  'pincode',
  'country',
]

export default function ShippingDetailsPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  })
  const [err, setErr] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('shippingAddress')
      if (!raw) return
      const o = JSON.parse(raw)
      setForm((prev) => {
        const next = { ...prev }
        KEYS.forEach((k) => {
          if (o[k] != null && o[k] !== '') next[k] = o[k]
        })
        return next
      })
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) return
    axios
      .get('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
      .then((res) => {
        const j = res.data
        if (!j.success || !j.data?.user) return
        const u = j.data.user
        setForm((prev) => {
          const next = { ...prev }
          const fn = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
          if (fn && !String(next.fullName || '').trim()) next.fullName = fn
          if (u.phone) {
            const ph = String(u.phone).replace(/\D/g, '').slice(0, 10)
            if (ph && !next.phone) next.phone = ph
          }
          if (u.email) next.email = String(u.email).toLowerCase()
          const addr = u.address
          if (addr && typeof addr === 'object') {
            if (addr.addressLine1 && !next.addressLine1) next.addressLine1 = addr.addressLine1
            if (addr.addressLine2 && !next.addressLine2) next.addressLine2 = addr.addressLine2
            if (addr.landmark && !next.landmark) next.landmark = addr.landmark
            if (addr.city && !next.city) next.city = addr.city
            if (addr.state && !next.state) next.state = addr.state
            if ((addr.pincode || addr.postalCode) && !next.pincode)
              next.pincode = addr.pincode || addr.postalCode
            if (addr.country && !next.country) next.country = addr.country
          }
          return next
        })
      })
      .catch(() => {})
  }, [])

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const onSubmit = (e) => {
    e.preventDefault()
    setErr('')
    const fullName = form.fullName.trim()
    const phone = form.phone.replace(/\D/g, '')
    const email = form.email.trim().toLowerCase()
    const pincode = form.pincode.replace(/\D/g, '')
    const addressLine1 = form.addressLine1.trim()
    const addressLine2 = form.addressLine2.trim()
    const landmark = form.landmark.trim()
    const city = form.city.trim()
    const state = form.state.trim()
    const country = form.country.trim() || 'India'

    if (!fullName) return setErr('Please enter your full name.')
    if (phone.length !== 10) return setErr('Enter a valid 10-digit mobile number.')
    if (!email || !email.includes('@')) return setErr('Enter a valid email address.')
    if (pincode.length !== 6) return setErr('Enter a valid 6-digit pincode.')
    if (!addressLine1) return setErr('Please enter address line 1.')
    if (!city || !state) return setErr('Please enter city and state.')

    const payload = {
      fullName,
      phone,
      email,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      pincode,
      country,
    }
    try {
      localStorage.setItem('shippingAddress', JSON.stringify(payload))
    } catch {
      return setErr('Could not save details. Check browser storage settings.')
    }
    navigate('/checkout')
  }

  return (
    <div className="min-h-screen pt-16 bg-primary-50">
      <div className="border-b border-primary-100 bg-gradient-to-br from-primary-50 via-orange-50/40 to-amber-50/50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <nav className="flex flex-wrap gap-3 justify-between items-center mb-2">
            <Link to="/cart" className="text-primary-600 font-semibold text-sm hover:underline">
              ← Back to cart
            </Link>
            <Link to="/" className="text-primary-600 font-semibold text-sm hover:underline">
              Shop
            </Link>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Your details
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-3xl">
            Enter your name, phone, email, and full delivery address. Payment is{' '}
            <strong>online only</strong> (card, UPI, net banking) on the next step after you continue.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-primary-100 bg-white shadow-lg shadow-primary-900/10 p-6 sm:p-8"
        >
          <p className="text-lg font-bold text-gray-900 mb-4">Personal information</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full name <span className="text-primary-600">*</span>
              </label>
              <input
                required
                maxLength={120}
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone (10 digits) <span className="text-primary-600">*</span>
              </label>
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email <span className="text-primary-600">*</span>
              </label>
              <input
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value.toLowerCase())}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 outline-none"
              />
            </div>
          </div>

          <p className="text-lg font-bold text-gray-900 mt-8 mb-4">Shipping address</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pincode <span className="text-primary-600">*</span>
              </label>
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={form.pincode}
                onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="600001"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Country</label>
              <input
                maxLength={80}
                value={form.country}
                onChange={(e) => setField('country', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Address line 1 <span className="text-primary-600">*</span>
              </label>
              <input
                required
                maxLength={200}
                autoComplete="address-line1"
                value={form.addressLine1}
                onChange={(e) => setField('addressLine1', e.target.value)}
                placeholder="House / flat, building, street"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Address line 2</label>
              <input
                maxLength={200}
                autoComplete="address-line2"
                value={form.addressLine2}
                onChange={(e) => setField('addressLine2', e.target.value)}
                placeholder="Area, colony (optional)"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Landmark</label>
              <input
                maxLength={120}
                value={form.landmark}
                onChange={(e) => setField('landmark', e.target.value)}
                placeholder="Near …"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                City <span className="text-primary-600">*</span>
              </label>
              <input
                required
                maxLength={80}
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                State <span className="text-primary-600">*</span>
              </label>
              <input
                required
                maxLength={80}
                autoComplete="address-level1"
                value={form.state}
                onChange={(e) => setField('state', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 outline-none"
              />
            </div>
          </div>

          <p className="text-lg font-bold text-gray-900 mt-8 mb-2">Payment method</p>
          <p className="text-sm text-gray-600 mb-4">
            We only accept <strong>online payment</strong> (Razorpay: UPI, cards, net banking). Cash on
            delivery is not available.
          </p>

          {err && (
            <p className="mb-4 text-sm rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
              {err}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary py-3 px-8">
              Continue to checkout
            </button>
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="rounded-xl bg-gray-100 text-gray-800 font-semibold px-6 py-3 hover:bg-gray-200"
            >
              Back to cart
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Your details are saved in this browser for checkout. Sign in is required to place the order.
          </p>
        </form>
      </div>
    </div>
  )
}
