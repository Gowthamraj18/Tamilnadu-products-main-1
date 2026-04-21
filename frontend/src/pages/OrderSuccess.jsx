import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Package, Truck } from 'lucide-react'

export default function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')?.trim() || ''

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-9 w-9 text-green-600" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment successful</h1>
        <p className="mt-2 text-gray-600">
          Thank you for your order. We have received your payment and will process your shipment soon.
        </p>
        {orderId && (
          <p className="mt-6 rounded-xl border border-green-100 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm">
            Order ID:{' '}
            <span className="font-mono font-semibold text-green-800">{orderId}</span>
          </p>
        )}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            <Package className="h-4 w-4" />
            My orders
          </Link>
          <Link
            to={orderId ? `/track-order?orderId=${encodeURIComponent(orderId)}` : '/track-order'}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            <Truck className="h-4 w-4" />
            Track order
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-xl border border-transparent px-6 py-3 text-sm font-semibold text-primary-700 hover:underline"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
