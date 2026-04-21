import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useCart } from '../contexts/CartContext'
import { formatPrice } from '../utils/helpers'
import {
  ShoppingBag,
  Star,
  Truck,
  Shield,
  RotateCcw,
  IndianRupee,
  ArrowRight,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import SkeletonLoader from '../components/SkeletonLoader'
import { CATEGORIES } from '../utils/constants'
import { AKL_PRODUCTS } from '../data/products'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const scrollerRef = useRef(null)
  const { addToCart } = useCart()

  const handleAddToCart = (product) => {
    addToCart(product, 1, product.sizes?.[0] || 'M')
  }

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/products?featured=true&page=1&limit=8')
      const json = await res.json()
      if (res.ok && json.success && json.data?.products?.length) {
        setFeaturedProducts(json.data.products)
        setError(null)
      } else {
        const featured = AKL_PRODUCTS.filter((product) => product.featured).slice(0, 4)
        setFeaturedProducts(featured)
        setError(null)
      }
    } catch (error) {
      console.error('Error fetching featured products:', error)
      const featured = AKL_PRODUCTS.filter((product) => product.featured).slice(0, 4)
      setFeaturedProducts(featured)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-white" strokeWidth={1.75} />,
      title: 'Premium Quality',
      description: 'Authentic products with careful quality checks before dispatch.',
    },
    {
      icon: <Truck className="h-6 w-6 text-white" strokeWidth={1.75} />,
      title: 'Free Shipping',
      description: 'Free delivery on orders above ₹999—track every shipment.',
    },
    {
      icon: <RotateCcw className="h-6 w-6 text-white" strokeWidth={1.75} />,
      title: 'Easy Returns',
      description: 'Simple 7-day return policy when items meet return conditions.',
    },
    {
      icon: <IndianRupee className="h-6 w-6 text-white" strokeWidth={1.75} />,
      title: 'Secure Payment',
      description: 'Encrypted checkout with trusted payment partners including UPI & cards.',
    },
  ]

  const heroSlides = useMemo(() => {
    const ids = new Set()
    const slides = []
    for (const p of featuredProducts) {
      if (p?.images?.[0] && !ids.has(p._id)) {
        ids.add(p._id)
        slides.push(p)
      }
    }
    for (const p of AKL_PRODUCTS) {
      if (slides.length >= 12) break
      if (p?.images?.[0] && !ids.has(p._id)) {
        ids.add(p._id)
        slides.push(p)
      }
    }
    if (!slides.length) {
      slides.push({
        _id: 'hero-fallback',
        name: 'Shop collection',
        images: ['/images/t-shirts/ORIGINALS S MUSTARD.jpeg'],
        price: 499,
      })
    }
    return slides
  }, [featuredProducts])

  const scrollToSlide = useCallback(
    (index) => {
      const el = scrollerRef.current
      if (!el || !heroSlides.length) return
      const clamped = Math.min(Math.max(0, index), heroSlides.length - 1)
      el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' })
      setActiveSlide(clamped)
    },
    [heroSlides.length]
  )

  const onCarouselScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el || !heroSlides.length) return
    const w = el.clientWidth || 1
    const i = Math.round(el.scrollLeft / w)
    setActiveSlide(Math.min(Math.max(0, i), heroSlides.length - 1))
  }, [heroSlides.length])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener('scroll', onCarouselScroll, { passive: true })
    return () => el.removeEventListener('scroll', onCarouselScroll)
  }, [onCarouselScroll])

  useEffect(() => {
    if (loading) return
    setActiveSlide(0)
    requestAnimationFrame(() => {
      const el = scrollerRef.current
      if (el) el.scrollLeft = 0
    })
  }, [loading])

  const firstSlide = heroSlides[0]
  const slideIndex = Math.min(activeSlide, Math.max(0, heroSlides.length - 1))
  const currentHero = heroSlides[slideIndex]

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        {/* Hero Skeleton */}
        <div className="relative min-h-[70vh] bg-gray-950 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-primary-900/30 animate-pulse" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="h-8 bg-white/10 rounded-full w-40 animate-pulse" />
                <div className="h-14 bg-white/10 rounded-xl w-full max-w-md animate-pulse" />
                <div className="h-20 bg-white/10 rounded-xl w-full animate-pulse" />
                <div className="h-14 bg-white/10 rounded-xl w-64 animate-pulse" />
              </div>
              <div className="lg:col-span-6 min-h-[22rem] sm:min-h-[26rem] lg:min-h-[32rem] bg-white/5 rounded-3xl animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Featured Products Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkeletonLoader type="product" count={4} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative isolate min-h-[calc(100vh-4rem)] lg:min-h-[min(88vh,50rem)] flex items-center overflow-hidden bg-gray-950">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: 'url(/images/home-background.jpg)',
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-950/92 to-primary-950/80"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(219,39,119,0.22),transparent)]"
          aria-hidden
        />
        <div
          className="absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-primary-600/20 blur-[100px]"
          aria-hidden
        />
        <div
          className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-peach-500/15 blur-[120px]"
          aria-hidden
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            <div className="lg:col-span-6 text-center lg:text-left space-y-7 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary-200 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary-300" />
                Tamil Nadu • Premium tees & apparel
              </div>

              <h1 className="font-display text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                Elevate your everyday{' '}
                <span className="bg-gradient-to-r from-peach-200 via-white to-primary-200 bg-clip-text text-transparent">
                  style
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Discover comfortable, high-quality T-shirts and casual wear—curated looks for work, weekends, and everything in between. Browse freely; sign in when you&apos;re ready to checkout.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Link
                  to="/shop"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-900/40 transition hover:bg-primary-500 hover:shadow-primary-600/30"
                >
                  <ShoppingBag className="h-5 w-5 opacity-90" />
                  Shop the collection
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 hover:border-white/30"
                >
                  <BookOpen className="h-4 w-4" />
                  Our story
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 pt-4 text-sm text-gray-400 border-t border-white/10 lg:border-0 lg:pt-2">
                <span className="inline-flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary-400" />
                  Fast delivery
                </span>
                <span className="inline-flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary-400" />
                  Secure checkout
                </span>
                {firstSlide && (
                  <span className="inline-flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400/30" />
                    From {formatPrice(firstSlide.price)}
                  </span>
                )}
              </div>
            </div>

            <div className="lg:col-span-6 relative mx-auto w-full max-w-lg lg:max-w-none animate-slide-up">
              <div
                className="absolute -inset-4 lg:-inset-6 rounded-[2rem] bg-gradient-to-tr from-primary-500/25 via-transparent to-peach-400/10 blur-2xl"
                aria-hidden
              />
              <div className="relative">
                <p className="mb-2 text-center lg:text-right text-[11px] sm:text-xs font-medium uppercase tracking-widest text-primary-200/90">
                  Swipe or use arrows — new drops
                </p>
                <div className="relative rounded-2xl lg:rounded-3xl border border-white/15 bg-gray-900/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.75)] ring-1 ring-white/10 backdrop-blur-sm overflow-hidden">
                  <div
                    ref={scrollerRef}
                    className="flex h-[min(58vh,22rem)] sm:h-[min(60vh,26rem)] lg:h-[min(62vh,30rem)] xl:h-[min(64vh,34rem)] overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    {heroSlides.map((product) => (
                      <div
                        key={product._id}
                        className="relative w-full min-w-full shrink-0 snap-center snap-always bg-gray-950"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover object-center select-none"
                          draggable={false}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/15 to-transparent" />
                      </div>
                    ))}
                  </div>

                  {heroSlides.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => scrollToSlide(slideIndex - 1)}
                        disabled={slideIndex <= 0}
                        className="absolute left-1.5 sm:left-3 top-1/2 z-20 flex -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2 text-white backdrop-blur-md transition hover:bg-black/70 disabled:opacity-30 sm:p-2.5"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollToSlide(slideIndex + 1)}
                        disabled={slideIndex >= heroSlides.length - 1}
                        className="absolute right-1.5 sm:right-3 top-1/2 z-20 flex -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2 text-white backdrop-blur-md transition hover:bg-black/70 disabled:opacity-30 sm:p-2.5"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                      </button>
                    </>
                  )}

                  {currentHero && (
                    <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-5">
                      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-md sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-primary-200">
                            {slideIndex + 1} / {heroSlides.length}
                          </p>
                          <p className="text-base font-semibold text-white sm:text-lg truncate">
                            {currentHero.name}
                          </p>
                          <p className="text-sm text-primary-100/90">
                            {formatPrice(currentHero.price)}
                          </p>
                        </div>
                        <Link
                          to={currentHero._id === 'hero-fallback' ? '/shop' : `/product/${currentHero._id}`}
                          className="shrink-0 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-lg transition hover:bg-gray-100"
                        >
                          {currentHero._id === 'hero-fallback' ? 'Browse shop' : 'View product'}
                        </Link>
                      </div>
                      {heroSlides.length > 1 && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                          {heroSlides.map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              aria-label={`Go to slide ${i + 1}`}
                              onClick={() => scrollToSlide(i)}
                              className={`h-2 rounded-full transition-all duration-300 ${
                                i === slideIndex
                                  ? 'w-9 bg-primary-400 shadow-[0_0_12px_rgba(244,114,182,0.7)]'
                                  : 'w-2 bg-white/35 hover:bg-white/55'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative overflow-hidden bg-gray-950 py-16 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url(/images/t-shirts/ORIGINALS S MUSTARD.jpeg)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-950/92 to-gray-950"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_-10%,rgba(219,39,119,0.14),transparent)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center md:mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary-200 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary-300" />
              Why choose us
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              The Tamil Nadu Products{' '}
              <span className="bg-gradient-to-r from-peach-200 via-white to-primary-200 bg-clip-text text-transparent">
                difference
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-gray-400">
              Quality, delivery, returns, and payments—everything we stand behind, in one place.
            </p>
          </div>

          <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-gray-500 md:hidden">
            Swipe for more
          </p>
          <div
            className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 pt-1 snap-x snap-mandatory scroll-smooth md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative min-w-[min(100%,17.5rem)] shrink-0 snap-center rounded-2xl border border-white/10 bg-gray-900/60 p-5 text-left shadow-lg shadow-black/20 backdrop-blur-md transition duration-300 hover:border-primary-500/35 hover:bg-gray-900/75 sm:min-w-[18rem] md:min-w-0"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-md shadow-primary-900/40 transition group-hover:scale-105">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our diverse collection of premium clothing categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {CATEGORIES.map((category, index) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="group card overflow-hidden hover-lift"
              >
                <div className="aspect-square relative overflow-hidden">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src={index === 0 ? "/images/t-shirts/ORIGINALS S MUSTARD.jpeg" : "/images/t-shirts/DJ&C M RED.jpeg"} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Dark overlay for text visibility */}
                    <div className="absolute inset-0 bg-black/40"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex items-center justify-center">
                    <div className="text-center space-y-6 p-8">
                      <div className="w-24 h-24 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-xl">
                        <span className="text-4xl font-bold text-gray-900">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-xl group-hover:text-yellow-300 transition-colors duration-300 drop-shadow-lg">
                          {category.name}
                        </h3>
                        <p className="text-white/90 mt-2 text-center drop-shadow-md">{category.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-gradient-to-b from-gray-50 via-white to-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Featured products
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              Handpicked pieces from our collection—add to cart and checkout when you&apos;re ready.
            </p>
          </div>
          
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchFeaturedProducts}
                className="mt-4 btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
          
          <div className="mt-12 flex justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-primary-600 bg-white px-6 py-3 text-base font-semibold text-primary-700 shadow-sm transition hover:bg-primary-50"
            >
              View all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gray-950 py-12 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(219,39,119,0.25),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-20 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-primary-600/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-peach-500/15 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-gray-900/65 px-6 py-10 text-center shadow-2xl shadow-black/40 backdrop-blur-md sm:px-10 sm:py-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary-200">
              <Sparkles className="h-3 w-3 text-primary-300" />
              Shop the look
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready for premium everyday fashion?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg">
              Quality fabrics, honest pricing, and delivery you can track. Step in—browse the full store whenever you like.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-900/40 transition hover:bg-primary-500"
              >
                Start shopping
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
