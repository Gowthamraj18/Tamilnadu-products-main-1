import { Shield, Users, Package, CreditCard, RefreshCw, Mail } from 'lucide-react'

const TermsConditions = () => {
  const sections = [
    {
      icon: <Package className="h-8 w-8" />,
      title: '1. General',
      content: [
        'All products listed on our website are subject to availability.',
        'We reserve the right to modify or discontinue any product without prior notice.'
      ]
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: '2. Product Information',
      content: [
        'We make every effort to display product colours, designs and sizes accurately.',
        'However, slight variations may occur due to screen settings or lighting conditions.'
      ]
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: '3. Pricing & Payments',
      content: [
        'All prices are listed in INR and may include shipping and handling charges as shown at checkout.',
        'We reserve the right to change prices at any time without prior notice.',
        'Orders will be processed only after successful payment.'
      ]
    },
    {
      icon: <RefreshCw className="h-8 w-8" />,
      title: '4. Orders & Acceptance',
      content: [
        'Once an order is placed, you will receive a confirmation.',
        'We reserve the right to cancel or refuse any order due to availability, errors in pricing, or any other reason.'
      ]
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: '5. Shipping & Delivery',
      content: [
        'Delivery timelines are estimates and may vary due to location or unforeseen circumstances.',
        'We are not responsible for delays caused by courier partners.'
      ]
    },
    {
      icon: <RefreshCw className="h-8 w-8" />,
      title: '6. Returns & Refunds',
      content: [
        'Returns and refunds are governed by our Returns & Refunds Policy.',
        'Please refer to that section for detailed information.'
      ]
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: '7. Customer Responsibility',
      content: [
        'Customers must provide accurate shipping details.',
        'We are not responsible for delivery issues arising from incorrect information provided.'
      ]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: '8. Intellectual Property',
      content: [
        'All content on this website, including images, logos and text, is property of our business and may not be used without permission.'
      ]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: '9. Limitation of Liability',
      content: [
        'We shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.'
      ]
    },
    {
      icon: <RefreshCw className="h-8 w-8" />,
      title: '10. Changes to Terms',
      content: [
        'We reserve the right to update or modify these terms at any time without prior notice.'
      ]
    },
    {
      icon: <Mail className="h-8 w-8" />,
      title: '11. Contact Information',
      content: [
        'For any questions or concerns, please contact us at:',
        'Phone: +91 8838576652',
        'Email: info@aklexim.com'
      ]
    }
  ]

  const prohibitedActivities = [
    'Using the website for fraudulent purposes',
    'Attempting to gain unauthorized access to our systems',
    'Interfering with the proper working of the website',
    'Posting or transmitting harmful or offensive content',
    'Violating any applicable laws or regulations',
    'Infringing on intellectual property rights',
    'Spamming or sending unsolicited communications',
    'Using automated tools to access the website'
  ]

  const limitationOfLiability = [
    'Our liability is limited to the purchase price of the product',
    'We are not liable for indirect, incidental, or consequential damages',
    'We do not guarantee uninterrupted or error-free website operation',
    'We are not responsible for third-party website links',
    'Our liability does not exceed the amount paid by you',
    'These limitations apply to the fullest extent permitted by law'
  ]

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms & Conditions</h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Please read these terms carefully before using our services
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed mb-4">
              Welcome to Tamil Nadu Products! These Terms & Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Main Terms Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 flex-shrink-0">
                  {section.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-2">
                    <span className="text-primary-600 mt-1">•</span>
                    <span className="text-gray-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Prohibited Activities */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Prohibited Activities</h3>
          <p className="text-gray-600 mb-4">
            You agree not to engage in any of the following activities while using our website:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prohibitedActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-red-600 mt-1">•</span>
                <span className="text-gray-700 text-sm">{activity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Limitation of Liability</h3>
          <div className="space-y-3">
            {limitationOfLiability.map((item, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Governing Law */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Governing Law & Jurisdiction</h3>
          <div className="space-y-4 text-gray-600">
            <p>
              These Terms & Conditions shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising from or relating to these terms shall be subject to the exclusive jurisdiction of the courts located in Tamil Nadu, India.
            </p>
            <p>
              If any provision of these terms is found to be unenforceable, the remaining provisions shall continue to be valid and enforceable.
            </p>
          </div>
        </div>

        {/* Changes to Terms */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Changes to Terms & Conditions</h3>
          <div className="space-y-4 text-gray-600">
            <p>
              We reserve the right to modify these Terms & Conditions at any time. Changes will be effective immediately upon posting on our website.
            </p>
            <p>
              Your continued use of our website after any changes constitutes acceptance of the modified terms.
            </p>
            <p>
              We will notify users of significant changes via email or website notifications.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
          <div className="space-y-4 text-gray-600">
            <p>
              <strong>Email address:</strong> info@aklexim.com
            </p>
            <p>
              <strong>Location:</strong> 34, Mouna swamy Madam street, Villivakkam. Chennai. Tamilnadu. India. PIN code: 600049
            </p>
            <p>
              For any questions or concerns about these terms, please contact us using the above information.
            </p>
          </div>
        </div>

        {/* Acceptance */}
        <div className="mt-12 text-center">
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Acknowledgment & Acceptance</h3>
            <p className="text-gray-600">
              By using Tamil Nadu Products website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsConditions
