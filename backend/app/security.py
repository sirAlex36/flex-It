"""
Security utilities for QR code signing and validation
Issue #1: Cryptographic QR code validation
Issue #5: Weak QR security model improvements
"""

import hmac
import hashlib
import os
from datetime import datetime, timedelta
import json


class QRSecurity:
    """Handle QR code signing and validation"""
    
    def __init__(self):
        # Get secret from environment, fallback to a default (but warn)
        self.secret = os.getenv("QR_SECRET", "DEFAULT_SECRET_CHANGE_IN_PRODUCTION")
        if self.secret == "DEFAULT_SECRET_CHANGE_IN_PRODUCTION":
            print("⚠️  WARNING: QR_SECRET not set in environment! Using default value.")
    
    def generate_qr_signature(self, ticket_uuid, event_id):
        """
        Generate cryptographic signature for QR code
        
        Issue #1: Prevents ticket forgery
        Signature = HMAC-SHA256(ticket_uuid + event_id + date, secret)
        """
        # Include date to prevent unlimited reuse of same signature
        date_str = datetime.utcnow().strftime("%Y-%m-%d")
        
        message = f"{ticket_uuid}:{event_id}:{date_str}".encode()
        signature = hmac.new(
            self.secret.encode(),
            message,
            hashlib.sha256
        ).hexdigest()
        
        return signature
    
    def validate_qr_signature(self, ticket_uuid, event_id, provided_signature):
        """
        Validate QR signature matches expected value
        
        Returns: bool - True if signature is valid
        """
        expected_signature = self.generate_qr_signature(ticket_uuid, event_id)
        
        # Use constant-time comparison to prevent timing attacks
        return hmac.compare_digest(expected_signature, provided_signature)
    
    def create_signed_qr_payload(self, ticket_uuid, event_id):
        """
        Create complete QR payload with signature
        
        Issue #5: QR contains:
        - ticket UUID (not guessable)
        - event UUID (prevents cross-event fraud)
        - signature (prevents forgery)
        
        Format: {
            "ticket_uuid": "...",
            "event_id": ...,
            "signature": "...",
            "created_at": "2026-05-19T10:00:00Z"
        }
        """
        signature = self.generate_qr_signature(ticket_uuid, event_id)
        
        payload = {
            "ticket_uuid": ticket_uuid,
            "event_id": event_id,
            "signature": signature,
            "created_at": datetime.utcnow().isoformat()
        }
        
        return json.dumps(payload)


class InputValidator:
    """Validate user input
    Issue #9: Missing input validation
    """
    
    @staticmethod
    def validate_phone(phone):
        """
        Validate and normalize phone number
        
        Returns: tuple (is_valid, normalized_phone, error_message)
        """
        if not phone:
            return False, None, "Phone number required"
        
        # Remove formatting
        phone = phone.replace("+", "").replace(" ", "").replace("-", "")
        
        # Handle leading 0 (Kenyan format)
        if phone.startswith("0"):
            phone = "254" + phone[1:]
        
        # Ensure 254 prefix
        if not phone.startswith("254"):
            phone = "254" + phone
        
        # Validate length (Kenya: +254 = 3 chars, then 9 digits = 12 total)
        if len(phone) != 12 or not phone.isdigit():
            return False, None, "Invalid phone number format"
        
        return True, phone, None
    
    @staticmethod
    def validate_amount(amount):
        """
        Validate payment amount
        
        Returns: tuple (is_valid, amount_int, error_message)
        """
        try:
            amount_int = int(amount)
            
            # Check minimum (1 KSh)
            if amount_int < 1:
                return False, None, "Amount must be at least 1 KSh"
            
            # Check maximum (1M KSh = reasonable limit)
            if amount_int > 1000000:
                return False, None, "Amount exceeds maximum limit"
            
            return True, amount_int, None
        except (ValueError, TypeError):
            return False, None, "Invalid amount format"
    
    @staticmethod
    def validate_email(email):
        """
        Basic email validation
        
        Returns: tuple (is_valid, email, error_message)
        """
        if not email:
            return False, None, "Email required"
        
        # Simple validation (in production, use email-validator library)
        if "@" not in email or "." not in email:
            return False, None, "Invalid email format"
        
        if len(email) > 254:  # RFC 5321
            return False, None, "Email too long"
        
        return True, email, None
    
    @staticmethod
    def validate_ticket_quantity(quantity):
        """
        Validate ticket quantity
        
        Returns: tuple (is_valid, quantity_int, error_message)
        """
        try:
            qty = int(quantity)
            
            if qty < 1:
                return False, None, "Quantity must be at least 1"
            
            if qty > 100:  # Reasonable limit per transaction
                return False, None, "Quantity exceeds maximum (100 per transaction)"
            
            return True, qty, None
        except (ValueError, TypeError):
            return False, None, "Invalid quantity format"


class ErrorHandler:
    """Handle errors securely
    Issue #13: Sensitive internal errors exposed
    """
    
    @staticmethod
    def generic_error(exception, log_func=None):
        """
        Return generic error to client, log real exception internally
        
        Args:
            exception: The exception that occurred
            log_func: Optional function to log the real error (e.g., logger.error)
        
        Returns: dict with generic error message
        """
        if log_func:
            log_func(f"Internal error: {str(exception)}", exc_info=True)
        
        return {
            "status": "error",
            "error": "An internal error occurred. Please try again later.",
            "code": "INTERNAL_ERROR"
        }
    
    @staticmethod
    def validation_error(message):
        """Return validation error"""
        return {
            "status": "error",
            "error": message,
            "code": "VALIDATION_ERROR"
        }
    
    @staticmethod
    def auth_error(message="Authentication required"):
        """Return authentication error"""
        return {
            "status": "error",
            "error": message,
            "code": "AUTH_ERROR"
        }
    
    @staticmethod
    def permission_error(message="Insufficient permissions"):
        """Return permission denied error"""
        return {
            "status": "error",
            "error": message,
            "code": "PERMISSION_ERROR"
        }
