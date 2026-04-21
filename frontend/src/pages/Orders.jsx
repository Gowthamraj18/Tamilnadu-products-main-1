import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Package, ArrowRight, MapPin, Phone, Mail, RefreshCw, Eye, Download, RotateCcw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { formatPrice, formatDate } from '../utils/helpers'

const formatStatusLabel = (status) => {
  if (!status) return '—'
  return status
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const Orders = () => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setOrders([])
      setLoadingOrders(false)
      return
    }
    setLoadingOrders(true)
    setError('')
    try {
      const response = await fetch('/api/orders/customer', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        setOrders(data.data?.orders || [])
      } else {
        setOrders([])
        setError(
          data.message || data.error || `Could not load orders (${response.status})`
        )
      }
    } catch {
      setOrders([])
      setError('Could not load orders. Check your connection and try again.')
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user, location.pathname, location.key, fetchOrders])

  const replaceRefundState = (order) => ({
    orderId: order.orderId,
    email: order.shippingAddress?.email || user?.email || '',
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'ordered':
        return 'bg-amber-100 text-amber-900'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800'
      case 'out-for-delivery':
        return 'bg-orange-100 text-orange-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ordered':
      case 'pending':
        return <Package className="h-4 w-4" />
      case 'shipped':
      case 'out-for-delivery':
        return <RefreshCw className="h-4 w-4" />
      case 'delivered':
        return <Package className="h-4 w-4" />
      default:
        return null
    }
  }

  if (loading || loadingOrders) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/" className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <ArrowRight className="h-5 w-5 rotate-180" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="mt-1 text-sm text-gray-600">
                Every order you place while signed in is listed here. Use <strong>Replace & refund</strong> to open the request form with your order ID filled in.
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600 whitespace-nowrap">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </div>
        </div>

        {/* Error while list already loaded (e.g. refresh failure) */}
        {error && orders.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            {error ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Could not load your orders</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
                <button
                  type="button"
                  onClick={fetchOrders}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try again</span>
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">
                  Sign in and complete checkout—your orders will show up here. You can then request a replacement or refund for any order (policy applies).
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                >
                  <span>Start shopping</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const addr = order.shippingAddress || {}
              const showReplaceRefund = order.status !== 'cancelled'
              return (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-start gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Order ID</p>
                        <p className="font-medium text-gray-900">{order.orderId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order date</p>
                        <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-medium text-gray-900">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{formatStatusLabel(order.status)}</span>
                      </span>
                      {showReplaceRefund && (
                        <Link
                          to="/replace-refunds"
                          state={replaceRefundState(order)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-800 hover:bg-primary-100"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Replace & refund
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        aria-expanded={selectedOrder?._id === order._id}
                        aria-label={selectedOrder?._id === order._id ? 'Hide order details' : 'Show order details'}
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Details (Expanded) */}
                {selectedOrder?._id === order._id && (
                  <div className="p-6 bg-gray-50">
                    {/* Products */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Products</h4>
                      <div className="space-y-4">
                        {(order.items || []).map((item, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <img
                              src={item.image || '/placeholder.jpg'}
                              alt={item.name || 'Product'}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">Size: {item.size ?? '—'} | Qty: {item.quantity ?? 0}</p>
                            </div>
                            <p className="font-medium text-gray-900">{formatPrice((item.price || 0) * (item.quantity || 0))}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Shipping Address</h4>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">{addr.fullName || '—'}</p>
                            {addr.addressLine1 && (
                              <p className="text-sm text-gray-600">{addr.addressLine1}</p>
                            )}
                            {addr.addressLine2 && (
                              <p className="text-sm text-gray-600">{addr.addressLine2}</p>
                            )}
                            {(addr.city || addr.state || addr.pincode) && (
                              <p className="text-sm text-gray-600">
                                {[addr.city, addr.state].filter(Boolean).join(', ')}
                                {addr.pincode ? ` - ${addr.pincode}` : ''}
                              </p>
                            )}
                            {addr.country && (
                              <p className="text-sm text-gray-600">{addr.country}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Contact Information</h4>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                          <p className="text-sm text-gray-600">{addr.phone || '—'}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                          <p className="text-sm text-gray-600">{addr.email || '—'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Order Timeline</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Order Placed</p>
                            <p className="text-xs text-gray-600">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                        {order.status !== 'pending' && order.status !== 'ordered' && (
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Order Confirmed</p>
                              <p className="text-xs text-gray-600">{formatDate(order.updatedAt)}</p>
                            </div>
                          </div>
                        )}
                        {order.status === 'shipped' || order.status === 'out-for-delivery' || order.status === 'delivered' ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Order Shipped</p>
                              <p className="text-xs text-gray-600">Your order is on its way</p>
                            </div>
                          </div>
                        ) : null}
                        {order.status === 'delivered' ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Order Delivered</p>
                              <p className="text-xs text-gray-600">Successfully delivered</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end mt-6 pt-6 border-t border-gray-200">
                      {showReplaceRefund && (
                        <Link
                          to="/replace-refunds"
                          state={replaceRefundState(order)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-primary-300 text-primary-800 bg-white rounded-lg hover:bg-primary-50 transition-colors duration-200"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Replace & refund</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Invoice</span>
                      </button>
                      <Link
                        to="/track-order"
                        state={{ orderId: order.orderId }}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Track Order</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
