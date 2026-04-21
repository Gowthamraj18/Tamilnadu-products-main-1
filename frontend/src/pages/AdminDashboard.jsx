import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  DollarSign,
  Package,
  Menu,
  X,
  LogOut,
  Home,
  ShoppingCart,
  Eye,
  Truck,
  Loader2,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { formatStockLabel } from '../utils/helpers'

const LIST_LIMIT = 200

/** Matches backend valid_progressions (single next step for UI). */
const NEXT_STATUS = {
  ordered: { value: 'shipped', label: 'Shipped — assign tracking' },
  confirmed: { value: 'shipped', label: 'Shipped — assign tracking' },
  shipped: { value: 'out-for-delivery', label: 'Out for delivery' },
  'out-for-delivery': { value: 'delivered', label: 'Delivered' },
}

const STAFF_LOGIN_PATH = import.meta.env.VITE_STAFF_LOGIN_PATH || '/tamilnadu-products'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    orders: [],
    products: [],
    customers: [],
    loading: true,
  })
  const [deliveryModal, setDeliveryModal] = useState(null)
  const [deliveryNote, setDeliveryNote] = useState('')
  const [orderUpdating, setOrderUpdating] = useState(false)
  const [productCreating, setProductCreating] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [stockSavingId, setStockSavingId] = useState(null)
  const [stockInputs, setStockInputs] = useState({})
  const [priceInputs, setPriceInputs] = useState({})
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '0',
    image: '',
  })

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  })

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const h = { Authorization: `Bearer ${token}` }

      const [overviewRes, ordersRes, productsRes, customersRes] = await Promise.all([
        fetch('/api/admin/dashboard', { headers: h }),
        fetch(`/api/admin/orders?limit=${LIST_LIMIT}`, { headers: h }),
        fetch(`/api/admin/products?limit=${LIST_LIMIT}`, { headers: h }),
        fetch(`/api/admin/customers?limit=${LIST_LIMIT}`, { headers: h }),
      ])

      const overviewData = await overviewRes.json()
      const ordersData = await ordersRes.json()
      const productsData = await productsRes.json()
      const customersData = await customersRes.json()

      const orders = ordersData.data?.orders || []
      const products = productsData.data?.products || []

      const stockMap = {}
      const priceMap = {}
      products.forEach((p) => {
        stockMap[p._id] = String(p.stock ?? 0)
        priceMap[p._id] = String(p.price ?? 0)
      })

      setStockInputs(stockMap)
      setPriceInputs(priceMap)
      setDashboardData({
        overview: overviewData.data?.overview || {},
        orders,
        products,
        customers: customersData.data?.customers || [],
        loading: false,
      })
    } catch (error) {
      console.error('Dashboard error:', error)
      setDashboardData((prev) => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleLogout = () => {
    logout()
    navigate(STAFF_LOGIN_PATH, { replace: true })
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price)

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  const formatDateTime = (dateString) => {
    if (!dateString) return '—'
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch {
      return '—'
    }
  }

  const openDeliveryModal = (order) => {
    setDeliveryModal(order)
    setDeliveryNote('')
  }

  const submitDeliveryUpdate = async () => {
    if (!deliveryModal) return
    const next = NEXT_STATUS[deliveryModal.status]
    if (!next) return

    setOrderUpdating(true)
    try {
      const res = await fetch(`/api/orders/update-order/${encodeURIComponent(deliveryModal.orderId)}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          status: next.value,
          note: deliveryNote.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        alert(data.message || data.error || 'Update failed')
        return
      }
      setDeliveryModal(null)
      await fetchDashboardData()
    } catch (e) {
      console.error(e)
      alert('Network error')
    } finally {
      setOrderUpdating(false)
    }
  }

  const saveProductStock = async (productId) => {
    const rawStock = stockInputs[productId]
    const rawPrice = priceInputs[productId]
    const n = parseInt(String(rawStock).trim(), 10)
    const price = Number.parseFloat(String(rawPrice).trim())
    if (Number.isNaN(n) || n < 0 || Number.isNaN(price) || price < 0) {
      alert('Enter valid stock and price values (0 or more)')
      return
    }
    setStockSavingId(productId)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ stock: n, price }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        alert(data.message || data.error || 'Could not update stock')
        return
      }
      await fetchDashboardData()
    } catch (e) {
      console.error(e)
      alert('Network error')
    } finally {
      setStockSavingId(null)
    }
  }

  const createProduct = async () => {
    const name = newProduct.name.trim()
    const description = newProduct.description.trim()
    const category = newProduct.category.trim()
    const price = Number.parseFloat(newProduct.price)
    const stock = parseInt(newProduct.stock, 10)
    const image = newProduct.image.trim()

    if (!name || !category || Number.isNaN(price) || price < 0 || Number.isNaN(stock) || stock < 0) {
      alert('Name, category, valid price, and valid stock are required')
      return
    }

    setProductCreating(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name, description, category, price, stock, image }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        alert(data.message || data.error || 'Could not create product')
        return
      }
      setNewProduct({ name: '', description: '', category: '', price: '', stock: '0', image: '' })
      await fetchDashboardData()
    } catch (e) {
      console.error(e)
      alert('Network error')
    } finally {
      setProductCreating(false)
    }
  }

  const uploadProductImage = async (file) => {
    if (!file) return
    setImageUploading(true)
    try {
      const form = new FormData()
      form.append('image', file)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        alert(data.message || data.error || 'Could not upload image')
        return
      }
      const imageUrl = data.data?.url || ''
      setNewProduct((prev) => ({ ...prev, image: imageUrl }))
    } catch (e) {
      console.error(e)
      alert('Image upload failed')
    } finally {
      setImageUploading(false)
    }
  }

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'orders', label: 'Orders & delivery', icon: ShoppingCart },
    { id: 'products', label: 'Stock / products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
  ]

  if (dashboardData.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4 pb-24">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="absolute bottom-8 left-4 right-4">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      <div className="flex-1 lg:ml-64">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
                <Menu className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {menuItems.find((item) => item.id === activeTab)?.label}
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Welcome,</span>
              <span className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Products</p>
                      <p className="text-3xl font-bold">{dashboardData.overview.totalProducts || 0}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Orders</p>
                      <p className="text-3xl font-bold">{dashboardData.overview.totalOrders || 0}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Customers</p>
                      <p className="text-3xl font-bold">{dashboardData.overview.totalCustomers || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Total Revenue</p>
                      <p className="text-3xl font-bold">{formatPrice(dashboardData.overview.totalRevenue || 0)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-orange-200" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.orders.slice(0, 8).map((order) => (
                        <tr key={order._id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.orderId}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {order.shippingAddress?.fullName || order.customer?.firstName || '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(order.total)}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                              {(order.status || '').replace(/-/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-4">
                View bookings and move each order through delivery: <strong>Shipped</strong> →{' '}
                <strong>Out for delivery</strong> → <strong>Delivered</strong>. Tracking is generated when you mark an
                order shipped.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. delivery</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dashboardData.orders.map((order) => {
                      const canAdvance = !!NEXT_STATUS[order.status]
                      return (
                        <tr key={order._id}>
                          <td className="px-3 py-3 font-mono text-xs font-semibold text-gray-900">{order.orderId}</td>
                          <td className="px-3 py-3 text-gray-700">
                            {order.shippingAddress?.fullName || order.customer?.firstName || '—'}
                            <div className="text-xs text-gray-500">{order.shippingAddress?.phone || ''}</div>
                          </td>
                          <td className="px-3 py-3">{formatPrice(order.total)}</td>
                          <td className="px-3 py-3 capitalize text-gray-800">
                            {(order.status || '').replace(/-/g, ' ')}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs">{order.trackingNumber || '—'}</td>
                          <td className="px-3 py-3 text-xs text-gray-600">{formatDateTime(order.estimatedDelivery)}</td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() => openDeliveryModal(order)}
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100"
                            >
                              {canAdvance ? (
                                <>
                                  <Truck className="h-3.5 w-3.5" />
                                  Update delivery
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3.5 w-3.5" />
                                  View
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-4">
                Add products and set <strong>stock</strong> here. Customers see how many units are left on the shop,
                cart, and product page; stock decreases when payment is confirmed. Use low-stock hints to reorder inventory.
              </p>
              <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <input
                  type="text"
                  placeholder="Product name"
                  className="rounded border border-gray-300 px-3 py-2 text-sm md:col-span-2"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Category"
                  className="rounded border border-gray-300 px-3 py-2 text-sm"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Price"
                  className="rounded border border-gray-300 px-3 py-2 text-sm"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Stock"
                  className="rounded border border-gray-300 px-3 py-2 text-sm"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, stock: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Image URL (optional)"
                  className="rounded border border-gray-300 px-3 py-2 text-sm md:col-span-2"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, image: e.target.value }))}
                />
                <div className="md:col-span-2">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
                    onChange={(e) => uploadProductImage(e.target.files?.[0])}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {imageUploading ? 'Uploading image...' : 'Upload from system (JPG, PNG, WEBP).'}
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Description (optional)"
                  className="rounded border border-gray-300 px-3 py-2 text-sm md:col-span-3"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                />
                <div className="md:col-span-1">
                  <button
                    type="button"
                    onClick={createProduct}
                    disabled={productCreating}
                    className="h-full w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {productCreating ? 'Adding…' : 'Add product'}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Stock left
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Save</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dashboardData.products.map((product) => (
                      <tr key={product._id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images?.[0] || '/images/placeholder-product.jpg'}
                              alt=""
                              className="h-12 w-12 rounded-lg object-cover bg-gray-100"
                            />
                            <div>
                              <div className="font-medium text-gray-900 line-clamp-2">{product.name}</div>
                              <div className="text-xs text-gray-500">ID {product._id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            className="w-28 rounded border border-gray-300 px-2 py-1.5 text-sm"
                            value={priceInputs[product._id] ?? String(product.price ?? 0)}
                            onChange={(e) =>
                              setPriceInputs((prev) => ({ ...prev, [product._id]: e.target.value }))
                            }
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                Number(product.stock ?? 0) <= 0
                                  ? 'bg-red-100 text-red-800'
                                  : Number(product.stock ?? 0) <= 5
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-900'
                              }`}
                            >
                              {formatStockLabel(product.stock)}
                            </span>
                            {Number(product.stock ?? 0) > 0 && Number(product.stock ?? 0) <= 5 && (
                              <span className="text-xs font-medium text-amber-800">Reorder inventory</span>
                            )}
                          </div>
                          <label className="sr-only" htmlFor={`stock-${product._id}`}>
                            Update stock quantity
                          </label>
                          <input
                            id={`stock-${product._id}`}
                            type="number"
                            min={0}
                            className="w-24 rounded border border-gray-300 px-2 py-1.5 text-sm"
                            value={stockInputs[product._id] ?? String(product.stock ?? 0)}
                            onChange={(e) =>
                              setStockInputs((prev) => ({ ...prev, [product._id]: e.target.value }))
                            }
                          />
                          <p className="mt-1 text-xs text-gray-500">Shown to customers as “available” quantity.</p>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => saveProductStock(product._id)}
                            disabled={stockSavingId === product._id}
                            className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                          >
                            {stockSavingId === product._id ? (
                              <Loader2 className="h-4 w-4 animate-spin inline" />
                            ) : (
                              'Save'
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.customers.map((customer) => (
                      <tr key={customer._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(customer.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {deliveryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Order {deliveryModal.orderId}</h3>
            <p className="mt-1 text-sm text-gray-600 capitalize">
              Current: {(deliveryModal.status || '').replace(/-/g, ' ')}
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Tracking:</span>{' '}
                <span className="font-mono">{deliveryModal.trackingNumber || '— (assigned when shipped)'}</span>
              </p>
              <p>
                <span className="text-gray-500">Est. delivery:</span> {formatDateTime(deliveryModal.estimatedDelivery)}
              </p>
              <p>
                <span className="text-gray-500">Payment:</span> {deliveryModal.paymentStatus} / {deliveryModal.paymentMethod}
              </p>
            </div>

            {NEXT_STATUS[deliveryModal.status] ? (
              <>
                <p className="mt-4 text-sm font-medium text-gray-800">
                  Next step: {NEXT_STATUS[deliveryModal.status].label}
                </p>
                <label className="mt-2 block text-xs font-medium text-gray-600">Note (optional)</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  rows={2}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="e.g. Handed to courier, expected delivery Tuesday"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={submitDeliveryUpdate}
                    disabled={orderUpdating}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {orderUpdating ? 'Saving…' : 'Confirm update'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryModal(null)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-gray-600">No further delivery updates (delivered or unknown status).</p>
                <button
                  type="button"
                  onClick={() => setDeliveryModal(null)}
                  className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
