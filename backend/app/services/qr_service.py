"""
QR Code Service
Issue #17: Monolithic refactoring → Service layer
Issue #1, #5: QR security logic encapsulated
"""

import qrcode
import io
import base64
import json
import logging
from app.security import QRSecurity
from app import db

logger = logging.getLogger(__name__)
qr_security = QRSecurity()


class QRService:
    """
    Service for QR code generation, validation, and management
    """
    
    @staticmethod
    def generate_qr_code(ticket_uuid, event_id):
        """
        Generate signed QR code with cryptographic validation
        
        Args:
            ticket_uuid: Unique ticket identifier
            event_id: Event ID this ticket belongs to
        
        Returns:
            tuple: (qr_code_base64, signature) or (None, None) on error
        """
        try:
            # Create signed QR payload
            qr_payload = qr_security.create_signed_qr_payload(ticket_uuid, event_id)
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_payload)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            buffer.seek(0)
            img_base64 = base64.b64encode(buffer.getvalue()).decode()
            qr_code = f"data:image/png;base64,{img_base64}"
            
            signature = qr_security.generate_qr_signature(ticket_uuid, event_id)
            
            logger.info(f"✓ QR code generated for ticket {ticket_uuid}")
            
            return qr_code, signature
        
        except Exception as e:
            logger.error(f"Error generating QR code: {str(e)}", exc_info=True)
            return None, None
    
    @staticmethod
    def validate_qr_payload(qr_payload_str):
        """
        Parse and validate QR code payload
        
        Args:
            qr_payload_str: JSON string from QR code
        
        Returns:
            tuple: (is_valid, ticket_uuid, event_id, signature) or (False, None, None, None)
        """
        try:
            payload = json.loads(qr_payload_str)
            
            ticket_uuid = payload.get("ticket_uuid")
            event_id = payload.get("event_id")
            signature = payload.get("signature")
            
            if not all([ticket_uuid, event_id, signature]):
                logger.warning("Incomplete QR payload")
                return False, None, None, None
            
            return True, ticket_uuid, event_id, signature
        
        except json.JSONDecodeError:
            logger.warning("Invalid QR payload format")
            return False, None, None, None
    
    @staticmethod
    def verify_qr_signature(ticket_uuid, event_id, provided_signature):
        """
        Verify QR code signature
        
        Args:
            ticket_uuid: Ticket UUID from QR
            event_id: Event ID from QR
            provided_signature: Signature from QR
        
        Returns:
            bool: True if signature is valid
        """
        is_valid = qr_security.validate_qr_signature(
            ticket_uuid,
            event_id,
            provided_signature
        )
        
        if not is_valid:
            logger.warning(f"Invalid QR signature for ticket {ticket_uuid}")
        
        return is_valid
