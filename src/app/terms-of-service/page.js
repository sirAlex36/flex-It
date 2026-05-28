'use client';

import { useState } from 'react';

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const sections = [
    {
      id: 1,
      title: '1. Acceptance of Terms',
      content: `By accessing and using Flex-It ("the Platform"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you are not permitted to use the Platform. We reserve the right to modify these terms at any time, and your continued use of the Platform constitutes acceptance of any changes.`
    },
    {
      id: 2,
      title: '2. User Accounts & Eligibility',
      content: `To use Flex-It, you must be at least 18 years old or have parental/guardian consent. You are responsible for:
      • Maintaining the confidentiality of your account credentials
      • All activities that occur under your account
      • Ensuring information provided during registration is accurate and current
      • Notifying us immediately of unauthorized account access
      
      We reserve the right to suspend or terminate accounts that violate our policies.`
    },
    {
      id: 3,
      title: '3. Services Provided',
      content: `Flex-It provides:
      • Event discovery and browsing
      • Digital ticket purchasing and generation
      • Ticket management and storage
      • Payment processing through third-party providers
      • Real-time event updates and notifications
      • QR-code based entry verification
      
      The Platform is provided "as-is" and we make no guarantees regarding event schedules, venue conditions, or third-party organizer conduct.`
    },
    {
      id: 4,
      title: '4. Ticket Purchase & Payment',
      content: `When purchasing tickets through Flex-It:
      • All ticket sales are final and non-refundable except where required by law
      • Prices displayed include applicable taxes unless otherwise stated
      • Payment is processed through M-Pesa or other authorized payment providers
      • You agree to pay all charges associated with your purchase
      • We are not liable for payment processing delays or failures
      • Transaction confirmations will be sent to your registered email
      
      Organizers set all ticket prices and terms; Flex-It is not responsible for pricing disputes.`
    },
    {
      id: 5,
      title: '5. Ticket Terms & Conditions',
      content: `Tickets purchased through Flex-It:
      • Are non-transferable unless organizer permits
      • Cannot be duplicated or used more than once
      • May be cancelled by organizers under specified conditions
      • Are subject to individual event terms
      • Must be presented in valid digital or printed format for entry
      • Are void if obtained through fraudulent means
      
      Flex-It reserves the right to cancel any transaction that appears fraudulent or violates our policies.`
    },
    {
      id: 6,
      title: '6. User Conduct & Prohibited Activities',
      content: `You agree not to:
      • Engage in fraudulent or illegal activities
      • Attempt to breach platform security systems
      • Use the platform to harass, threaten, or defame others
      • Share inappropriate, offensive, or illegal content
      • Attempt to manipulate ticket availability or pricing
      • Resell tickets for unlawful profit (scalping restrictions apply)
      • Use automated tools to scrape data or bypass security
      • Impersonate organizers or Flex-It staff
      • Violate applicable laws or regulations
      
      Violations may result in account suspension or legal action.`
    },
    {
      id: 7,
      title: '7. Intellectual Property Rights',
      content: `All content on Flex-It, including:
      • Logo, design, and branding
      • Text, images, and multimedia
      • Software code and functionality
      • Event descriptions and promotional materials
      
      ...are owned by Flex-It or licensed third parties. You may not reproduce, distribute, or modify this content without explicit written permission. Organizers retain rights to their event information.`
    },
    {
      id: 8,
      title: '8. Limitation of Liability',
      content: `To the maximum extent permitted by law, Flex-It is not liable for:
      • Indirect, incidental, or consequential damages
      • Loss of profit, data, or business opportunity
      • Third-party payment provider failures
      • Event cancellations or postponements
      • Venue issues or organizer misconduct
      • Service interruptions or technical errors
      • Data breaches despite reasonable security measures
      
      Our total liability is limited to the amount paid for the specific transaction in question.`
    },
    {
      id: 9,
      title: '9. Disclaimer of Warranties',
      content: `Flex-It is provided "as-is" without warranties of any kind. We disclaim:
      • Merchantability
      • Fitness for a particular purpose
      • Non-infringement
      • Uninterrupted or error-free service
      
      Event organizers are solely responsible for event accuracy, logistics, and safety. Flex-It does not guarantee event execution or attendee satisfaction.`
    },
    {
      id: 10,
      title: '10. Privacy & Data Protection',
      content: `Your use of Flex-It is governed by our Privacy Policy. By using the Platform, you consent to:
      • Collection of personal and technical data
      • Use of information as described in our Privacy Policy
      • Sharing of data with payment providers and authorized partners
      • Processing of payment information
      
      Refer to our full Privacy Policy for complete data handling details.`
    },
    {
      id: 11,
      title: '11. Third-Party Services & Links',
      content: `Flex-It may integrate with or link to third-party services including:
      • Payment processors (M-Pesa)
      • Email and communication providers
      • Analytics services
      • External event platforms
      
      We are not responsible for third-party content, services, or privacy practices. Your use of third-party services is governed by their respective terms and policies.`
    },
    {
      id: 12,
      title: '12. Event Organizer Responsibilities',
      content: `Event organizers are responsible for:
      • Accurate event information
      • Venue logistics and safety
      • Attendee management
      • Compliance with all applicable laws
      • Event execution as advertised
      
      Flex-It does not control organizers and is not liable for their conduct. Report organizer violations to our support team.`
    },
    {
      id: 13,
      title: '13. Refunds & Cancellations',
      content: `Refund Policy:
      • Most ticket sales are final and non-refundable
      • Exceptions apply only when the event is cancelled by the organizer
      • In case of event cancellation, refunds will be processed within 14 business days
      • Technical errors may be reviewed case-by-case
      • Organizers may offer refunds at their discretion
      
      To request a refund, contact support@flex-it.com with your transaction details.`
    },
    {
      id: 14,
      title: '14. Security & Access Control',
      content: `Flex-It implements security measures including:
      • Encrypted password storage
      • JWT-based authentication
      • HTTPS secure communication
      • Rate limiting and fraud prevention
      • Access control based on user roles
      
      You are responsible for protecting your account. Do not share passwords or access tokens. Report suspicious activity immediately.`
    },
    {
      id: 15,
      title: '15. Dispute Resolution',
      content: `In case of disputes:
      • Contact our support team at support@flex-it.com
      • Provide detailed information about your concern
      • We will investigate and respond within 5-7 business days
      • For unresolved issues, disputes may be escalated to arbitration
      • Class action lawsuits are waived
      
      All disputes are subject to applicable Kenyan law.`
    },
    {
      id: 16,
      title: '16. Termination of Service',
      content: `Flex-It reserves the right to:
      • Suspend or terminate your account for policy violations
      • Remove content that violates these terms
      • Disable access to the platform for security reasons
      • Discontinue services with reasonable notice
      
      Upon termination, your right to use the Platform ceases immediately.`
    },
    {
      id: 17,
      title: '17. Governing Law & Jurisdiction',
      content: `These Terms of Service are governed by the laws of Kenya, without regard to conflict of law principles. Any legal action or proceeding related to Flex-It shall be subject to the exclusive jurisdiction of courts in Nairobi, Kenya.`
    },
    {
      id: 18,
      title: '18. Contact Information',
      content: `For questions about these Terms of Service, contact:
      
      Flex-It Support
      Email: support@flex-it.com
      Location: Nairobi, Kenya
      
      We aim to respond to inquiries within 48 hours during business days.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-blue-100 text-lg">
            Flex-It Event Ticketing & Management Platform
          </p>
          <p className="text-blue-200 mt-2">Last Updated: May 2026</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Flex-It</h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms of Service ("Terms") govern your use of the Flex-It platform, including our website, 
            mobile applications, and all associated services. By accessing and using Flex-It, you agree to comply 
            with these Terms and all applicable laws and regulations. If you do not agree with any part of these 
            Terms, you may not use our Platform.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => toggleSection(section.id)}
                className="text-left px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors"
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
                  className={`w-6 h-6 text-blue-600 transition-transform ${
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

        {/* Acceptance Section */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 my-8">
          <h3 className="text-xl font-bold text-blue-900 mb-4">User Acknowledgment & Consent</h3>
          <p className="text-blue-800 mb-4">
            By using Flex-It, you acknowledge that:
          </p>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-3 text-blue-600">✓</span>
              <span>You have read and understand these Terms of Service</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-blue-600">✓</span>
              <span>You agree to comply with all terms and conditions</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-blue-600">✓</span>
              <span>You accept our Privacy Policy and data handling practices</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-blue-600">✓</span>
              <span>You assume all risks associated with using the Platform</span>
            </li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h3>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms of Service or need clarification on any section, 
            please don't hesitate to contact our support team.
          </p>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="font-semibold text-gray-900 mb-2">Flex-It Support Team</p>
            <p className="text-gray-700">Email: <a href="mailto:support@flex-it.com" className="text-blue-600 hover:underline">support@flex-it.com</a></p>
            <p className="text-gray-700">Location: Nairobi, Kenya</p>
            <p className="text-gray-600 text-sm mt-4">Response time: Within 48 hours on business days</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p className="mb-2">Last Updated: May 2026</p>
          <p className="text-sm">
            © 2026 Flex-It. All rights reserved. | 
            <a href="/privacy-policy" className="text-blue-600 hover:underline ml-1">Privacy Policy</a> |
            <a href="/cookie-policy" className="text-blue-600 hover:underline ml-1">Cookie Policy</a> |
            <a href="/security-policy" className="text-blue-600 hover:underline ml-1">Security Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
