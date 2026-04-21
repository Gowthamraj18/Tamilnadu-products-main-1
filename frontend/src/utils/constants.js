export const CATEGORIES = [
  { id: 't-shirts', name: 'T-Shirts', description: 'Premium quality T-shirts' },
  { id: 'casual-wear', name: 'Casual Wear', description: 'Comfortable casual clothing' },
]

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

export const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Navy', value: '#000080' },
  { name: 'Gray', value: '#808080' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#008000' },
  { name: 'Yellow', value: '#FFFF00' },
]

export const ORDER_STATUSES = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
}

export const PAYMENT_STATUSES = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
}

export const RETURN_REASONS = [
  'Wrong size',
  'Wrong color',
  'Defective product',
  'Not as described',
  'No longer needed',
  'Ordered by mistake',
  'Other',
]

export const SHIPPING_COSTS = {
  standard: 50,
  express: 150,
  free: 0,
}

// Handling charge (applied at checkout/cart)
export const HANDLING_CHARGE = 20

export const COMPANY_INFO = {
  name: 'AKL EXIM',
  address: '34, Mouna swamy Madam street, Villivakkam, Chennai, Tamilnadu, India. PIN code: 600049',
  email: 'info@aklexim.com',
  supportEmail: 'info@aklexim.com',
  phone: '+91 8838576652',
  website: 'www.aklexim.com',
}

export const SOCIAL_LINKS = [
  { name: 'Facebook', url: 'https://facebook.com/tamilnaduproducts', icon: 'facebook' },
  { name: 'Instagram', url: 'https://instagram.com/tamilnaduproducts', icon: 'instagram' },
  { name: 'Twitter', url: 'https://twitter.com/tamilnaduproducts', icon: 'twitter' },
  { name: 'LinkedIn', url: 'https://linkedin.com/company/aklexim', icon: 'linkedin' },
]

export const NAVIGATION_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Track Order', href: '/track-order' },
  { name: 'Replace & Refunds', href: '/replace-refunds' },
]

export const ADMIN_NAVIGATION = [
  { name: 'Dashboard', href: '/admin', icon: 'layout-dashboard' },
  { name: 'Products', href: '/admin/products', icon: 'package' },
  { name: 'Orders', href: '/admin/orders', icon: 'shopping-cart' },
  { name: 'Customers', href: '/admin/customers', icon: 'users' },
  { name: 'Returns', href: '/admin/returns', icon: 'rotate-ccw' },
  { name: 'Settings', href: '/admin/settings', icon: 'settings' },
]
