import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { validateUpiVpa } from '../utils/helpers'

function fmtMoney(n) {
  const x = Number(n)
  if (Number.isNaN(x)) return '—'
  return `₹${x.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams()
  const [orderIdInput, setOrderIdInput] = useState('')
  const [loaded, setLoaded] = useState(null)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)
  const [razorpayKeyId, setRazorpayKeyId] = useState('')
  const [cfgHint, setCfgHint] = useState('')
  const [upiId, setUpiId] = useState('')

  const token = () => localStorage.getItem('token')

  const authHeaders = (json = true) => {
    const h = {}
    if (json) h['Content-Type'] = 'application/json'
    const t = token()
    if (t) h.Authorization = `Bearer ${t}`
    return h
  }

  useEffect(() => {
    fetch('/api/payments/config')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.keyId) setRazorpayKeyId(j.keyId)
      })
      .catch(() => {})
  }, [])

  const loadOrder = useCallback(async (idRaw) => {
    const id = (idRaw ?? orderIdInput).trim()
    if (!id) {
      setErr('Please enter an order ID.')
      return
    }
    setErr('')
    setSuccess('')
    setLoading(true)
    try {
      const r = await fetch(`/api/orders/track-order/${encodeURIComponent(id)}`)
      const j = await r.json()
      if (!r.ok || !j.success) {
        setErr(j.message || j.error || 'Order not found.')
        setLoaded(null)
        return
      }
      setLoaded(j.data)
    } catch {
      setErr('Network error. Try again.')
      setLoaded(null)
    } finally {
      setLoading(false)
    }
  }, [orderIdInput])

  useEffect(() => {
    const q = searchParams.get('orderId')
    if (q) {
      setOrderIdInput(q)
      loadOrder(q)
    }
  }, [searchParams, loadOrder])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token' && loaded) loadOrder(loaded.orderId)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [loaded, loadOrder])

  useEffect(() => {
    if (!loaded) return
    const ps = (loaded.paymentStatus || '').toLowerCase()
    const canPay = ps !== 'completed' && ps !== 'paid'
    const signedIn = !!token()
    if (!razorpayKeyId) {
      setCfgHint(
        'Online payment is not configured on this server (missing Razorpay keys). You can still contact support.'
      )
    } else if (!signedIn) {
      setCfgHint('Sign in on the shop in this browser to enable Pay with Razorpay.')
    } else if (!canPay) {
      setCfgHint('This order is already paid. Thank you!')
    } else {
      setCfgHint('')
    }
  }, [loaded, razorpayKeyId])

  const canPayNow = () => {
    if (!loaded || !razorpayKeyId) return false
    const ps = (loaded.paymentStatus || '').toLowerCase()
    if (ps === 'completed' || ps === 'paid') return false
    return !!token()
  }

  const pay = async () => {
    if (!loaded || !razorpayKeyId) return
    setErr('')
    if (!token()) {
      setErr('Please sign in on the shop first, then try again.')
      return
    }
    const amountPaise = Math.round(Number(loaded.total) * 100)
    if (amountPaise < 100) {
      setErr('Invalid order amount.')
      return
    }
    const upiErr = validateUpiVpa(upiId)
    if (upiErr) {
      setErr(upiErr)
      return
    }
    setPaying(true)
    try {
      if (typeof window.Razorpay !== 'function') {
        setErr('Razorpay checkout could not load. Refresh the page or check your network.')
        setPaying(false)
        return
      }
      const r = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ amount: amountPaise, orderId: loaded.orderId }),
      })
      const j = await r.json()
      if (r.status === 401) {
        setErr('Session expired or not signed in. Open the shop and sign in, then try again.')
        setPaying(false)
        return
      }
      if (!r.ok || !j.success) {
        setErr(j.error || j.message || 'Could not start payment.')
        setPaying(false)
        return
      }
      const rzOrder = j.data
      const options = {
        key: razorpayKeyId,
        amount: amountPaise,
        currency: 'INR',
        name: 'Tamil Nadu Products',
        description: `Order ${loaded.orderId}`,
        order_id: rzOrder.id,
        handler: async (response) => {
          try {
            const v = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: loaded.orderId,
              }),
            })
            const vj = await v.json()
            if (!v.ok || !vj.success) {
              setErr(vj.error || vj.message || 'Verification failed.')
              setPaying(false)
              return
            }
            setLoaded((prev) => (prev ? { ...prev, paymentStatus: 'completed' } : null))
            setSuccess(
              `Payment successful! Order ${vj.data?.orderId || loaded.orderId} is confirmed.`
            )
            setPaying(false)
          } catch {
            setErr('Verification request failed.')
            setPaying(false)
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
        prefill: {
          vpa: upiId.trim().toLowerCase(),
        },
        theme: { color: '#db2777' },
      }
      const rz = new window.Razorpay(options)
      rz.open()
    } catch {
      setErr('Could not open payment window.')
      setPaying(false)
    }
  }

  const ps = loaded ? (loaded.paymentStatus || '').toLowerCase() : ''

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-primary-50 to-white">
      <div className="border-b border-primary-100 bg-gradient-to-br from-primary-50 via-orange-50/40 to-amber-50/60">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <nav className="flex flex-wrap gap-3 justify-between items-center mb-2">
            <Link to="/" className="text-primary-600 font-semibold text-sm hover:underline">
              ← Shop
            </Link>
            <Link to="/delivery-updates" className="text-primary-600 font-semibold text-sm hover:underline">
              Delivery updates
            </Link>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Complete payment
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Enter your order ID to pay securely with Razorpay (UPI, cards, net banking). You must be
            signed in to complete payment.
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Quick Payment:</strong> You can also pay directly at{' '}
              <a 
                href="https://razorpay.me/@tamilnaduproducts" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-semibold"
              >
                razorpay.me/@tamilnaduproducts
              </a>
            </p>
          </div>
          {!token() && (
            <p className="mt-3 text-sm rounded-xl border border-blue-200 bg-blue-50 text-blue-800 px-4 py-3">
              You are not signed in. Open the shop, sign in, then return here to pay (same browser).
            </p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-2xl border border-primary-100 bg-white shadow-lg shadow-primary-900/10 p-6">
          <label htmlFor="orderId" className="block text-sm font-semibold text-gray-700 mb-1">
            Order ID
          </label>
          <input
            id="orderId"
            type="text"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadOrder()}
            placeholder="e.g. TNP…"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
          />
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              type="button"
              onClick={() => loadOrder()}
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold px-5 py-2.5 shadow-md hover:opacity-95 disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Load order'}
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderIdInput('')
                setLoaded(null)
                setErr('')
                setSuccess('')
              }}
              className="rounded-xl bg-gray-100 text-gray-800 font-semibold px-5 py-2.5 hover:bg-gray-200"
            >
              Clear
            </button>
          </div>

          {err && (
            <p className="mt-4 text-sm rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
              {err}
            </p>
          )}
          {success && (
            <p className="mt-4 text-sm rounded-xl border border-green-200 bg-green-50 text-green-800 px-4 py-3">
              {success}
            </p>
          )}

          {loaded && !success && (
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order</span>
                <span className="font-semibold">{loaded.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold">{fmtMoney(loaded.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    ps === 'completed' || ps === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {loaded.paymentStatus || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-semibold uppercase">{(loaded.paymentMethod || '—').toString()}</span>
              </div>
              <div className="flex justify-between text-base pt-3 border-t border-dashed border-gray-200">
                <span className="font-semibold">Pay now</span>
                <span className="font-bold">{fmtMoney(loaded.total)}</span>
              </div>
              <div className="mt-4">
                <label htmlFor="payment-upi" className="block text-sm font-semibold text-gray-700 mb-1">
                  UPI ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="payment-upi"
                  type="text"
                  inputMode="email"
                  autoComplete="off"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@paytm"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Used to prefill UPI in the Razorpay payment window.
                </p>
              </div>
              <button
                type="button"
                onClick={pay}
                disabled={!canPayNow() || paying}
                className="mt-4 w-full sm:w-auto rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold px-6 py-3 shadow-md disabled:opacity-45"
              >
                Pay with Razorpay
              </button>
              {cfgHint && <p className="text-gray-500 text-xs mt-3">{cfgHint}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
