import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Grid, List, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import SkeletonLoader from '../components/SkeletonLoader'
import { useCart } from '../contexts/CartContext'
import { CATEGORIES, SIZES, COLORS } from '../utils/constants'
import { formatPrice } from '../utils/helpers'

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceRange: [0, 5000],
    size: '',
    color: '',
    sortBy: 'featured',
    search: searchParams.get('search') || ''
  })
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const { addToCart } = useCart()

  const handleAddToCart = (product) => {
    addToCart(product, 1, product.sizes?.[0] || 'M')
  }

  useEffect(() => {
    fetchProducts()
  }, [filters])

  useEffect(() => {
    // Update filters from URL params
    const newFilters = {
      category: searchParams.get('category') || '',
      priceRange: [0, parseInt(searchParams.get('maxPrice')) || 5000],
      size: searchParams.get('size') || '',
      color: searchParams.get('color') || '',
      sortBy: searchParams.get('sort') || 'featured',
      search: searchParams.get('search') || ''
    }
    setFilters(newFilters)
  }, [searchParams])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('page', '1')
      params.set('limit', '200')
      if (filters.category) params.set('category', filters.category)
      if (filters.search) params.set('search', filters.search)
      if (filters.sortBy) params.set('sort', filters.sortBy)
      if (filters.size) params.set('size', filters.size)
      if (filters.color) params.set('color', filters.color)
      if (filters.priceRange[0] > 0) params.set('minPrice', String(filters.priceRange[0]))
      if (filters.priceRange[1] < 5000) params.set('maxPrice', String(filters.priceRange[1]))

      const res = await fetch(`/api/products?${params.toString()}`)
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error || 'Failed to load products')
      }
      setProducts(json.data?.products || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Update URL params
    const params = new URLSearchParams()
    if (updatedFilters.category) params.append('category', updatedFilters.category)
    if (updatedFilters.search) params.append('search', updatedFilters.search)
    if (updatedFilters.sortBy !== 'featured') params.append('sort', updatedFilters.sortBy)
    if (updatedFilters.size) params.append('size', updatedFilters.size)
    if (updatedFilters.color) params.append('color', updatedFilters.color)
    if (updatedFilters.priceRange[1] < 5000) params.append('maxPrice', updatedFilters.priceRange[1])
    
    setSearchParams(params)
  }

  const clearFilters = () => {
    const defaultFilters = {
      category: '',
      priceRange: [0, 5000],
      size: '',
      color: '',
      sortBy: 'featured',
      search: ''
    }
    setFilters(defaultFilters)
    setSearchParams('')
  }

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' }
  ]

  const activeFiltersCount = [
    filters.category,
    filters.size,
    filters.color,
    filters.search,
    filters.priceRange[1] < 5000 ? 'price' : ''
  ].filter(Boolean).length

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="shop-gradient shop-bg text-gray-900 py-16 relative overflow-hidden" style={{backgroundImage: 'url(/images/shop-background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-8 max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{textShadow: '3px 3px 10px rgba(0,0,0,0.95)'}}>
                Shop Our Collection
              </h1>
              <p className="text-xl text-white max-w-3xl mx-auto" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.95)'}}>
                Discover premium Tamil Nadu fashion that celebrates culture and craftsmanship
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop</h1>
          <p className="text-gray-600">
            Discover our premium collection of Tamil Nadu fashion
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <div className="flex items-center space-x-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Size Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <select
                  value={filters.size}
                  onChange={(e) => updateFilters({ size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Sizes</option>
                  {SIZES.map(size => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Color Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <select
                  value={filters.color}
                  onChange={(e) => updateFilters({ color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Colors</option>
                  {COLORS.map(color => (
                    <option key={color.name} value={color.name}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price: {formatPrice(filters.priceRange[1])}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilters({ priceRange: [filters.priceRange[0], parseInt(e.target.value)] })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹0</span>
                  <span>₹5000</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${products.length} products found`}
          </p>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}>
            <SkeletonLoader type={viewMode === 'grid' ? 'product' : 'card'} count={8} />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{products.length}</span> products
            </p>
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
        
        {products.length > 0 && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}>
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop
