import axios from 'axios'

/**
 * Create order via FastAPI (requires Bearer token).
 */
export async function createOrder(orderData) {
  const token = localStorage.getItem('token')
  try {
    const res = await axios.post('/api/orders/create-order', orderData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const d = res.data
    if (!d.success) {
      const msg = d.message || d.error || 'Order failed'
      throw new Error(msg)
    }
    return {
      success: true,
      orderId: d.data.orderId,
      status: d.data.status,
      total: d.data.total,
      createdAt: d.data.createdAt,
    }
  } catch (e) {
    const status = e.response?.status
    const msg = e.response?.data?.error || e.response?.data?.message
    if (status === 401) {
      throw new Error(
        msg || 'Not signed in or session expired. Sign out, sign in again, then retry checkout.'
      )
    }
    throw new Error(msg || e.message || 'Order failed')
  }
}
