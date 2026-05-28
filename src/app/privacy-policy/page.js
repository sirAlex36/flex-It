'use client';

import { useState } from 'react';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const sections = [
    {
      id: 1,
      title: '1. Introduction',
      content: `Flex-It is an event management and ticket booking platform that allows users to:
      • Browse events
      • Purchase tickets
      • Receive digital confirmations
      • Manage bookings
      • Make secure payments
      
      By using Flex-It, you agree to the collection and use of information in accordance with this policy. Your privacy and data security are important to us.`
    },
    {
      id: 2,
      title: '2. Information We Collect',
      content: `Personal Information:
      When users create an account or book tickets, we may collect:
      • Full name
      • Email address
      • Phone number
      • Account credentials
      • Billing and payment details
      
      Event & Booking Information:
      We collect:
      • Event selections
      • Ticket purchases
      • Booking history
      • Payment transaction references
      
      Technical Information:
      We may automatically collect:
      • IP address
      • Browser type
      • Device information
      • Login activity
      • Session information
      
      Cookies & Authentication:
      Flex-It may use cookies or secure tokens for:
      • User authentication
      • Session management
      • Security purposes
      • Improving user experience`
    },
    {
      id: 3,
      title: '3. How We Use Your Information',
      content: `We use collected information to:
      • Create and manage user accounts
      • Process event bookings and payments
      • Generate digital tickets
      • Send booking confirmations and notifications
      • Improve platform performance
      • Prevent fraud and unauthorized access
      • Provide customer support
      • Comply with legal and regulatory obligations`
    },
    {
      id: 4,
      title: '4. Payment Processing',
      content: `Payments made through Flex-It may be processed through third-party payment providers such as:
      • M-Pesa
      
      Important Information:
      • Flex-It does not store full card information on its servers
      • Payment providers may process data according to their own privacy policies
      • All payment data is encrypted and transmitted securely
      • We comply with PCI Data Security Standard (PCI DSS) requirements
      • Transaction records are maintained for audit and compliance purposes`
    },
    {
      id: 5,
      title: '5. Data Security',
      content: `We implement reasonable security measures to protect user information, including:
      • Password hashing and encryption
      • Secure authentication using JWT tokens
      • HTTPS secure communication
      • Rate limiting and abuse prevention
      • Restricted administrative access
      • Regular security audits and testing
      • Encryption of sensitive data at rest and in transit
      
      However, no online platform can guarantee absolute security. We encourage users to maintain strong passwords and protect their account credentials.`
    },
    {
      id: 6,
      title: '6. Sharing of Information',
      content: `Flex-It does not sell personal information.
      
      We may share information only:
      • With payment providers to process transactions
      • When required by law or legal process
      • To protect platform security and prevent fraud
      • With authorized event organizers where necessary
      • With our service providers under confidentiality agreements
      • In case of business transfer or acquisition (with notice)`
    },
    {
      id: 7,
      title: '7. Data Retention',
      content: `We retain user information only for as long as necessary to:
      • Provide services
      • Meet legal obligations
      • Resolve disputes
      • Maintain transaction records
      • Enforce agreements
      
      Users may request deletion of their accounts subject to applicable legal or operational requirements. Some data may be retained for compliance and audit purposes even after account deletion.`
    },
    {
      id: 8,
      title: '8. User Rights',
      content: `Users may have the right to:
      • Access personal data we hold about you
      • Request correction of inaccurate information
      • Request deletion of account information
      • Withdraw consent where applicable
      • Data portability (receiving data in machine-readable format)
      • Object to specific data processing
      
      Requests may be submitted through official support channels at support@flex-it.com. We will respond to requests within 30 days where legally required.`
    },
    {
      id: 9,
      title: '9. Children\'s Privacy',
      content: `Flex-It is not intended for children under the age required by applicable laws without parental or guardian consent.
      
      If we become aware that a child under the legal age has created an account without proper consent, we will take steps to delete such account and associated data promptly. We encourage parents and guardians to monitor their children's online activities.`
    },
    {
      id: 10,
      title: '10. Third-Party Services',
      content: `Flex-It may contain links or integrations with third-party services including:
      • Payment gateways (M-Pesa)
      • Email providers
      • Analytics services
      • Social media platforms
      
      We are not responsible for the privacy practices of third-party platforms. We encourage you to review their privacy policies before providing personal information or using their services.`
    },
    {
      id: 11,
      title: '11. International Data Transfer',
      content: `Your personal information may be transferred to and stored in countries other than your country of residence. These countries may have different data protection laws. By using Flex-It, you consent to the transfer of your information to countries outside your country of residence, which may have different data protection rules.`
    },
    {
      id: 12,
      title: '12. Changes to This Policy',
      content: `Flex-It may update this Privacy Policy periodically. Changes will become effective immediately upon posting on the platform. For significant changes, we will provide notice via email or prominent platform notification. Users are encouraged to review this policy regularly. Your continued use of Flex-It after changes constitutes acceptance of the updated policy.`
    },
    {
      id: 13,
      title: '13. Contact Information',
      content: `For questions regarding this Privacy Policy or data handling practices, contact:
      
      Flex-It Support
      Email: support@flex-it.com
      Location: Nairobi, Kenya
      
      We aim to respond to privacy inquiries within 7-10 business days.`
    },
    {
      id: 14,
      title: '14. Consent & Acknowledgment',
      content: `By using Flex-It, users acknowledge that they have:
      • Read and understood this Privacy Policy
      • Consented to the collection and use of their information
      • Agreed to the data handling practices described herein
      • Understood the risks associated with online data transmission
      
      This consent is voluntary and can be withdrawn at any time by discontinuing use of the Platform or requesting account deletion.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-purple-100 text-lg">
            Flex-It Event Ticketing & Management Platform
          </p>
          <p className="text-purple-200 mt-2">Last Updated: May 2026</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Matters to Us</h2>
          <p className="text-gray-700 leading-relaxed">
            Welcome to Flex-It. Your privacy and data security are important to us. This Privacy Policy explains 
            how Flex-It collects, uses, stores, and protects user information when using our event booking and 
            ticketing platform. We are committed to transparent data practices and compliance with applicable 
            privacy laws and regulations.
          </p>
        </div>

        {/* Key Points Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">🔒</div>
            <h4 className="font-bold text-gray-900 mb-2">Data Protection</h4>
            <p className="text-sm text-gray-700">Encrypted transmission and secure storage</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">🚫</div>
            <h4 className="font-bold text-gray-900 mb-2">No Selling Data</h4>
            <p className="text-sm text-gray-700">We never sell your personal information</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600 mb-2">🎯</div>
            <h4 className="font-bold text-gray-900 mb-2">Purpose-Limited</h4>
            <p className="text-sm text-gray-700">Data used only for stated purposes</p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6 border border-pink-200">
            <div className="text-3xl font-bold text-pink-600 mb-2">👤</div>
            <h4 className="font-bold text-gray-900 mb-2">Your Rights</h4>
            <p className="text-sm text-gray-700">Access, correct, and delete your data</p>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => toggleSection(section.id)}
                className="text-left px-4 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition-colors"
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Expandable Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-8 py-4 text-left hover:bg-gray-50 transition-colors flex justify-between items-center"
              >
                <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                <svg
                  className={`w-6 h-6 text-purple-600 transition-transform ${
                    activeSection === section.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {activeSection === section.id && (
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Data Rights Section */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-8 my-8">
          <h3 className="text-xl font-bold text-purple-900 mb-4">Your Data Rights</h3>
          <p className="text-purple-800 mb-4">
            Under applicable data protection laws, you have the following rights:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <span className="mr-3 text-purple-600 text-xl">📋</span>
              <div>
                <p className="font-semibold text-purple-900">Right to Access</p>
                <p className="text-sm text-purple-700">Request a copy of your personal data</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="mr-3 text-purple-600 text-xl">✏️</span>
              <div>
                <p className="font-semibold text-purple-900">Right to Correct</p>
                <p className="text-sm text-purple-700">Update inaccurate information</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="mr-3 text-purple-600 text-xl">🗑️</span>
              <div>
                <p className="font-semibold text-purple-900">Right to Delete</p>
                <p className="text-sm text-purple-700">Request removal of your data</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="mr-3 text-purple-600 text-xl">📤</span>
              <div>
                <p className="font-semibold text-purple-900">Right to Portability</p>
                <p className="text-sm text-purple-700">Receive data in machine-readable format</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Privacy Concerns?</h3>
          <p className="text-gray-700 mb-4">
            If you have questions about this Privacy Policy, concerns about your data, or wish to exercise your 
            data rights, please contact our privacy team immediately.
          </p>
          <div className="bg-gray-50 p-6 rounded-lg mb-4">
            <p className="font-semibold text-gray-900 mb-2">Flex-It Privacy Team</p>
            <p className="text-gray-700">Email: <a href="mailto:privacy@flex-it.com" className="text-purple-600 hover:underline">privacy@flex-it.com</a></p>
            <p className="text-gray-700">Support: <a href="mailto:support@flex-it.com" className="text-purple-600 hover:underline">support@flex-it.com</a></p>
            <p className="text-gray-700">Location: Nairobi, Kenya</p>
            <p className="text-gray-600 text-sm mt-4">Response time: Within 7-10 business days</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Note:</strong> We take your privacy seriously. All data requests are handled confidentially and in accordance with applicable law.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p className="mb-2">Last Updated: May 2026</p>
          <p className="text-sm">
            © 2026 Flex-It. All rights reserved. | 
            <a href="/terms-of-service" className="text-purple-600 hover:underline ml-1">Terms of Service</a> |
            <a href="/cookie-policy" className="text-purple-600 hover:underline ml-1">Cookie Policy</a> |
            <a href="/security-policy" className="text-purple-600 hover:underline ml-1">Security Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
