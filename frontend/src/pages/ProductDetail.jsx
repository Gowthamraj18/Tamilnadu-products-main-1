import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Truck, 
  Shield, 
  RefreshCw,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { formatPrice, formatStockLabel, getStockStatus, getTotalStock, copyToClipboard } from '../utils/helpers'
import { AKL_PRODUCTS } from '../data/products'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showShareNotification, setShowShareNotification] = useState(false)
  const { addToCart } = useCart()

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`)
      const json = await res.json()
      if (res.ok && json.success && json.data) {
        const p = json.data
        setProduct(p)
        const sizes = Array.isArray(p.sizes) ? p.sizes : []
        setSelectedSize(sizes[0] || 'M')
        setError(null)
        return
      }
      const foundProduct = AKL_PRODUCTS.find((p) => String(p._id) === String(id))
      if (foundProduct) {
        setProduct(foundProduct)
        if (foundProduct.sizes?.length) {
          setSelectedSize(foundProduct.sizes[0])
        }
        setError(null)
      } else {
        setError('Product not found')
        setProduct(null)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Failed to load product')
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size')
      return
    }
    
    addToCart(product, quantity, selectedSize)
  }

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('Please select a size')
      return
    }
    addToCart(product, quantity, selectedSize)
    navigate('/shipping-details')
  }

  const handleShare = async () => {
    const url = window.location.href
    const success = await copyToClipboard(url)
    if (success) {
      setShowShareNotification(true)
      setTimeout(() => setShowShareNotification(false), 2000)
    }
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
    const maxAllowed = Math.max(1, Math.min(stockLeft, 99))
    if (newQuantity >= 1 && newQuantity <= maxAllowed) {
      setQuantity(newQuantity)
    }
  }

  const handleImageChange = (direction) => {
    if (direction === 'next') {
      setSelectedImage((prev) => (prev + 1) % product.images.length)
    } else {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  const stockStatus = product ? getStockStatus(product.stock) : null
  const stockLeft = product ? getTotalStock(product.stock) : 0

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
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
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link to="/" className="hover:text-primary-600">Home</Link></li>
            <li>/</li>
            <li><Link to="/shop" className="hover:text-primary-600">Shop</Link></li>
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
              {product.images[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
              
              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageChange('prev')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleImageChange('next')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              
              {/* Stock Badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                stockStatus.status === 'out-of-stock'
                  ? 'bg-red-100 text-red-700'
                  : stockStatus.status === 'low-stock'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {stockStatus.text}
              </div>
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                      selectedImage === index
                        ? 'border-primary-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Name and Category */}
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                {product.category}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating || 0} ({product.reviews || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                </div>
              )}
            </div>
            <div
              className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                stockLeft <= 0
                  ? 'bg-red-50 text-red-800 border border-red-100'
                  : stockLeft <= 5
                  ? 'bg-amber-50 text-amber-900 border border-amber-100'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-100'
              }`}
            >
              {formatStockLabel(product.stock)}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {(product.sizes?.length ? product.sizes : ['M']).map((size) => {
                  const isAvailable = product.isSizeAvailable?.(size) || true
                  return (
                    <button
                      key={size}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        selectedSize === size
                          ? 'bg-primary-600 text-white'
                          : isAvailable
                          ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-16 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= Math.max(1, Math.min(stockLeft, 99))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={stockStatus.status === 'out-of-stock' || !selectedSize}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>
                  {stockStatus.status === 'out-of-stock' 
                    ? 'Out of Stock' 
                    : 'Add to Cart'
                  }
                </span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={stockStatus.status === 'out-of-stock' || !selectedSize}
                className="w-full border-2 border-primary-600 text-primary-700 font-medium py-3 px-6 rounded-lg hover:bg-primary-50 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Zap className="h-5 w-5" />
                <span>Buy now</span>
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Product Features */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-primary-600" />
                <span className="text-sm text-gray-600">Free shipping on orders above ₹999</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-primary-600" />
                <span className="text-sm text-gray-600">100% authentic products</span>
              </div>
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-5 w-5 text-primary-600" />
                <span className="text-sm text-gray-600">7-day return policy</span>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {product.specifications.material && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Material:</span>
                      <span className="font-medium">{product.specifications.material}</span>
                    </div>
                  )}
                  {product.specifications.fit && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fit:</span>
                      <span className="font-medium capitalize">{product.specifications.fit}</span>
                    </div>
                  )}
                  {product.specifications.care && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Care:</span>
                      <span className="font-medium">{product.specifications.care}</span>
                    </div>
                  )}
                  {product.specifications.origin && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Origin:</span>
                      <span className="font-medium">{product.specifications.origin}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Share Notification */}
        {showShareNotification && (
          <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
            Link copied to clipboard!
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail
