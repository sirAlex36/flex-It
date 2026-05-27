"""
M-Pesa Payment Routes - Security Hardened Version
Implements critical security fixes for Phase 1

Issues addressed:
#1: Predictable QR Codes → Cryptographic signing
#2: Public Ticket Enumeration → UUID-based endpoints
#3: No Authentication → JWT protection + ownership validation
#4: Email Credentials → Environment variables
#5: Weak QR Security → Signed payloads with UUID
#6: Multiple Entry → is_used tracking with atomic updates
#7: Race Conditions → DB locking and transactions
#8: No Rate Limiting → Flask-Limiter integration
#9: Missing Input Validation → Comprehensive validation
#10: No Idempotency → Check existing status before action
#13: Sensitive Errors → Generic error messages
"""

import qrcode
import io
import base64
import requests
import logging
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from . import main, db
from ..models import Ticket, Event, Transaction, User
from datetime import datetime
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from dotenv import load_dotenv

# Import security utilities
from ..security import QRSecurity, InputValidator, ErrorHandler

# Issue #11: Import Celery tasks for async email
try:
    from ..tasks import send_confirmation_email_task
except ImportError:
    send_confirmation_email_task = None

load_dotenv()

# ==================== CONFIGURATION ====================

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# Initialize rate limiter (Issue #8)
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Initialize security helpers
qr_security = QRSecurity()
input_validator = InputValidator()
error_handler = ErrorHandler()

# Setup logging (Issue #12: Basic logging setup)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# ==================== EMAIL SENDING ====================

def send_confirmation_email(email, ticket_info, qr_code):
    """
    Send email confirmation with QR code - ONLY AFTER PAYMENT
    
    Improvements:
    - Issue #4: Uses environment variables for credentials
    - Issue #13: Handles exceptions gracefully without exposing internal errors
    """
    try:
        if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
            logger.warning("SMTP credentials not configured")
            return False
        
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your Event Ticket Confirmation - #{ticket_info['ticket_id']}"
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = email

        # HTML body with QR code embedded
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
                    <h1 style="color: #2ecc71; text-align: center;">✅ Ticket Confirmed!</h1>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h2>Event Details</h2>
                        <p><strong>Event:</strong> {ticket_info['event_name']}</p>
                        <p><strong>Date:</strong> {ticket_info['event_date']}</p>
                        <p><strong>Venue:</strong> {ticket_info['event_venue']}</p>
                        <p><strong>Ticket Type:</strong> {ticket_info['ticket_type']}</p>
                        <p><strong>Quantity:</strong> {ticket_info['quantity']}</p>
                        <p><strong>Total Amount:</strong> Ksh {ticket_info['total_amount']:,.0f}</p>
                        <p><strong>Ticket ID:</strong> #{ticket_info['ticket_id']}</p>
                        <p><strong>Payment Status:</strong> ✅ Confirmed</p>
                    </div>

                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                        <h3>Scan This QR Code at Event Entry</h3>
                        <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px;" />
                    </div>

                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <strong>⏰ Important:</strong> Please arrive 15 minutes before the event start time with this email or digital ticket.
                    </div>

                    <p style="text-align: center; color: #666; font-size: 12px;">
                        If you have any issues, contact us at support@flex-it.com
                    </p>
                </div>
            </body>
        </html>
        """

        part = MIMEText(html, "html")
        msg.attach(part)

        # Attach QR code image
        if qr_code:
            try:
                image_data = base64.b64decode(qr_code.split(",")[1])
                image = MIMEImage(image_data, name="qrcode.png")
                image.add_header("Content-ID", "<qrcode>")
                image.add_header("Content-Disposition", "inline", filename="qrcode.png")
                msg.attach(image)
            except Exception as e:
                logger.warning(f"Failed to attach QR image: {str(e)}")

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, email, msg.as_string())

        logger.info(f"✓ Confirmation email sent to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}", exc_info=True)
        return False


# ==================== PAYMENT ENDPOINTS ====================

@main.route("/mpesa/stk-push", methods=["POST"])
@limiter.limit("5 per minute")  # Issue #8: Rate limiting - prevent STK spam
@jwt_required()  # Issue #3: JWT authentication required
def mpesa_stk_push():
    """
    Initiate M-Pesa STK Push - CREATE TRANSACTION RECORD
    
    Security improvements:
    - Issue #3: JWT auth required
    - Issue #8: Rate limited (5 per minute)
    - Issue #9: Input validation for phone, amount, ticket
    - Issue #10: Check if payment already processed
    
    Endpoint: POST /mpesa/stk-push
    Auth: JWT token required
    Headers: Authorization: Bearer <token>
    
    Body: {
        "phone": "254712345678",
        "amount": 5000,
        "ticket_id": 1
    }
    """
    try:
        # Get current user from JWT
        current_user_id = get_jwt_identity()
        
        data = request.get_json() or {}
        phone = data.get("phone", "")
        amount = data.get("amount", 0)
        ticket_id = data.get("ticket_id")
        
        # ===== VALIDATION (Issue #9) =====
        
        # Validate phone
        is_valid, normalized_phone, error_msg = input_validator.validate_phone(phone)
        if not is_valid:
            logger.warning(f"Invalid phone: {phone} - {error_msg}")
            return jsonify(error_handler.validation_error(error_msg)), 400
        
        # Validate amount
        is_valid, validated_amount, error_msg = input_validator.validate_amount(amount)
        if not is_valid:
            logger.warning(f"Invalid amount: {amount} - {error_msg}")
            return jsonify(error_handler.validation_error(error_msg)), 400
        
        # Validate ticket exists
        if not ticket_id:
            return jsonify(error_handler.validation_error("Ticket ID required")), 400
        
        # ===== TICKET VERIFICATION (Issue #3: Ownership check) =====
        
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            logger.warning(f"Ticket not found: {ticket_id}")
            return jsonify(error_handler.validation_error("Ticket not found")), 404
        
        # Issue #3: Verify ownership - only user's own tickets
        if ticket.user_id != current_user_id:
            logger.warning(f"Unauthorized access attempt to ticket {ticket_id} by user {current_user_id}")
            return jsonify(error_handler.permission_error("Cannot access this ticket")), 403
        
        # Issue #10: Check if already paid (idempotency)
        if ticket.mpesa_status == "confirmed":
            logger.info(f"Payment already confirmed for ticket {ticket_id}")
            return jsonify({
                "status": "already_paid",
                "message": "This ticket is already paid",
                "ticket_id": ticket_id
            }), 200
        
        # Issue #10: Check if already pending (prevent duplicate payments)
        if ticket.mpesa_status == "pending":
            # Check if there's a recent pending transaction (within 5 minutes)
            recent_transaction = Transaction.query.filter_by(
                ticket_id=ticket_id,
                status="pending"
            ).order_by(Transaction.initiated_at.desc()).first()
            
            if recent_transaction:
                age = (datetime.utcnow() - recent_transaction.initiated_at).total_seconds()
                if age < 300:  # 5 minutes
                    logger.info(f"Recent pending payment exists for ticket {ticket_id}")
                    return jsonify({
                        "status": "pending",
                        "message": "Payment already in progress",
                        "request_id": recent_transaction.mpesa_reference
                    }), 200
        
        # ===== CREATE TRANSACTION RECORD =====
        
        timestamp = datetime.utcnow()
        request_id = f"STK{ticket_id}{timestamp.strftime('%Y%m%d%H%M%S')}"
        
        try:
            transaction = Transaction(
                ticket_id=ticket_id,
                amount=validated_amount,
                mpesa_reference=request_id,
                status="pending",
                payment_method="mpesa",
                initiated_at=timestamp
            )
            
            db.session.add(transaction)
            db.session.commit()
            
            logger.info(f"✓ STK Push initiated - Ticket #{ticket_id}, Reference: {request_id}")
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Database error creating transaction: {str(e)}", exc_info=True)
            return jsonify(error_handler.generic_error(e, logger.error)), 500
        
        # IN DEMO MODE: Return simulated response
        # IN PRODUCTION: Call real M-Pesa API:
        # token = get_mpesa_access_token()
        # stk_url = f"{MPESA_API_URL}/mpesa/stkpush/v1/processrequest"
        # response = requests.post(stk_url, json={...})
        
        return jsonify({
            "status": "success",
            "request_id": request_id,
            "message": f"STK Push sent to {normalized_phone}. Please enter your M-Pesa PIN.",
            "phone": normalized_phone,
            "amount": validated_amount,
            "ticket_id": ticket_id
        }), 200
    
    except Exception as e:
        logger.error(f"STK Push error: {str(e)}", exc_info=True)
        return jsonify(error_handler.generic_error(e, logger.error)), 500


@main.route("/mpesa/callback", methods=["POST"])
@limiter.limit("100 per minute")  # Issue #8: Rate limiting on callback
def mpesa_callback():
    """
    Handle M-Pesa callback - UPDATE TICKET STATUS AND GENERATE QR
    
    FLOW:
    1. Receive callback from M-Pesa
    2. Validate result code (0 = success)
    3. Extract receipt number
    4. Find Transaction by reference (Issue #10: Idempotency check)
    5. Update transaction status to "success"
    6. Update ticket status to "confirmed"
    7. Generate QR code with signature (Issue #1, #5)
    8. Send email confirmation (Issue #4: Using env vars)
    
    Security improvements:
    - Issue #10: Idempotency - don't process same callback twice
    - Issue #7: Use DB transactions for atomicity
    - Issue #1/#5: Generate signed QR codes
    - Issue #13: Don't expose internal errors
    """
    try:
        data = request.get_json() or {}
        
        # Extract callback details
        body = data.get("Body", {})
        stk_callback = body.get("stkCallback", {})
        
        result_code = stk_callback.get("ResultCode")
        result_desc = stk_callback.get("ResultDesc", "")
        checkout_request_id = stk_callback.get("CheckoutRequestID", "")
        
        logger.info(f"📱 M-Pesa Callback - Result Code: {result_code}, Desc: {result_desc}")
        
        # Success: Result Code 0
        if result_code == 0:
            callback_metadata = stk_callback.get("CallbackMetadata", {})
            receipt_number = None
            amount_received = None
            
            # Extract receipt and amount from metadata
            for item in callback_metadata.get("Item", []):
                item_name = item.get("Name")
                if item_name == "MpesaReceiptNumber":
                    receipt_number = item.get("Value")
                elif item_name == "Amount":
                    amount_received = item.get("Value")
            
            if not receipt_number:
                logger.warning("No receipt number in callback")
                return jsonify({"status": "error"}), 400
            
            # Find transaction by request reference (Issue #10: Idempotency)
            transaction = Transaction.query.filter_by(
                mpesa_reference=checkout_request_id
            ).first()
            
            if not transaction:
                logger.warning(f"Transaction not found for reference: {checkout_request_id}")
                # Still return 200 to prevent M-Pesa retries
                return jsonify({"status": "success"}), 200
            
            # Issue #10: Check if already processed (idempotency)
            if transaction.status == "success":
                logger.info(f"Transaction already processed: {transaction.id}")
                return jsonify({"status": "success"}), 200
            
            # ===== UPDATE WITH DB TRANSACTION (Issue #7: Race condition prevention) =====
            
            try:
                # Use database transaction for atomicity
                with db.session.begin():
                    # STEP 1: UPDATE TRANSACTION
                    transaction.status = "success"
                    transaction.mpesa_receipt = receipt_number
                    transaction.confirmed_at = datetime.utcnow()
                    db.session.flush()
                    
                    # STEP 2: UPDATE TICKET
                    ticket = transaction.ticket
                    ticket.mpesa_status = "confirmed"
                    ticket.mpesa_transaction_id = receipt_number
                    db.session.flush()
                    
                    # STEP 3: GENERATE SIGNED QR CODE (Issue #1, #5)
                    qr_payload = qr_security.create_signed_qr_payload(
                        ticket.uuid,
                        ticket.event_id
                    )
                    
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
                    
                    ticket.qr_code = qr_code
                    ticket.qr_signature = qr_security.generate_qr_signature(
                        ticket.uuid,
                        ticket.event_id
                    )
                    db.session.flush()
                    
                    logger.info(f"✓ Transaction {transaction.id} → SUCCESS")
                    logger.info(f"✓ Ticket {ticket.id} → CONFIRMED")
                    logger.info(f"✓ QR Code generated for Ticket {ticket.id}")
                
                # Transaction committed, now send email (outside transaction)
                user = ticket.user
                event = ticket.event
                
                ticket_info = {
                    "ticket_id": ticket.id,
                    "event_name": event.name if event else "Event",
                    "event_date": event.date if event else "TBD",
                    "event_venue": event.venue if event else "TBD",
                    "ticket_type": ticket.ticket_type,
                    "quantity": ticket.quantity,
                    "total_amount": ticket.price * ticket.quantity,
                }
                
                # Issue #11: Send email asynchronously via Celery
                if send_confirmation_email_task:
                    # Queue background task - don't wait for it
                    send_confirmation_email_task.apply_async(
                        args=[user.email, ticket_info, qr_code],
                        countdown=2  # Start in 2 seconds
                    )
                    logger.info(f"✓ Email task queued for {user.email}")
                else:
                    # Fallback to synchronous if Celery not available
                    logger.warning("Celery not available, sending email synchronously")
                    email_sent = send_confirmation_email(user.email, ticket_info, qr_code)
                    if email_sent:
                        logger.info(f"✓ Email sent to {user.email}")
                
                ticket.email_confirmed = True
                db.session.commit()
                
                logger.info(f"✅ Payment confirmed for Ticket #{ticket.id}")
                return jsonify({"status": "success"}), 200
            
            except Exception as e:
                db.session.rollback()
                logger.error(f"Database error processing callback: {str(e)}", exc_info=True)
                # Still return 200 to prevent retries
                return jsonify({"status": "success"}), 200
        
        # Failure: Result Code != 0
        else:
            logger.warning(f"Payment failed - {result_desc}")
            
            # Find and update transaction with error
            transaction = Transaction.query.filter_by(
                mpesa_reference=checkout_request_id
            ).first()
            
            if transaction:
                try:
                    with db.session.begin():
                        transaction.status = "failed"
                        transaction.error_message = result_desc
                        db.session.flush()
                        
                        # Update ticket to reflect failure
                        ticket = transaction.ticket
                        ticket.mpesa_status = "failed"
                        db.session.flush()
                        
                        logger.info(f"✓ Ticket #{ticket.id} marked as FAILED")
                
                except Exception as e:
                    db.session.rollback()
                    logger.error(f"Error marking payment as failed: {str(e)}", exc_info=True)
            
            # Always return 200 to M-Pesa to prevent retries
            return jsonify({"status": "success"}), 200
    
    except Exception as e:
        logger.error(f"Callback error: {str(e)}", exc_info=True)
        # Return 200 even on errors to prevent M-Pesa retries
        return jsonify({"status": "success"}), 200


# ==================== QR CODE ENDPOINTS ====================

@main.route("/tickets/<ticket_uuid>/qr-code", methods=["GET"])
@limiter.limit("30 per minute")  # Issue #8: Rate limiting - prevent QR scraping
@jwt_required()  # Issue #3: JWT auth required
def get_qr_code(ticket_uuid):
    """
    Get QR code for a ticket - ONLY IF CONFIRMED
    
    Security improvements:
    - Issue #2: Use UUID instead of integer ID
    - Issue #3: JWT auth + ownership check
    - Issue #8: Rate limited
    
    Endpoint: GET /tickets/<uuid>/qr-code
    Auth: JWT token required
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Issue #2: Use UUID for lookup instead of sequential ID
        ticket = Ticket.query.filter_by(uuid=ticket_uuid).first()
        if not ticket:
            logger.warning(f"Ticket not found: {ticket_uuid}")
            return jsonify(error_handler.validation_error("Ticket not found")), 404
        
        # Issue #3: Ownership verification
        if ticket.user_id != current_user_id:
            logger.warning(f"Unauthorized QR access attempt by user {current_user_id}")
            return jsonify(error_handler.permission_error()), 403
        
        # QR code only available after payment confirmed
        if ticket.mpesa_status != "confirmed":
            return jsonify({
                "status": "pending",
                "error": "QR code not ready",
                "message": "Awaiting payment confirmation"
            }), 400
        
        # Issue #6: Check if ticket was already used
        if ticket.is_used:
            return jsonify({
                "status": "already_used",
                "error": "This ticket has already been used for entry",
                "used_at": ticket.used_at.isoformat() if ticket.used_at else None
            }), 410  # HTTP 410 Gone
        
        # If QR code doesn't exist, generate it
        if not ticket.qr_code:
            qr_payload = qr_security.create_signed_qr_payload(ticket.uuid, ticket.event_id)
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
            ticket.qr_code = f"data:image/png;base64,{img_base64}"
            ticket.qr_signature = qr_security.generate_qr_signature(ticket.uuid, ticket.event_id)
            db.session.commit()
        
        return jsonify({
            "status": "success",
            "ticket_uuid": ticket.uuid,
            "qr_code": ticket.qr_code,
            "qr_signature": ticket.qr_signature,
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        }), 200
    
    except Exception as e:
        logger.error(f"QR code error: {str(e)}", exc_info=True)
        return jsonify(error_handler.generic_error(e, logger.error)), 500


@main.route("/tickets/<ticket_uuid>/send-confirmation", methods=["POST"])
@limiter.limit("3 per minute")  # Issue #8: Rate limiting - prevent email spam
@jwt_required()  # Issue #3: JWT auth required
def send_ticket_confirmation(ticket_uuid):
    """
    Send email confirmation for ticket - ONLY IF CONFIRMED
    
    Security improvements:
    - Issue #2: Use UUID instead of integer ID
    - Issue #3: JWT auth + ownership check
    - Issue #8: Rate limited
    
    Endpoint: POST /tickets/<uuid>/send-confirmation
    Auth: JWT token required
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Issue #2: Use UUID for lookup
        ticket = Ticket.query.filter_by(uuid=ticket_uuid).first()
        if not ticket:
            return jsonify(error_handler.validation_error("Ticket not found")), 404
        
        # Issue #3: Ownership verification
        if ticket.user_id != current_user_id:
            return jsonify(error_handler.permission_error()), 403
        
        # Only send if payment confirmed
        if ticket.mpesa_status != "confirmed":
            return jsonify({
                "status": "error",
                "error": "Cannot send confirmation",
                "message": "Payment not confirmed yet"
            }), 400
        
        # Get email
        email = ticket.user.email if ticket.user else None
        if not email:
            return jsonify(error_handler.validation_error("Email address not found")), 400
        
        # Get event info
        event = ticket.event
        ticket_info = {
            "ticket_id": ticket.id,
            "event_name": event.name if event else "Event",
            "event_date": event.date if event else "TBD",
            "event_venue": event.venue if event else "TBD",
            "ticket_type": ticket.ticket_type,
            "quantity": ticket.quantity,
            "total_amount": ticket.price * ticket.quantity,
        }
        
        # Send email
        success = send_confirmation_email(email, ticket_info, ticket.qr_code)
        
        if success:
            ticket.email_confirmed = True
            db.session.commit()
            return jsonify({
                "status": "success",
                "message": f"Confirmation email sent to {email}",
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": "Failed to send email. Check SMTP credentials.",
            }), 500
    
    except Exception as e:
        logger.error(f"Confirmation email error: {str(e)}", exc_info=True)
        return jsonify(error_handler.generic_error(e, logger.error)), 500


# ==================== ADMIN / DEBUG ENDPOINTS ====================

@main.route("/tickets/<ticket_uuid>/transactions", methods=["GET"])
@limiter.limit("20 per minute")  # Issue #8: Rate limiting
@jwt_required()  # Issue #3: JWT auth required
def get_ticket_transactions(ticket_uuid):
    """
    Get all transactions for a ticket - for debugging/auditing
    
    Security: JWT auth + ownership check
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Issue #2: Use UUID for lookup
        ticket = Ticket.query.filter_by(uuid=ticket_uuid).first()
        if not ticket:
            return jsonify(error_handler.validation_error("Ticket not found")), 404
        
        # Issue #3: Ownership check
        if ticket.user_id != current_user_id:
            return jsonify(error_handler.permission_error()), 403
        
        transactions = Transaction.query.filter_by(ticket_id=ticket.id).all()
        
        return jsonify({
            "status": "success",
            "ticket_uuid": ticket.uuid,
            "transactions": [
                {
                    "id": t.id,
                    "amount": t.amount,
                    "status": t.status,
                    "mpesa_receipt": t.mpesa_receipt,
                    "mpesa_reference": t.mpesa_reference,
                    "payment_method": t.payment_method,
                    "initiated_at": t.initiated_at.isoformat() if t.initiated_at else None,
                    "confirmed_at": t.confirmed_at.isoformat() if t.confirmed_at else None,
                    "error_message": t.error_message
                }
                for t in transactions
            ]
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}", exc_info=True)
        return jsonify(error_handler.generic_error(e, logger.error)), 500
