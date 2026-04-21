import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

function fmtDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function DeliveryUpdatesPage() {
  const [searchParams] = useSearchParams()
  const [orderIdInput, setOrderIdInput] = useState('')
  const [err, setErr] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const track = useCallback(async (idRaw) => {
    const id = (idRaw ?? orderIdInput).trim()
    if (!id) {
      setErr('Please enter an order ID.')
      return
    }
    setErr('')
    setLoading(true)
    setData(null)
    try {
      const r = await fetch(`/api/orders/track-order/${encodeURIComponent(id)}`)
      const j = await r.json()
      if (!r.ok || !j.success) {
        setErr(j.message || j.error || 'Order not found.')
        return
      }
      setData(j.data)
    } catch {
      setErr('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }, [orderIdInput])

  useEffect(() => {
    const q = searchParams.get('orderId')
    if (q) {
      setOrderIdInput(q)
      track(q)
    }
  }, [searchParams, track])

  const hist = Array.isArray(data?.statusHistory) ? [...data.statusHistory] : []
  hist.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))

  const ps = (data?.paymentStatus || '').toLowerCase()

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-emerald-50/80 to-gray-50">
      <div className="border-b border-emerald-100 bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-amber-50/40">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <nav className="flex flex-wrap gap-3 justify-between items-center mb-2">
            <Link to="/" className="text-emerald-700 font-semibold text-sm hover:underline">
              ← Shop
            </Link>
            <Link to="/payment" className="text-emerald-700 font-semibold text-sm hover:underline">
              Pay for order
            </Link>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Delivery updates
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Track your shipment with your order ID. See status history and estimated delivery.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-lg shadow-emerald-900/5 p-6">
          <label htmlFor="oid" className="block text-sm font-semibold text-gray-700 mb-1">
            Order ID
          </label>
          <input
            id="oid"
            type="text"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && track()}
            placeholder="e.g. TNP…"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 outline-none"
          />
          <button
            type="button"
            onClick={() => track()}
            disabled={loading}
            className="mt-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold px-5 py-2.5 shadow-md disabled:opacity-50"
          >
            {loading ? 'Tracking…' : 'Track order'}
          </button>

          {err && (
            <p className="mt-4 text-sm rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
              {err}
            </p>
          )}

          {data && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-800 font-bold text-sm px-4 py-2 mb-4 capitalize">
                {(data.status || '—').replace(/-/g, ' ')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="rounded-xl bg-gray-50 p-4 text-sm">
                  <span className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Order ID</span>
                  <span className="font-medium text-gray-900">{data.orderId}</span>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 text-sm">
                  <span className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Payment</span>
                  <span className="font-medium text-gray-900">
                    {data.paymentStatus} · {(data.paymentMethod || '—').toString().toUpperCase()}
                  </span>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 text-sm">
                  <span className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Tracking #</span>
                  <span className="font-medium text-gray-900">
                    {data.trackingNumber || 'Not assigned yet'}
                  </span>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 text-sm">
                  <span className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Est. delivery
                  </span>
                  <span className="font-medium text-gray-900">
                    {data.estimatedDelivery ? fmtDate(data.estimatedDelivery) : '—'}
                  </span>
                </div>
              </div>

              <h2 className="text-base font-semibold text-gray-800 mb-3">Status timeline</h2>
              <div className="relative pl-6 border-l-2 border-emerald-100 space-y-5">
                {hist.length === 0 ? (
                  <p className="text-gray-500 text-sm">No status history yet.</p>
                ) : (
                  hist.map((h, i) => (
                    <div key={i} className="relative">
                      <span className="absolute -left-[1.4rem] top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                      <div className="font-semibold text-emerald-900 capitalize">
                        {(h.status || '').replace(/-/g, ' ')}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{fmtDate(h.timestamp)}</div>
                      {h.note && <div className="text-sm text-gray-600 mt-1">{h.note}</div>}
                    </div>
                  ))
                )}
              </div>

              {ps !== 'completed' && ps !== 'paid' && (
                <p className="mt-6 text-sm text-gray-600">
                  Need to pay online?{' '}
                  <Link
                    to={`/payment?orderId=${encodeURIComponent(data.orderId || '')}`}
                    className="text-primary-600 font-semibold hover:underline"
                  >
                    Open payment page
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
