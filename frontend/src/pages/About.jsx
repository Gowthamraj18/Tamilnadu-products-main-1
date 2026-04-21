import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Award, Users, Target, Heart } from 'lucide-react'
import imgPremiumTees from '../assets/about-showcase/akl-black-premium.jpg'
import imgCasualWear from '../assets/about-showcase/akl-polo-shirt.jpg'
import imgAccessories from '../assets/about-showcase/hero-banner.jpg'
import imgFallback from '../assets/about-showcase/placeholder-product.jpg'

const PRODUCT_SHOWCASE = [
  {
    image: imgPremiumTees,
    imageAlt: 'Premium cotton T-shirts',
    title: 'Premium T-Shirts',
    description:
      'High-quality cotton T-shirts with unique designs that celebrate Tamil culture and modern trends.',
    shopHref: '/shop?category=t-shirts',
  },
  {
    image: imgCasualWear,
    imageAlt: 'Casual wear collection',
    title: 'Casual Wear',
    description:
      'Comfortable and stylish casual wear perfect for everyday use, made with breathable fabrics.',
    shopHref: '/shop?category=casual-wear',
  },
  {
    image: imgAccessories,
    imageAlt: 'Fashion and accessories',
    title: 'Fashion Accessories',
    description:
      'Curated accessories that complement our clothing collection and complete your look.',
    shopHref: '/shop',
  },
]

const About = () => {
  const values = [
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Quality First',
      description: 'We never compromise on quality. Every product is carefully selected and tested to ensure it meets our high standards.'
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Customer Love',
      description: 'Our customers are at the heart of everything we do. We strive to provide the best shopping experience and support.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Community Focus',
      description: 'We believe in building a strong community of fashion lovers who appreciate quality and style.'
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Innovation Driven',
      description: 'We constantly innovate and improve our products and services to stay ahead of fashion trends.'
    }
  ]

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="about-gradient about-bg text-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-300/80 via-emerald-200/80 to-lime-300/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-overlay-gradient rounded-2xl p-8 max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About Tamil Nadu Products</h1>
              <p className="text-xl text-gray-800 max-w-3xl mx-auto">
                Celebrating the rich heritage and craftsmanship of Tamil Nadu through premium fashion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About US</h2>
              <div className="space-y-4 text-gray-600">
                <p className="leading-relaxed">
                  Our Tamil Nadu T-shirt collection celebrates the rich culture, heritage and vibrant spirit of the region. Each design reflects local pride, traditions and modern style, making it perfect for those who love to express their identity through fashion. Crafted with quality fabrics and unique prints, our T-shirts combine comfort with meaningful design. Whether you're looking for casual wear or cultural expression, our collection brings Tamil Nadu closer to your everyday style.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-2xl h-96 overflow-hidden">
              <img 
                src="/images/About AKL_ quality clothing and fabrics.png" 
                alt="Our Story - Tamil Nadu Products" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/placeholder-product.jpg";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-6">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To make premium Tamil Nadu fashion accessible to every Indian while supporting local artisans and preserving traditional craftsmanship. We strive to create fashion that tells a story and celebrates our cultural heritage.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-6">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become India's most trusted destination for authentic Tamil Nadu fashion, known for our commitment to quality, sustainability, and customer satisfaction. We aim to put Tamil Nadu on the global fashion map.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Products</h2>
            <p className="text-gray-600">Crafted with care, designed for you</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {PRODUCT_SHOWCASE.map((item) => (
              <div key={item.title} className="text-center">
                <Link
                  to={item.shopHref}
                  className="group block overflow-hidden rounded-2xl bg-gray-200 shadow-md ring-1 ring-gray-200/80 transition hover:ring-primary-300 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden sm:min-h-[200px]">
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      width={800}
                      height={600}
                      decoding="async"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = imgFallback
                      }}
                    />
                  </div>
                </Link>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.description}</p>
                <Link
                  to={item.shopHref}
                  className="mt-3 inline-block text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  Shop this category →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">What makes Tamil Nadu Products special</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-blue-200 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">Authentic Quality</h3>
              <p className="text-gray-600 leading-relaxed">
                Every product is authentic and made with the finest materials, ensuring durability and comfort.
              </p>
            </div>
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-green-200 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">Artisan Support</h3>
              <p className="text-gray-600 leading-relaxed">
                We work directly with local artisans, ensuring fair wages and preserving traditional crafts.
              </p>
            </div>
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-purple-200 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">Modern Designs</h3>
              <p className="text-gray-600 leading-relaxed">
                Our designs blend traditional elements with contemporary fashion trends for a unique look.
              </p>
            </div>
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-orange-200 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300">Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">
                Quick and reliable delivery across India with real-time tracking and updates.
              </p>
            </div>
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-teal-200 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-teal-600 transition-colors duration-300">Easy Returns</h3>
              <p className="text-gray-600 leading-relaxed">
                Hassle-free 7-day return policy with customer-friendly terms and conditions.
              </p>
            </div>
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-red-200 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors duration-300">24/7 Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Round-the-clock customer support to help you with any queries or concerns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Contact Information</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Have questions about our products or want to learn more about our story? We'd love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a
              href="mailto:info@aklexim.com"
              className="flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors duration-200"
            >
              <Mail className="h-5 w-5" />
              <span>Email Us</span>
            </a>
            <a
              href="tel:+918838576652"
              className="flex items-center space-x-2 border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              <Phone className="h-5 w-5" />
              <span>Call Us</span>
            </a>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>34, Mouna swamy Madam street, Villivakkam. Chennai. Tamilnadu. India. PIN code: 600049</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
