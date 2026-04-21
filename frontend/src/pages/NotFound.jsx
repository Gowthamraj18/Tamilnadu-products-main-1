import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* 404 Number */}
          <div className="text-9xl font-bold text-primary-600 mb-4">404</div>
          
          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved.
            Let's get you back to shopping for amazing Tamil Nadu fashion!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Home className="h-5 w-5" />
              <span>Go Home</span>
            </Link>
            
            <Link
              to="/shop"
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Browse Products</span>
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Looking for something specific?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Popular Pages</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link to="/shop" className="text-primary-600 hover:text-primary-700">
                        Shop All Products
                      </Link>
                    </li>
                    <li>
                      <Link to="/about" className="text-primary-600 hover:text-primary-700">
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link to="/contact" className="text-primary-600 hover:text-primary-700">
                        Contact Support
                      </Link>
                    </li>
                    <li>
                      <Link to="/track-order" className="text-primary-600 hover:text-primary-700">
                        Track Order
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link to="/replace-refunds" className="text-primary-600 hover:text-primary-700">
                        Replace & Refunds
                      </Link>
                    </li>
                    <li>
                      <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                        Terms & Conditions
                      </Link>
                    </li>
                    <li>
                      <a
                        href="mailto:support@tamilnaduproducts.com"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Email Support
                      </a>
                    </li>
                    <li>
                      <a
                        href="tel:+919876543210"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Call: +91 98765 43210
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
