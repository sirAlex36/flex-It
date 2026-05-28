'use client';

import { useState } from 'react';

export default function CookiePolicy() {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const sections = [
    {
      id: 1,
      title: '1. What Are Cookies?',
      content: `Cookies are small text files stored on your device (computer, tablet, or mobile phone) when you visit our website or use our application. They allow websites to recognize your device and remember information about your visit, such as your preferences, login status, and activity.

Types of cookies include:
• Session Cookies: Temporary cookies that are deleted when you close your browser
• Persistent Cookies: Remain on your device for a specified period
• First-party Cookies: Set directly by Flex-It
• Third-party Cookies: Set by third-party services we use`
    },
    {
      id: 2,
      title: '2. Cookies We Use',
      content: `Essential Cookies:
• Authentication: Maintain your login session
• Security: Detect and prevent fraud
• Session Management: Store temporary session data
• CSRF Protection: Prevent cross-site request forgery attacks

Functional Cookies:
• User Preferences: Remember your settings
• Language Selection: Store your language preference
• UI State: Remember expanded/collapsed menu states
• Search History: Store recent searches

Analytics Cookies:
• Page Traffic: Track which pages are visited
• User Behavior: Understand how users interact with Flex-It
• Performance Metrics: Monitor platform performance
• Error Tracking: Identify and log platform errors

Marketing Cookies:
• Conversion Tracking: Track ticket purchases
• User Engagement: Measure campaign effectiveness
• Event Recommendations: Personalize event suggestions
• Retargeting: Show relevant ads based on browsing history`
    },
    {
      id: 3,
      title: '3. Third-Party Cookies',
      content: `Flex-It may use third-party services that set cookies on your device:

Google Analytics:
• Purpose: Track website traffic and user behavior
• Data: Anonymous usage statistics
• Privacy: See Google Analytics Privacy Policy

M-Pesa Payment Gateway:
• Purpose: Process payments securely
• Data: Payment information
• Privacy: See M-Pesa Privacy Policy

Social Media Platforms:
• Purpose: Enable social sharing and sign-in
• Data: Social profile information
• Privacy: See respective platform privacy policies

Note: We are not responsible for third-party cookie practices. Please review their privacy policies for more information.`
    },
    {
      id: 4,
      title: '4. Why We Use Cookies',
      content: `Cookies enable us to:
• Provide seamless authentication and session management
• Enhance security and prevent unauthorized access
• Remember your preferences and settings
• Improve platform performance and user experience
• Analyze user behavior to optimize the platform
• Personalize content and event recommendations
• Enable social sharing functionality
• Measure marketing campaign effectiveness
• Detect and prevent fraud
• Comply with legal and regulatory requirements`
    },
    {
      id: 5,
      title: '5. Cookie Settings & Control',
      content: `You have control over cookies on your device:

Browser Controls:
• Most browsers allow you to refuse cookies or alert you when a cookie is being set
• You can delete existing cookies from your browser settings
• You can set your browser to block all cookies, but this may affect functionality

Flex-It Settings:
• Visit your account settings to control preferences
• Opt-out of marketing and analytics cookies (essential cookies cannot be disabled)
• Manage notification and personalization preferences
• Update your consent choices at any time

Note: Disabling essential cookies may prevent you from using certain features of Flex-It.`
    },
    {
      id: 6,
      title: '6. Cookie Retention',
      content: `Cookie Retention Periods:
• Session Cookies: Deleted when you close your browser
• Authentication Cookies: Valid for 24-90 days depending on your login preference
• Preference Cookies: Retained for up to 1 year
• Analytics Cookies: Retained for up to 2 years
• Marketing Cookies: Retained for up to 13 months

You can clear cookies manually from your browser settings at any time. When you log out of Flex-It, your authentication cookies are immediately deleted.`
    },
    {
      id: 7,
      title: '7. Cookies & Privacy',
      content: `Cookies & Data Protection:
• Essential cookies: Required for platform functionality and security
• Functional cookies: Enhance user experience without personal identification
• Analytics cookies: Collect anonymous, aggregated data only
• Marketing cookies: Use pseudonymous identifiers

By using Flex-It, you consent to our use of cookies as described in this policy. For detailed information about how we use data collected via cookies, please see our Privacy Policy.

Cookies are used in compliance with:
• General Data Protection Regulation (GDPR)
• ePrivacy Directive
• Kenya's Data Protection Act
• Other applicable privacy laws`
    },
    {
      id: 8,
      title: '8. Consent & Opt-In',
      content: `Cookie Consent:
• Essential cookies are set automatically for security and functionality
• Non-essential cookies require your explicit consent
• A cookie consent banner appears on your first visit
• You can change your preferences at any time in cookie settings

Consent Management:
• Accept All: Enable all cookies
• Reject Non-Essential: Disable analytics and marketing cookies
• Manage Preferences: Customize which cookies to enable
• View Policy: Access this cookie policy

Your consent choice is stored and respected across sessions.`
    },
    {
      id: 9,
      title: '9. Do-Not-Track (DNT) Requests',
      content: `Some browsers include a Do-Not-Track (DNT) feature. Flex-It respects DNT signals:
• When DNT is enabled, we do not set non-essential tracking cookies
• Essential cookies for security and functionality are still used
• Analytics and marketing cookies are not set
• Your browsing experience on Flex-It remains unchanged

Note: Not all browsers and websites support DNT. Even with DNT enabled, other services may still track your activity.`
    },
    {
      id: 10,
      title: '10. Local Storage & Similar Technologies',
      content: `Beyond cookies, Flex-It may use:

Local Storage:
• Stores data on your device permanently
• Used for offline functionality and caching
• Not sent to servers with each request
• Subject to same consent as cookies

Session Storage:
• Temporary storage for single session
• Cleared when you close your browser
• Used for real-time data management

Web Beacons:
• Tiny images used to track page views
• Measure marketing campaign effectiveness
• Combined with cookies for analytics

All these technologies are used in accordance with this policy and your consent preferences.`
    },
    {
      id: 11,
      title: '11. Cookie Policy Updates',
      content: `Flex-It may update this Cookie Policy periodically to reflect:
• New cookie uses or technologies
• Changes in privacy regulations
• Platform improvements or features
• Third-party service updates

When we make material changes, we will:
• Notify you via email
• Display a prominent notice on the platform
• Request updated consent if necessary
• Allow you to review changes before accepting

Your continued use of Flex-It after policy updates constitutes acceptance of the updated policy. Check this page regularly for updates.`
    },
    {
      id: 12,
      title: '12. Contact & Support',
      content: `Questions about our cookie practices?

Contact Flex-It:
Email: privacy@flex-it.com
Support: support@flex-it.com
Location: Nairobi, Kenya

Response Time: Within 7-10 business days

You can also:
• Access your cookie settings in account preferences
• Request a manual cookie audit
• Submit a cookie usage complaint
• Withdraw consent at any time`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-indigo-100 text-lg">
            Flex-It Event Ticketing & Management Platform
          </p>
          <p className="text-indigo-200 mt-2">Last Updated: May 2026</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding Our Cookie Practices</h2>
          <p className="text-gray-700 leading-relaxed">
            This Cookie Policy explains how Flex-It uses cookies and similar technologies on our platform. 
            We use cookies to enhance your experience, improve our services, and ensure security. We are committed 
            to transparency about how cookies are used and respect your preferences regarding data collection.
          </p>
        </div>

        {/* Cookie Types Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
            <div className="text-3xl font-bold text-red-600 mb-2">🔐</div>
            <h4 className="font-bold text-gray-900 mb-2">Essential Cookies</h4>
            <p className="text-sm text-gray-700">Required for security and functionality. Always active.</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">⚙️</div>
            <h4 className="font-bold text-gray-900 mb-2">Functional Cookies</h4>
            <p className="text-sm text-gray-700">Remember your preferences and settings.</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">📊</div>
            <h4 className="font-bold text-gray-900 mb-2">Analytics Cookies</h4>
            <p className="text-sm text-gray-700">Track usage patterns anonymously.</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">📢</div>
            <h4 className="font-bold text-gray-900 mb-2">Marketing Cookies</h4>
            <p className="text-sm text-gray-700">Personalize content and ads (optional).</p>
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
                className="text-left px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition-colors"
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
                  className={`w-6 h-6 text-indigo-600 transition-transform ${
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

        {/* Cookie Management Callout */}
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-8 my-8">
          <h3 className="text-xl font-bold text-indigo-900 mb-4">🎛️ Manage Your Cookie Preferences</h3>
          <p className="text-indigo-800 mb-4">
            You have full control over cookie settings on Flex-It:
          </p>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="mr-3 text-indigo-600 font-bold">1.</span>
              <span className="text-indigo-800">Visit your <strong>Account Settings</strong> to customize cookie preferences</span>
            </div>
            <div className="flex items-start">
              <span className="mr-3 text-indigo-600 font-bold">2.</span>
              <span className="text-indigo-800">Use browser settings to accept, reject, or delete cookies</span>
            </div>
            <div className="flex items-start">
              <span className="mr-3 text-indigo-600 font-bold">3.</span>
              <span className="text-indigo-800">Enable <strong>Do-Not-Track</strong> in your browser to opt-out of tracking</span>
            </div>
            <div className="flex items-start">
              <span className="mr-3 text-indigo-600 font-bold">4.</span>
              <span className="text-indigo-800">Change your mind anytime—your preferences are always respected</span>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Cookie Questions?</h3>
          <p className="text-gray-700 mb-4">
            If you have questions about how Flex-It uses cookies or want to understand your options, 
            our privacy team is here to help.
          </p>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="font-semibold text-gray-900 mb-2">Flex-It Privacy Team</p>
            <p className="text-gray-700">Email: <a href="mailto:privacy@flex-it.com" className="text-indigo-600 hover:underline">privacy@flex-it.com</a></p>
            <p className="text-gray-700">Support: <a href="mailto:support@flex-it.com" className="text-indigo-600 hover:underline">support@flex-it.com</a></p>
            <p className="text-gray-700">Location: Nairobi, Kenya</p>
            <p className="text-gray-600 text-sm mt-4">Response time: Within 7-10 business days</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p className="mb-2">Last Updated: May 2026</p>
          <p className="text-sm">
            © 2026 Flex-It. All rights reserved. | 
            <a href="/privacy-policy" className="text-indigo-600 hover:underline ml-1">Privacy Policy</a> | 
            <a href="/terms-of-service" className="text-indigo-600 hover:underline ml-1">Terms of Service</a> |
            <a href="/security-policy" className="text-indigo-600 hover:underline ml-1">Security Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
