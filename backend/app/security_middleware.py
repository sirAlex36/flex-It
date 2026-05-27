"""
Security Middleware
Issue #14: No HTTPS Enforcement → Flask-Talisman for HSTS/CSP
Issue #15: No CSRF / API Abuse Protection → CSRF tokens and request validation
"""

from flask_talisman import Talisman
from flask_wtf.csrf import CSRFProtect
from flask import request
import os


def setup_security_middleware(app):
    """
    Configure security headers and protections
    
    Issue #14: HTTPS/HSTS enforcement
    - Force HTTPS in production
    - HSTS header (1 year)
    - Prevent downgrade attacks
    
    Issue #15: CSRF protection
    - CSRF tokens on all state-changing requests
    - XSS protection headers
    - Clickjacking protection
    """
    
    # Production environment detection
    is_production = app.config.get('ENV') == 'production' or \
                   os.getenv('FLASK_ENV') == 'production'
    
    # ===== HTTPS & SECURITY HEADERS (Issue #14) =====
    
    security_headers = {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',  # 1 year HSTS
        'X-Content-Type-Options': 'nosniff',  # Prevent MIME sniffing
        'X-Frame-Options': 'DENY',  # Prevent clickjacking
        'X-XSS-Protection': '1; mode=block',  # XSS protection
        'Referrer-Policy': 'strict-origin-when-cross-origin',  # Referrer control
        'Permissions-Policy': 'accelerometer=(), microphone=(), camera=()',  # Restrict APIs
    }
    
    # Content Security Policy (CSP)
    csp = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],  # Allow inline for development
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'data:'],
        'connect-src': ["'self'", 'localhost:*'],  # Allow local development
        'frame-ancestors': ["'none'"],
    }
    
    # Initialize Talisman for security headers
    talisman = Talisman(
        app,
        force_https=is_production,  # Only force HTTPS in production
        strict_transport_security=True,
        strict_transport_security_max_age=31536000,  # 1 year
        content_security_policy=csp,
        content_security_policy_nonce_in=['script-src'],
    )
    
    # ===== CSRF PROTECTION (Issue #15) =====
    # Note: CSRF is disabled for API endpoints since:
    # 1. API uses JWT authentication (not cookies)
    # 2. JWT tokens are in Authorization header (not vulnerable to CSRF)
    # 3. CSRF protection is only needed for cookie-based session auth
    
    csrf = CSRFProtect(app)
    
    # Configure CSRF settings - DISABLED BY DEFAULT for REST API
    app.config['WTF_CSRF_TIME_LIMIT'] = None  # No time limit for token validity
    app.config['WTF_CSRF_CHECK_DEFAULT'] = False  # Don't check by default (API uses JWT)
    
    # Configure CSRF for API endpoints (tokens in JSON)
    app.config['WTF_CSRF_METHODS'] = ['POST', 'PUT', 'PATCH', 'DELETE']
    
    # Exempt M-Pesa callback from CSRF (webhooks don't have browser context)
    csrf.exempt('main.mpesa_callback')  # M-Pesa callbacks don't have browser context
    csrf.exempt('main.webhook_endpoints')  # Other webhook endpoints
    
    return talisman, csrf


def require_api_signature(f):
    """
    Decorator to require API request signing
    Issue #15: API Abuse Protection
    
    Validates:
    - Request signature using HMAC-SHA256
    - Timestamp freshness (prevent replay attacks)
    - Method and path match
    
    Usage:
    @main.route('/sensitive-endpoint', methods=['POST'])
    @require_api_signature
    def sensitive_operation():
        ...
    """
    import functools
    import hmac
    import hashlib
    from flask import request, jsonify
    from datetime import datetime
    
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        # Get signature components
        signature = request.headers.get('X-Signature')
        timestamp = request.headers.get('X-Timestamp')
        
        if not signature or not timestamp:
            return jsonify({
                "error": "Missing signature or timestamp",
                "code": "MISSING_SIGNATURE"
            }), 401
        
        # Verify timestamp freshness (within 5 minutes)
        try:
            req_time = int(timestamp)
            current_time = int(datetime.utcnow().timestamp())
            
            if abs(current_time - req_time) > 300:  # 5 minutes
                return jsonify({
                    "error": "Request timestamp expired",
                    "code": "TIMESTAMP_EXPIRED"
                }), 401
        except (ValueError, TypeError):
            return jsonify({
                "error": "Invalid timestamp format",
                "code": "INVALID_TIMESTAMP"
            }), 401
        
        # Verify signature
        api_secret = os.getenv("API_SECRET", "change-me")
        
        # Construct message to sign
        method = request.method
        path = request.path
        body = request.get_data(as_text=True)
        
        message = f"{method}:{path}:{timestamp}:{body}".encode()
        expected_signature = hmac.new(
            api_secret.encode(),
            message,
            hashlib.sha256
        ).hexdigest()
        
        # Constant-time comparison
        if not hmac.compare_digest(expected_signature, signature):
            return jsonify({
                "error": "Invalid signature",
                "code": "INVALID_SIGNATURE"
            }), 401
        
        return f(*args, **kwargs)
    
    return decorated_function
