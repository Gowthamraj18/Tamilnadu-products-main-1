import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { RotateCcw, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const Returns = () => {
  const location = useLocation()

  useEffect(() => {
    document.title = 'Replace & Refunds | Tamil Nadu Products'
  }, [])

  const [formData, setFormData] = useState({
    orderId: '',
    email: '',
    items: [],
    reason: '',
    condition: 'new',
    images: [],
    notes: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const s = location.state
    if (!s || (!s.orderId && !s.email)) return
    setFormData((prev) => ({
      ...prev,
      ...(s.orderId != null &&
        String(s.orderId).trim() && { orderId: String(s.orderId).trim() }),
      ...(s.email != null && String(s.email).trim() && { email: String(s.email).trim() }),
    }))
  }, [location.state])

  const returnReasons = [
    { value: 'wrong-size', label: 'Wrong Size' },
    { value: 'wrong-color', label: 'Wrong Color' },
    { value: 'defective-product', label: 'Defective Product' },
    { value: 'not-as-described', label: 'Not as Described' },
    { value: 'no-longer-needed', label: 'No Longer Needed' },
    { value: 'ordered-by-mistake', label: 'Ordered by Mistake' },
    { value: 'other', label: 'Other' }
  ]

  const conditionOptions = [
    { value: 'new', label: 'New - Unused with tags' },
    { value: 'used', label: 'Used - Worn once or twice' },
    { value: 'damaged', label: 'Damaged - Product arrived damaged' }
  ]

  const returnSteps = [
    {
      icon: <Package className="h-8 w-8" />,
      title: 'Submit your request',
      description: 'Use the form with order details and reason for replacement or refund'
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Approval Process',
      description: 'Our team reviews your request within 24 hours'
    },
    {
      icon: <RotateCcw className="h-8 w-8" />,
      title: 'Return Pickup',
      description: 'Schedule pickup or send the product back'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Refund or replacement',
      description: 'Refund to original payment or replacement shipped after inspection'
    }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setSubmitted(true)
      } else {
        alert('Failed to submit return request. Please try again.')
      }
    } catch (error) {
      console.error('Return request error:', error)
      alert('Failed to submit return request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (submitted) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Request submitted</h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Your replacement or refund request has been received. We will review it and contact you within 24 hours with next steps.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto mb-8">
              <p className="text-sm text-gray-600 mb-2">Return Reference ID:</p>
              <p className="text-lg font-semibold text-gray-900">RET{Date.now().toString(36).toUpperCase()}</p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Submit Another Return
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Replace & Refunds</h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Request a replacement or a refund. Clear steps, fair policy, and quick support.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Return Process */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How replacements & refunds work</h2>
            <p className="text-gray-600">Four simple steps from request to resolution</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {returnSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Return Policy */}
        <div className="bg-gray-50 rounded-xl p-8 mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Replacement & refund policy</h2>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 mb-4">
              <strong>Replacements:</strong> Where eligible, we may ship a replacement item (e.g. correct size or colour) instead of a refund. Availability depends on stock; if a replacement is not possible, we will process a refund as per policy.
            </p>
            <p className="text-gray-700 mb-4">
              Since this is dress material, we follow strict policies for both replacements and refunds.
            </p>
            <p className="text-gray-700 mb-4">
              Replacements and refunds apply only for products damaged in transit or if an incorrect item or size was delivered. Valid evidence (photos or short video) is required.
            </p>
            <p className="text-gray-700 mb-4">
              Customers must check size and condition at delivery before accepting from the courier. After acceptance, replacement and refund requests are generally not accepted.
            </p>
            <p className="text-gray-700 mb-6">
              For any return or refund clarifications, please reach out to our customer care number: <a href="tel:+918838576652" className="text-primary-600 font-semibold">+91 8838576652</a> or email us at <a href="mailto:info@aklexim.com" className="text-primary-600 font-semibold">info@aklexim.com</a>
            </p>
          </div>
        </div>

        {/* Return Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Request a replacement or refund</h2>
            {location.state?.orderId && (
              <p className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                Order ID and email were filled from <strong>My Orders</strong>. You can edit them if needed.
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order ID *
                  </label>
                  <input
                    type="text"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    required
                    placeholder="e.g., TNP123ABC456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (replacement or refund) *
                </label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a reason</option>
                  {returnReasons.map(reason => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Condition *
                </label>
                <div className="space-y-3">
                  {conditionOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="condition"
                        value={option.value}
                        checked={formData.condition === option.value}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Provide any additional details about your return request..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Important Notes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Return requests must be submitted within 7 days of delivery</li>
                      <li>Products must be unused and in original packaging</li>
                      <li>Refunds will be processed within 5-7 business days after approval</li>
                      <li>Shipping charges for returns may apply unless the product is defective</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-5 w-5" />
                    <span>Submit request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
            <p className="text-gray-600">Replacements, refunds, and timelines</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">How long does the return process take?</h3>
              <p className="text-gray-600 text-sm">
                Once approved, returns typically take 5-7 business days to process and refund.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Who pays for return shipping?</h3>
              <p className="text-gray-600 text-sm">
                We provide free return shipping for defective products. For other reasons, standard shipping charges apply.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Can I exchange instead of return?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can request an exchange for a different size or color instead of a refund.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">What if I received a damaged item?</h3>
              <p className="text-gray-600 text-sm">
                Contact us immediately within 48 hours of delivery. We'll arrange for a free replacement and refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Returns
