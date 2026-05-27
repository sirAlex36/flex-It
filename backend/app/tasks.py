"""
Celery Tasks - Background Job Queue
Issue #11: Blocking SMTP Inside Callback → Async email sending
Issue #12: No Audit Logging → Structured audit logging to database
"""

import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import base64
import os
from datetime import datetime
from celery import shared_task
from celery.utils.log import get_task_logger

from . import db
from .models import Ticket, AuditLog, User

logger = get_task_logger(__name__)

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")


@shared_task(bind=True, max_retries=3)
def send_confirmation_email_task(self, email, ticket_info, qr_code):
    """
    Asynchronous email sending task
    
    Issue #11: Decoupled from HTTP callback request
    - Callback returns 200 immediately
    - Email sent in background
    - Retries automatically on failure
    
    Args:
        email: Recipient email address
        ticket_info: Dict with ticket details
        qr_code: Base64-encoded QR code image
    
    Returns:
        Dict with status
    """
    try:
        if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
            logger.warning("SMTP credentials not configured")
            return {"status": "error", "reason": "SMTP not configured"}
        
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
        
        # Send email with retry logic
        try:
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                server.sendmail(EMAIL_ADDRESS, email, msg.as_string())
            
            logger.info(f"✓ Email sent to {email} for ticket #{ticket_info['ticket_id']}")
            return {"status": "success", "recipient": email}
        
        except smtplib.SMTPException as e:
            logger.error(f"SMTP error: {str(e)}")
            # Retry with exponential backoff
            raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
    
    except Exception as e:
        logger.error(f"Email task error: {str(e)}", exc_info=True)
        # Final failure after retries
        return {"status": "failed", "error": str(e), "retries": self.request.retries}


@shared_task
def send_resend_confirmation_email_task(ticket_id):
    """
    Resend confirmation email for existing ticket
    
    Used when user requests email resend
    """
    try:
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            logger.warning(f"Ticket {ticket_id} not found for email resend")
            return {"status": "error", "reason": "Ticket not found"}
        
        if ticket.mpesa_status != "confirmed":
            logger.warning(f"Ticket {ticket_id} not confirmed, cannot resend")
            return {"status": "error", "reason": "Payment not confirmed"}
        
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
        
        # Call the main email task
        return send_confirmation_email_task.apply_async(
            args=[user.email, ticket_info, ticket.qr_code]
        )
    
    except Exception as e:
        logger.error(f"Error resending confirmation: {str(e)}", exc_info=True)
        return {"status": "failed", "error": str(e)}


@shared_task
def audit_log_task(admin_id, action, entity_type, entity_id, changes=None, ip_address=None):
    """
    Log administrative action asynchronously
    
    Issue #12: No Audit Logging → Structured audit trail
    
    Args:
        admin_id: User who performed action
        action: Description of action (e.g., 'create', 'update', 'delete')
        entity_type: Type of entity (User, Event, Ticket, Transaction)
        entity_id: ID of affected entity
        changes: Dict of before/after values
        ip_address: IP address of request
    
    Returns:
        ID of created audit log
    """
    try:
        audit_log = AuditLog(
            admin_id=admin_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            changes=changes,
            ip_address=ip_address,
            created_at=datetime.utcnow()
        )
        
        db.session.add(audit_log)
        db.session.commit()
        
        logger.info(
            f"Audit log created: {action} on {entity_type}#{entity_id} "
            f"by admin#{admin_id} from {ip_address}"
        )
        
        return {"status": "success", "log_id": audit_log.id}
    
    except Exception as e:
        logger.error(f"Error creating audit log: {str(e)}", exc_info=True)
        db.session.rollback()
        return {"status": "failed", "error": str(e)}
