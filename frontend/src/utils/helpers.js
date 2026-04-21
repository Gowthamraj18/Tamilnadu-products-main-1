import { SHIPPING_COSTS, HANDLING_CHARGE } from './constants'

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export const calculateDiscount = (originalPrice, discountedPrice) => {
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100
  return Math.round(discount)
}

export const generateOrderId = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `TNP${timestamp}${random}`.toUpperCase()
}

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^[6-9]\d{9}$/
  return re.test(phone)
}

export const validatePincode = (pincode) => {
  const re = /^\d{6}$/
  return re.test(pincode)
}

/** Returns an error message string or null if the UPI VPA looks valid (e.g. name@paytm). */
export const validateUpiVpa = (vpa) => {
  const s = (vpa || '').trim()
  if (!s) return 'Enter your UPI ID'
  if (s.length > 256) return 'UPI ID is too long'
  if (!/^[\w.-]+@[\w.-]+$/.test(s)) {
    return 'Enter a valid UPI ID (e.g. yourname@paytm)'
  }
  return null
}

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

export const getStockStatus = (stock) => {
  // Handle stock as object (size-based) or number
  let totalStock = 0
  
  if (typeof stock === 'object' && stock !== null) {
    // Sum up all stock values for different sizes
    totalStock = Object.values(stock).reduce((sum, qty) => sum + qty, 0)
  } else {
    totalStock = stock || 0
  }
  
  if (totalStock === 0) return { status: 'out-of-stock', text: 'Out of Stock', color: 'red' }
  if (totalStock <= 5) return { status: 'low-stock', text: `Only ${totalStock} left`, color: 'yellow' }
  return { status: 'in-stock', text: 'In Stock', color: 'green' }
}

export const getTotalStock = (stock) => {
  if (typeof stock === 'object' && stock !== null) {
    return Object.values(stock).reduce((sum, qty) => sum + Number(qty || 0), 0)
  }
  return Number(stock || 0)
}

/** Short label for product cards / detail — shows exact count when possible. */
export const formatStockLabel = (stock) => {
  const n = getTotalStock(stock)
  if (n <= 0) return 'Out of stock'
  if (n <= 5) return `Only ${n} left`
  return `${n} in stock`
}

/** For cart line items: single-size stock number. */
export const formatAvailableLine = (qty) => {
  const n = Number(qty || 0)
  if (n <= 0) return 'None available'
  if (n === 1) return '1 available'
  return `${n} available`
}

export const calculateShipping = (subtotal, shippingMethod = 'standard') => {
  const shippingCosts = {
    standard: 50,
    express: 150,
    free: 0,
  }
  
  const shipping = shippingCosts[shippingMethod] || shippingCosts.standard
  
  // Free shipping for orders above 999
  if (subtotal >= 999) {
    return 0
  }
  
  return shipping
}

export const calculateHandlingCharge = (subtotal) => {
  const s = Number(subtotal)
  if (!Number.isFinite(s) || s <= 0) return 0
  return Number(HANDLING_CHARGE) || 0
}

export const calculateTotal = (subtotal, shipping = 0, handlingCharge = 0) => {
  return subtotal + shipping + handlingCharge
}

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  
  return new Date(date).toLocaleDateString('en-IN', { ...defaultOptions, ...options })
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getRelativeTime = (date) => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now - past) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(date)
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export const scrollToElement = (elementId) => {
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

export const getLocalStorageItem = (key, defaultValue = null) => {
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error getting localStorage item ${key}:`, error)
    return defaultValue
  }
}

export const setLocalStorageItem = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error)
    return false
  }
}

export const removeLocalStorageItem = (key) => {
  try {
    window.localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing localStorage item ${key}:`, error)
    return false
  }
}
