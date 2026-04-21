import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import About from './pages/About'
import Contact from './pages/Contact'
import OrderTracking from './pages/OrderTracking'
import Returns from './pages/Returns'
import TermsConditions from './pages/TermsConditions'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import Wishlist from './pages/Wishlist'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import StaffLogin from './pages/StaffLogin'
import NotFound from './pages/NotFound'
import PaymentPage from './pages/PaymentPage'
import DeliveryUpdatesPage from './pages/DeliveryUpdatesPage'
import ShippingDetailsPage from './pages/ShippingDetailsPage'
import OrderSuccess from './pages/OrderSuccess'

const STAFF_LOGIN_PATH = import.meta.env.VITE_STAFF_LOGIN_PATH || '/tamilnadu-products'

function CustomerShell() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="shipping-details" element={<ShippingDetailsPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="delivery-updates" element={<DeliveryUpdatesPage />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="track-order" element={<OrderTracking />} />
          <Route path="returns" element={<Navigate to="/replace-refunds" replace />} />
          <Route path="replace-refunds" element={<Returns />} />
          <Route path="terms" element={<TermsConditions />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path={STAFF_LOGIN_PATH} element={<StaffLogin />} />
          <Route path="/staff" element={<Navigate to="/login" replace />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/*" element={<CustomerShell />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
