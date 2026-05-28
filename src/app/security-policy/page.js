'use client';

import { useState } from 'react';

export default function SecurityPolicy() {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const sections = [
    {
      id: 1,
      title: '1. Security Overview',
      content: `Flex-It is committed to protecting user data and maintaining the highest standards of information security. Our security infrastructure is designed to prevent unauthorized access, data breaches, and cyber attacks.

Security Principles:
• Confidentiality: Sensitive data is encrypted and restricted
• Integrity: Data accuracy is maintained and verified
• Availability: Systems are resilient and continuously monitored
• Accountability: All activities are logged and audited
• Compliance: We meet industry standards and legal requirements`
    },
    {
      id: 2,
      title: '2. Authentication & Access Control',
      content: `User Authentication:
• Strong Password Requirements: Minimum 8 characters with complexity rules
• JWT Tokens: Secure token-based authentication (24-hour expiration)
• Multi-Factor Authentication: Optional 2FA for enhanced security
• Session Management: Automatic session timeout after inactivity
• Account Lockout: 5 failed login attempts trigger temporary lockout

Role-Based Access Control (RBAC):
• Admin: Full platform access and user management
• Organizer: Event creation and management only
• User: Ticket purchase and profile management
• Permissions: Strictly enforced at application and database levels

Access Monitoring:
• Login attempts are logged and reviewed
• Suspicious activity triggers alerts
• Admin access is restricted and audited
• Access tokens are cryptographically signed`
    },
    {
      id: 3,
      title: '3. Data Encryption',
      content: `In-Transit Encryption:
• HTTPS/TLS 1.2+: All data transmitted over secure connections
• Certificate Pinning: Prevents man-in-the-middle attacks
• Perfect Forward Secrecy: Ephemeral key exchange for session security
• HSTS Headers: Enforces HTTPS-only connections

At-Rest Encryption:
• Database Encryption: Sensitive fields encrypted with AES-256
• Payment Data: Never stored in unencrypted form
• PII: Personal identifiable information encrypted
• Secure Key Management: Keys stored separately from encrypted data

Encryption Standards:
• AES-256: Advanced Encryption Standard for data at rest
• RSA-2048+: Asymmetric encryption for key exchange
• SHA-256: Cryptographic hashing for password storage
• PBKDF2: Key derivation for additional security layers`
    },
    {
      id: 4,
      title: '4. Password Security',
      content: `Password Policy:
• Minimum Length: 8 characters required
• Complexity: Mix of uppercase, lowercase, numbers, and symbols
• No Reuse: Cannot reuse last 5 passwords
• Expiration: Recommended password change every 90 days
• History: Old passwords are not accepted as new passwords

Password Storage:
• Hashing: Passwords never stored in plain text
• PBKDF2: Password-based key derivation function
• Salt: Random salt added to each password
• Salting Iterations: 100,000+ iterations for security

Password Recovery:
• Email Verification: Secure reset link sent to registered email
• Token Expiration: Links valid for 24 hours only
• IP Validation: System checks for suspicious recovery requests
• Backup Codes: Optional backup codes for account recovery`
    },
    {
      id: 5,
      title: '5. Payment Security',
      content: `Payment Processing:
• PCI DSS Compliance: Meets Payment Card Industry Data Security Standard
• M-Pesa Integration: Tokenized payment processing
• No Card Storage: Full card details never stored on Flex-It servers
• Tokenization: Sensitive data replaced with secure tokens
• SSL/TLS: All payment data encrypted in transit

Transaction Security:
• CSRF Protection: Cross-Site Request Forgery prevention
• Rate Limiting: Prevents brute-force payment attempts
• Fraud Detection: Anomaly detection for suspicious transactions
• Transaction Logging: Complete audit trail of all payments
• Verification: Multiple verification layers for payment confirmation

Compliance:
• PCI DSS Level 1: Highest payment security standard
• EMV Compliance: Chip card security standards
• SSL/TLS 1.2+: Encryption standards
• Regular Audits: Third-party payment security assessments`
    },
    {
      id: 6,
      title: '6. Infrastructure Security',
      content: `Network Security:
• Firewalls: Multi-layer firewall protection
• DDoS Protection: Mitigation against Distributed Denial of Service
• VPN: Secure internal communication
• Network Segmentation: Production systems isolated from development

Server Security:
• Regular Patching: Security updates applied immediately
• Minimal Services: Only essential services running
• SSH Keys: Key-based authentication for server access
• No Default Credentials: Default accounts removed/disabled
• Monitoring: Real-time system monitoring and alerts

Database Security:
• Access Control: Strict database permission restrictions
• Encryption: Data encrypted at rest and in transit
• Backups: Regular encrypted backups
• Replication: Data replication for high availability
• SQL Injection Prevention: Parameterized queries used exclusively`
    },
    {
      id: 7,
      title: '7. Application Security',
      content: `Code Security:
• OWASP Top 10: Protection against common vulnerabilities
• Input Validation: All user inputs validated
• Output Encoding: Prevents cross-site scripting (XSS)
• SQL Injection: Parameterized queries prevent SQL injection
• Security Headers: Additional browser security headers

Dependency Management:
• Third-Party Libraries: Regular security updates
• Vulnerability Scanning: Continuous dependency monitoring
• Code Review: Security review before deployment
• Supply Chain: Vetted third-party integrations

API Security:
• Rate Limiting: Prevents API abuse (100 requests/hour per user)
• API Keys: Secure API authentication and authorization
• CORS: Cross-Origin Resource Sharing configured securely
• Versioning: API versioning for gradual updates
• Documentation: Security best practices in API docs`
    },
    {
      id: 8,
      title: '8. Data Protection & Privacy',
      content: `Data Classification:
• Public: Publicly available event information
• Internal: Employee and operational data
• Confidential: User personal information
• Restricted: Payment data and sensitive credentials

Data Minimization:
• Collect Only Necessary: Only essential data collected
• Purpose Limitation: Data used only for stated purposes
• Retention Periods: Data deleted after retention period
• User Deletion: Right to be forgotten honored

Privacy by Design:
• Privacy Assessments: Conducted for new features
• Data Protection Impact: Evaluated before implementation
• Privacy Controls: Users have granular privacy settings
• Transparency: Clear data handling practices documented`
    },
    {
      id: 9,
      title: '9. Monitoring & Incident Response',
      content: `Security Monitoring:
• 24/7 Monitoring: Continuous security monitoring
• Log Aggregation: Centralized log collection and analysis
• Intrusion Detection: Real-time threat detection
• Security Alerts: Immediate notification of suspicious activity
• Performance Monitoring: Tracks system health and anomalies

Incident Response Plan:
• Detection: Automated and manual threat detection
• Containment: Isolate affected systems immediately
• Investigation: Root cause analysis conducted
• Notification: Users notified within 72 hours of breaches
• Recovery: Restoration of services and data

Incident Reporting:
• Email: security@flex-it.com
• 24/7 Response: Security team available always
• Transparency: Regular updates during incident
• Post-Incident: Review and improvement plans shared`
    },
    {
      id: 10,
      title: '10. Vulnerability Management',
      content: `Vulnerability Assessment:
• Regular Scanning: Automated vulnerability scanning
• Penetration Testing: Annual third-party penetration tests
• Security Audits: Regular security assessments
• Code Analysis: Static and dynamic code analysis
• Bug Bounty: Responsible disclosure program for researchers

Patching & Updates:
• Security Patches: Applied within 24-48 hours
• Critical Updates: Deployed immediately for critical vulnerabilities
• Testing: All patches tested before deployment
• Rollback Plan: Ready for rapid rollback if needed
• Communication: Users notified of important updates

Disclosure Policy:
• Responsible Disclosure: We work with researchers
• Non-Disclosure: Vulnerabilities kept confidential until patch
• Credit: Acknowledged researchers in security bulletin
• Bounty Program: Rewards for valid vulnerability reports`
    },
    {
      id: 11,
      title: '11. Employee Security',
      content: `Employee Access:
• Background Checks: Conducted for all employees
• Training: Annual security awareness training required
• NDA: Non-Disclosure Agreements signed
• Access Control: Least privilege principle applied
• Monitoring: Access logs reviewed regularly

Security Culture:
• Policies: Clear security policies enforced
• Awareness: Regular security updates and training
• Incident Reporting: Mandatory incident reporting
• Ethical Standards: Code of conduct includes security practices
• Accountability: Violations result in disciplinary action

Remote Work Security:
• VPN: Mandatory VPN for remote access
• Device Encryption: All devices must be encrypted
• Multi-Factor Auth: Required for remote access
• Network Monitoring: Remote access monitored
• Time-Based Access: Limited session duration`
    },
    {
      id: 12,
      title: '12. Compliance & Certifications',
      content: `Regulatory Compliance:
• GDPR: General Data Protection Regulation compliance
• Kenya DPA: Data Protection Act compliance
• PCI DSS: Payment Card Industry standards
• OWASP: Open Web Application Security Project standards
• ISO 27001: Information security management systems

Certifications & Audits:
• Third-Party Audits: Annual security assessments
• Compliance Reports: Available upon request
• Security Bulletins: Published for critical issues
• Transparency Reports: Submitted to authorities
• Continuous Improvement: Regular updates to security practices

Data Location:
• Servers: Located in secure data centers
• Backups: Encrypted backups in multiple locations
• Jurisdictional: Compliant with data residency requirements
• International: Cross-border data transfers compliant with laws`
    },
    {
      id: 13,
      title: '13. Security Best Practices for Users',
      content: `User Responsibilities:
• Strong Passwords: Create unique, complex passwords
• 2FA: Enable optional two-factor authentication
• Updates: Keep devices and browsers updated
• Caution: Be wary of phishing emails and suspicious links
• Reporting: Report security issues immediately

Safe Usage:
• Public WiFi: Avoid using on public networks
• Device Security: Keep your device secure with antivirus
• Privacy Settings: Review and adjust privacy settings
• Logout: Always logout on shared devices
• Verification: Verify sender before clicking links

Reporting Security Issues:
• Email: security@flex-it.com
• Details: Include as much information as possible
• Confidentiality: Reports kept confidential
• Response: Acknowledged within 24 hours
• Bounty: Valid reports may be eligible for rewards`
    },
    {
      id: 14,
      title: '14. Security Incident History',
      content: `Flex-It maintains a commitment to transparency about security:

• No Major Breaches: No significant data breaches since platform inception
• Minor Incidents: Isolated incidents handled promptly
• User Impact: Affected users notified immediately
• Resolution: Comprehensive fixes implemented
• Lessons Learned: Security improvements made based on incidents

For Security Incident Reports:
• Submit at: security@flex-it.com
• Emergency: Call security hotline during business hours
• Updates: Check our status page for ongoing incidents
• Archives: Historical incident reports available upon request`
    },
    {
      id: 15,
      title: '15. Contact & Support',
      content: `Security Concerns:

Contact Security Team:
Email: security@flex-it.com
Alternative: support@flex-it.com
Location: Nairobi, Kenya

Reporting Vulnerabilities:
• Responsible Disclosure: Contact security team privately
• No Public Disclosure: Keep findings confidential until patched
• Bug Bounty: Eligible for rewards on valid findings
• Response: Acknowledgment within 24 hours

Additional Resources:
• Security FAQ: Available on our platform
• Documentation: Security best practices guide
• Status Page: Real-time system status and incidents
• Blog: Security updates and announcements`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Security Policy</h1>
          <p className="text-red-100 text-lg">
            Flex-It Event Ticketing & Management Platform
          </p>
          <p className="text-red-200 mt-2">Last Updated: May 2026</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Security is Our Priority</h2>
          <p className="text-gray-700 leading-relaxed">
            Flex-It implements comprehensive security measures to protect user data, ensure platform reliability, 
            and prevent unauthorized access. This Security Policy outlines the technical, operational, and organizational 
            controls we have implemented to safeguard your information and maintain the integrity of our platform.
          </p>
        </div>

        {/* Security Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">🔐</div>
            <h4 className="font-bold text-gray-900 mb-2">Encryption</h4>
            <p className="text-sm text-gray-700">AES-256 & TLS 1.2+</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">👤</div>
            <h4 className="font-bold text-gray-900 mb-2">Auth</h4>
            <p className="text-sm text-gray-700">JWT & 2FA Support</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">🛡️</div>
            <h4 className="font-bold text-gray-900 mb-2">Monitoring</h4>
            <p className="text-sm text-gray-700">24/7 Detection</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600 mb-2">✅</div>
            <h4 className="font-bold text-gray-900 mb-2">Compliance</h4>
            <p className="text-sm text-gray-700">GDPR & PCI DSS</p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6 border border-pink-200">
            <div className="text-3xl font-bold text-pink-600 mb-2">🔔</div>
            <h4 className="font-bold text-gray-900 mb-2">Response</h4>
            <p className="text-sm text-gray-700">24/7 Incident Team</p>
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
                className="text-left px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-medium transition-colors"
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
                  className={`w-6 h-6 text-red-600 transition-transform ${
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

        {/* Security Commitment */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 my-8">
          <h3 className="text-xl font-bold text-red-900 mb-4">🛡️ Our Security Commitment</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="mr-3 text-red-600 text-xl">✓</span>
              <span className="text-red-800">Continuous monitoring and threat detection</span>
            </div>
            <div className="flex items-start">
              <span className="mr-3 text-red-600 text-xl">✓</span>
              <span className="text-red-800">Regular security audits and penetration testing</span>
            </div>
            <div className="flex items-start">
              <span className="mr-3 text-red-600 text-xl">✓</span>
              <span className="text-red-800">Immediate patching of security vulnerabilities</span>
            </div>
            <div className="flex items-start">
              <span className="mr-3 text-red-600 text-xl">✓</span>
              <span className="text-red-800">Compliance with international security standards</span>
            </div>
            <div className="flex items-start">
              <span className="mr-3 text-red-600 text-xl">✓</span>
              <span className="text-red-800">Transparent communication during security incidents</span>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Report Security Issues</h3>
          <p className="text-gray-700 mb-4">
            Found a security vulnerability? Help us keep Flex-It safe by responsibly disclosing it to our security team.
          </p>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="font-semibold text-gray-900 mb-2">Security Team</p>
            <p className="text-gray-700">Email: <a href="mailto:security@flex-it.com" className="text-red-600 hover:underline">security@flex-it.com</a></p>
            <p className="text-gray-700">Backup: <a href="mailto:support@flex-it.com" className="text-red-600 hover:underline">support@flex-it.com</a></p>
            <p className="text-gray-700">Location: Nairobi, Kenya</p>
            <p className="text-gray-600 text-sm mt-4">Response time: Within 24 hours</p>
            <p className="text-sm text-gray-600 mt-3 italic">Please do not publicly disclose vulnerabilities before we have a chance to patch.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p className="mb-2">Last Updated: May 2026</p>
          <p className="text-sm">
            © 2026 Flex-It. All rights reserved. | 
            <a href="/privacy-policy" className="text-red-600 hover:underline ml-1">Privacy Policy</a> | 
            <a href="/terms-of-service" className="text-red-600 hover:underline ml-1">Terms of Service</a> |
            <a href="/cookie-policy" className="text-red-600 hover:underline ml-1">Cookie Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
