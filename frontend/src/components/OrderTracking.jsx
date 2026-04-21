import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Calendar, AlertCircle, ArrowRight } from 'lucide-react'

const OrderTracking = () => {
  const [searchParams] = useSearchParams()
  const [orderId, setOrderId] = useState('')
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  const statusSteps = [
    { 
      status: 'ordered', 
      label: 'Ordered', 
      icon: <Package className="h-5 w-5" />,
      description: 'Order placed successfully'
    },
    { 
      status: 'shipped', 
      label: 'Shipped', 
      icon: <Truck className="h-5 w-5" />,
      description: 'Order has been shipped'
    },
    { 
      status: 'out-for-delivery', 
      label: 'Out for Delivery', 
      icon: <Truck className="h-5 w-5" />,
      description: 'Order is out for delivery'
    },
    { 
      status: 'delivered', 
      label: 'Delivered', 
      icon: <CheckCircle className="h-5 w-5" />,
      description: 'Order delivered successfully'
    }
  ]

  const showToastNotification = (message, type = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const trackById = useCallback(
    async (rawId) => {
      const id = (rawId ?? '').trim()
      if (!id) {
        setError('Please enter an order ID')
        return
      }

      setLoading(true)
      setError('')
      setOrderData(null)

      try {
        const response = await fetch(`/api/orders/track-order/${encodeURIComponent(id)}`)
        const data = await response.json()

        if (data.success) {
          setOrderData(data.data)
          showToastNotification('Order tracked successfully!', 'success')
        } else {
          setError('Order not found. Please check your order ID and try again.')
          showToastNotification('Order not found', 'error')
        }
      } catch (error) {
        console.error('Track order error:', error)
        setError('Failed to track order. Please try again later.')
        showToastNotification('Failed to track order', 'error')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const handleTrackOrder = async (e) => {
    e.preventDefault()
    await trackById(orderId)
  }

  useEffect(() => {
    const q = searchParams.get('orderId')?.trim()
    if (!q) return
    const normalized = q.toUpperCase()
    setOrderId(normalized)
    trackById(normalized)
  }, [searchParams, trackById])

  const getStatusIndex = (status) => {
    const statusMap = {
      'ordered': 0,
      'shipped': 1,
      'out-for-delivery': 2,
      'delivered': 3
    }
    return statusMap[status] || 0
  }

  const getCurrentStepIndex = orderData ? getStatusIndex(orderData.status) : 0

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          toastType === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toastType === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Track Your Order</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Customers will be notified once the courier tracking ID is received and shared by us via WhatsApp, SMS, or email.
            </p>
            <p className="text-lg text-blue-80 max-w-3xl mx-auto mt-4">
              After receiving tracking details, customers can use the tracking ID to monitor the status of their purchased products through the respective courier service.
            </p>
            <p className="text-lg text-blue-80 max-w-3xl mx-auto mt-4">
              If you have not received your tracking details or need assistance, please contact our customer support team.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Enter Order ID</h2>
            
            <form onSubmit={handleTrackOrder} className="space-y-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                    placeholder="e.g., TNP8F3KX2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Tracking...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      <span>Track Order</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Sample Orders */}
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-3">Try these sample order IDs:</p>
                <div className="flex flex-wrap gap-2">
                  {['TNP8F3KX2', 'TNP7G2LX9', 'TNP9H4MZ3'].map((sampleId) => (
                    <button
                      key={sampleId}
                      onClick={() => setOrderId(sampleId)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200"
                    >
                      {sampleId}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Order Tracking Results */}
        {orderData && (
          <div className="max-w-4xl mx-auto">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  orderData.status === 'delivered' 
                    ? 'bg-green-100 text-green-700'
                    : orderData.status === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1).replace('-', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="font-semibold text-gray-900">{orderData.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(orderData.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="font-semibold text-gray-900">{formatPrice(orderData.total)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{orderData.paymentStatus}</p>
                </div>
                {orderData.trackingNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                    <p className="font-semibold text-gray-900">{orderData.trackingNumber}</p>
                  </div>
                )}
                {orderData.estimatedDelivery && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(orderData.estimatedDelivery)}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              {orderData.items && orderData.items.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {orderData.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">Size: {item.size} | Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">{formatPrice(item.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Order Progress</h3>
              
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>
                
                {/* Steps */}
                <div className="space-y-8">
                  {statusSteps.map((step, index) => {
                    const isActive = index <= getCurrentStepIndex
                    const isCompleted = index < getCurrentStepIndex
                    
                    return (
                      <div key={step.status} className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-green-100 text-green-600'
                            : isActive 
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {step.icon}
                        </div>
                        <div className="flex-1 pt-2">
                          <h4 className={`font-semibold text-lg ${
                            isActive ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </h4>
                          <p className={`text-sm ${
                            isActive ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {step.description}
                          </p>
                          {isCompleted && (
                            <p className="text-sm text-green-600 mt-1">Completed</p>
                          )}
                          {index === getCurrentStepIndex && (
                            <p className="text-sm text-blue-600 mt-1">Current Status</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Status History */}
            {orderData.statusHistory && orderData.statusHistory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Status History</h3>
                
                <div className="space-y-4">
                  {orderData.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 capitalize">
                            {history.status.replace('-', ' ')}
                          </h4>
                          <span className="text-sm text-gray-600">
                            {formatDate(history.timestamp)}
                          </span>
                        </div>
                        {history.note && (
                          <p className="text-gray-600 mt-1">{history.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Address */}
            {orderData.shippingAddress && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Delivery Address</h3>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {orderData.shippingAddress.fullName || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      {orderData.shippingAddress.addressLine1}
                      {orderData.shippingAddress.addressLine2 && `, ${orderData.shippingAddress.addressLine2}`}
                    </p>
                    <p className="text-gray-600">
                      {orderData.shippingAddress.city}, {orderData.shippingAddress.state} - {orderData.shippingAddress.pincode}
                    </p>
                    <p className="text-gray-600">
                      Phone: {orderData.shippingAddress.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        {!orderData && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-6">
                If you're having trouble tracking your order or have any questions, our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:info@aklexim.com"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  Email Support
                </a>
                <a
                  href="tel:+918838576652"
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  Call Support
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderTracking
