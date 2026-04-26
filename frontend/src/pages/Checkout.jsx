import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CreditCard, Shield, LogIn, UserPlus } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import {
  formatPrice,
  calculateShipping,
  calculateHandlingCharge,
  calculateTotal,
  validateEmail,
  validatePhone,
  validatePincode,
  validateUpiVpa,
} from '../utils/helpers'
import { createOrder } from '../utils/orderService'

const Checkout = () => {
  const navigate = useNavigate()
  const { items, getCartTotal, getCartCount } = useCart()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  })
  
  const [billingAddress, setBillingAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  })
  
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [upiId, setUpiId] = useState('')
  const [orderNotes, setOrderNotes] = useState('')

  const subtotal = getCartTotal()
  const shipping = calculateShipping(subtotal)
  const handlingCharge = calculateHandlingCharge(subtotal)
  const total = calculateTotal(subtotal, shipping, handlingCharge)

  useEffect(() => {
    // Load user data from localStorage if available
    const savedAddress = localStorage.getItem('shippingAddress')
    if (savedAddress) {
      try {
        const address = JSON.parse(savedAddress)
        setShippingAddress(address)
        if (sameAsShipping) {
          setBillingAddress(address)
        }
      } catch (error) {
        console.error('Error loading saved address:', error)
      }
    }
  }, [sameAsShipping])

  useEffect(() => {
    if (sameAsShipping) {
      setBillingAddress(shippingAddress)
    }
  }, [sameAsShipping, shippingAddress])

  useEffect(() => {
    if (authLoading || !user) return

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()

    setShippingAddress((prev) => {
      const next = { ...prev }
      if (!next.fullName?.trim() && fullName) next.fullName = fullName
      if (!next.email?.trim() && user.email) next.email = user.email
      if (!next.phone?.trim() && user.phone) next.phone = user.phone

      const addr = user.address
      if (addr && typeof addr === 'object') {
        if (!next.addressLine1?.trim()) next.addressLine1 = addr.addressLine1 || addr.line1 || ''
        if (!next.addressLine2?.trim()) next.addressLine2 = addr.addressLine2 || addr.line2 || ''
        if (!next.landmark?.trim()) next.landmark = addr.landmark || ''
        if (!next.city?.trim()) next.city = addr.city || ''
        if (!next.state?.trim()) next.state = addr.state || ''
        if (!next.pincode?.trim()) next.pincode = addr.pincode || addr.postalCode || ''
      }
      return next
    })
  }, [user, authLoading])

  const handleInputChange = (addressType, field, value) => {
    if (addressType === 'shipping') {
      setShippingAddress(prev => ({ ...prev, [field]: value }))
    } else {
      setBillingAddress(prev => ({ ...prev, [field]: value }))
    }
  }

  const validateForm = () => {
    // Validate shipping address
    const shippingErrors = {}
    
    if (!shippingAddress.fullName.trim()) {
      shippingErrors.fullName = 'Full name is required'
    }
    
    if (!shippingAddress.phone.trim()) {
      shippingErrors.phone = 'Phone number is required'
    } else if (!validatePhone(shippingAddress.phone)) {
      shippingErrors.phone = 'Please enter a valid 10-digit phone number'
    }
    
    if (!shippingAddress.email.trim()) {
      shippingErrors.email = 'Email is required'
    } else if (!validateEmail(shippingAddress.email)) {
      shippingErrors.email = 'Please enter a valid email address'
    }
    
    if (!shippingAddress.addressLine1.trim()) {
      shippingErrors.addressLine1 = 'Address line 1 is required'
    }
    
    if (!shippingAddress.city.trim()) {
      shippingErrors.city = 'City is required'
    }
    
    if (!shippingAddress.state.trim()) {
      shippingErrors.state = 'State is required'
    }
    
    if (!shippingAddress.pincode.trim()) {
      shippingErrors.pincode = 'Pincode is required'
    } else if (!validatePincode(shippingAddress.pincode)) {
      shippingErrors.pincode = 'Please enter a valid 6-digit pincode'
    }
    
    // Validate billing address if different from shipping
    const billingErrors = {}
    if (!sameAsShipping) {
      if (!billingAddress.fullName.trim()) {
        billingErrors.fullName = 'Full name is required'
      }
      
      if (!billingAddress.phone.trim()) {
        billingErrors.phone = 'Phone number is required'
      } else if (!validatePhone(billingAddress.phone)) {
        billingErrors.phone = 'Please enter a valid 10-digit phone number'
      }
      
      if (!billingAddress.email.trim()) {
        billingErrors.email = 'Email is required'
      } else if (!validateEmail(billingAddress.email)) {
        billingErrors.email = 'Please enter a valid email address'
      }
      
      if (!billingAddress.addressLine1.trim()) {
        billingErrors.addressLine1 = 'Address line 1 is required'
      }
      
      if (!billingAddress.city.trim()) {
        billingErrors.city = 'City is required'
      }
      
      if (!billingAddress.state.trim()) {
        billingErrors.state = 'State is required'
      }
      
      if (!billingAddress.pincode.trim()) {
        billingErrors.pincode = 'Pincode is required'
      } else if (!validatePincode(billingAddress.pincode)) {
        billingErrors.pincode = 'Please enter a valid 6-digit pincode'
      }
    }
    
    return { shippingErrors, billingErrors }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!localStorage.getItem('token')) {
      setError('Please sign in to place your order.')
      return
    }
    await handlePayment()
  }

  const handlePayment = async () => {
    const { shippingErrors, billingErrors } = validateForm()
    
    if (Object.keys(shippingErrors).length > 0 || Object.keys(billingErrors).length > 0) {
      setError('Please fill in all required fields correctly')
      return
    }

    const upiErr = validateUpiVpa(upiId)
    if (upiErr) {
      setError(upiErr)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Prepare order data for the new tracking system
      const orderData = {
        customerEmail: shippingAddress.email,
        customerName: shippingAddress.fullName,
        customerPhone: shippingAddress.phone,
        products: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.selectedSize,
          image: item.image
        })),
        totalAmount: total,
        shippingAddress: {
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          landmark: shippingAddress.landmark,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode
        },
        notes: orderNotes
      }

      // Create order using the new service
      const orderResult = await createOrder(orderData)
      
      if (orderResult.success) {
        // Save order details for success page
        localStorage.setItem('lastOrder', JSON.stringify({
          orderId: orderResult.orderId,
          status: orderResult.status,
          total: orderResult.total,
          createdAt: orderResult.createdAt,
          items: items,
          shippingAddress: shippingAddress
        }))
        
        await initiateRazorpayPayment(orderResult)
      } else {
        setError('Failed to create order. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const initiateRazorpayPayment = async (orderResult) => {
    try {
      if (typeof window.Razorpay !== 'function') {
        setError(
          'Razorpay checkout could not load. Check your network or disable ad blockers, then refresh the page.'
        )
        return
      }
      const token = localStorage.getItem('token')
      const authPart = token ? { Authorization: `Bearer ${token}` } : {}
      let keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || ''
      if (!keyId) {
        try {
          const cfg = await fetch('/api/payments/config')
          const cj = await cfg.json()
          if (cj.success && cj.keyId) keyId = cj.keyId
        } catch {
          /* ignore */
        }
      }
      if (!keyId) {
        setError(
          'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the server .env and restart the API.'
        )
        return
      }
      // Calculate dynamic pricing
      const subtotal = getCartTotal()
      const shipping = calculateShipping(subtotal)
      const handling = calculateHandlingCharge(subtotal)
      const total = calculateTotal(subtotal, shipping, handling)
      
      // Prepare cart items for backend
      const cartItems = items.map(item => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || '',
        color: item.color || ''
      }))

      const response = await fetch('/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authPart,
        },
        body: JSON.stringify({ 
          amount: Math.round(total * 100), 
          orderId: orderResult.orderId,
          items: cartItems,
          subtotal: subtotal,
          shipping: shipping,
          handling: handling
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (data.success && data.data?.id) {
        const razorpayOrder = data.data

        const options = {
          key: keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'AKL EXIM / Tamil Nadu Products',
          description: 'Product Checkout Payment',
          order_id: razorpayOrder.id,
          handler: async function (response) {
            const verifyResponse = await fetch('/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...authPart,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderResult.orderId,
              }),
            })

            const verifyData = await verifyResponse.json().catch(() => ({}))

            if (verifyData.success) {
              navigate(`/order-success?orderId=${encodeURIComponent(orderResult.orderId)}`)
            } else {
              setError(
                verifyData.error ||
                  verifyData.message ||
                  'Payment verification failed. Contact support with your order ID.'
              )
            }
          },
          modal: {
            ondismiss: () => setLoading(false),
          },
          prefill: {
            name: shippingAddress.fullName,
            email: shippingAddress.email,
            contact: String(shippingAddress.phone || '')
              .replace(/\D/g, '')
              .slice(-10),
            vpa: upiId.trim().toLowerCase(),
          },
          theme: {
            color: '#f37920',
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      } else {
        setError(
          data.error ||
            data.message ||
            (response.status === 500
              ? 'Payment service not configured on the server.'
              : 'Could not start Razorpay checkout. Please try again.')
        )
      }
    } catch (error) {
      console.error('Razorpay error:', error)
      setError(error.message || 'Payment initiation failed.')
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <Link
            to="/cart"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Cart</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-600">
            Secure checkout powered by Razorpay. Review your order, enter your delivery details, then pay online.
          </p>

          {/* Progress steps */}
          <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs">
                1
              </div>
              <span>Cart</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-primary-500/60 to-primary-300/40" />
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs">
                2
              </div>
              <span>Details</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-primary-300/40 to-primary-500/60" />
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs">
                3
              </div>
              <span>Payment</span>
            </div>
          </div>
        </div>

        {!authLoading && !isAuthenticated && (
          <div className="mb-8 rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-50 via-white to-blue-50 p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                1
              </span>
              Sign in for a faster checkout
            </h2>
            <p className="mt-2 text-sm text-gray-600 max-w-2xl">
              Have an account? Sign in to auto-fill your details, see saved addresses, and track this order easily.
              You can still complete your purchase as a guest below.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/login?redirect=%2Fcheckout"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
              <Link
                to="/login?redirect=%2Fcheckout&register=1"
                className="inline-flex items-center gap-2 rounded-lg border border-primary-600 bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-50"
              >
                <UserPlus className="h-4 w-4" />
                Create account
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) => handleInputChange('shipping', 'fullName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => handleInputChange('shipping', 'phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="9876543210"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => handleInputChange('shipping', 'email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.pincode}
                    onChange={(e) => handleInputChange('shipping', 'pincode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="600001"
                    maxLength={6}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => handleInputChange('shipping', 'addressLine1', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.addressLine2}
                    onChange={(e) => handleInputChange('shipping', 'addressLine2', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.landmark}
                    onChange={(e) => handleInputChange('shipping', 'landmark', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => handleInputChange('shipping', 'state', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.country}
                    onChange={(e) => handleInputChange('shipping', 'country', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Billing Address</h2>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">Same as shipping address</span>
                </label>
              </div>
              
              {!sameAsShipping && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Billing address fields (same as shipping) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={billingAddress.fullName}
                      onChange={(e) => handleInputChange('billing', 'fullName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={billingAddress.phone}
                      onChange={(e) => handleInputChange('billing', 'phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={billingAddress.addressLine1}
                      onChange={(e) => handleInputChange('billing', 'addressLine1', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={billingAddress.city}
                      onChange={(e) => handleInputChange('billing', 'city', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={billingAddress.state}
                      onChange={(e) => handleInputChange('billing', 'state', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={billingAddress.pincode}
                      onChange={(e) => handleInputChange('billing', 'pincode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment — online only */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment</h2>
              <p className="text-sm text-gray-600 mb-6">
                We only accept online payment (Razorpay). Cards, UPI, and net banking are available in the secure payment window.
              </p>
              <div className="flex items-start gap-3 rounded-lg border border-primary-100 bg-primary-50/50 p-4 mb-6">
                <CreditCard className="h-5 w-5 text-primary-700 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-800">
                  Cash on delivery is not available. Your order is confirmed after successful online payment.
                </p>
              </div>
              <div>
                <label htmlFor="checkout-upi" className="block text-sm font-medium text-gray-700 mb-1">
                  UPI ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="checkout-upi"
                  type="text"
                  inputMode="email"
                  autoComplete="off"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@paytm"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the UPI ID you will use in the Razorpay window (Google Pay, PhonePe, Paytm, etc.).
                </p>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Notes (Optional)</h2>
              
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Add any special instructions for your order..."
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-primary-100 bg-gradient-to-b from-primary-50 via-white to-primary-50/60 p-6 shadow-md sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Summary</h2>
              <p className="text-xs text-gray-600 mb-4">Review items and total before final payment.</p>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No img</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-600">
                        Size: {item.selectedSize} × {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-primary-600">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary Details */}
              <div className="space-y-3 mb-6 border-t border-primary-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({getCartCount()} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Handling charge</span>
                  <span className="font-medium">{formatPrice(handlingCharge)}</span>
                </div>
              </div>
              
              {/* Total */}
              <div className="border-t border-primary-100 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-xs uppercase tracking-wide text-gray-500">Grand total</span>
                    <span className="text-lg font-semibold text-gray-900">To pay</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Incl. shipping & handling</p>
                    <span className="text-2xl font-bold text-primary-700 tracking-tight">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Security Badge */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-emerald-700">
                    Secure & Encrypted Payment
                  </span>
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing your order...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>Pay {formatPrice(total)}</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
              
              {/* Terms */}
              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout
