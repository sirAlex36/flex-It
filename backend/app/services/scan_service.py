"""
Scan Service
Issue #17: Monolithic refactoring → Service layer
Issue #6, #7, #18: Scan validation logic encapsulated
"""

import logging
from datetime import datetime
from app import db
from app.models import Ticket, Event, AuditLog
from app.services.qr_service import QRService
from app.services.ticket_service import TicketService

logger = logging.getLogger(__name__)


class ScanService:
    """
    Service for validating and processing ticket scans
    """
    
    @staticmethod
    def process_ticket_scan(qr_payload_str, scanner_user_id, ip_address):
        """
        Validate and process a ticket scan
        
        Complete scan flow:
        1. Parse QR payload
        2. Validate signature
        3. Verify ticket eligibility
        4. Mark as used (atomic)
        5. Log to audit trail
        
        Args:
            qr_payload_str: JSON QR payload
            scanner_user_id: User ID of scanner
            ip_address: IP address of scan device
        
        Returns:
            dict: {
                'status': 'success|duplicate|invalid_signature|error',
                'ticket_uuid': '...',
                'ticket_holder': '...',
                'entry_time': '...',
                'message': '...'
            }
        """
        try:
            # Step 1: Parse and validate QR payload
            is_valid, ticket_uuid, event_id, signature = QRService.validate_qr_payload(
                qr_payload_str
            )
            
            if not is_valid:
                logger.warning(f"Invalid QR payload from scanner {scanner_user_id}")
                return {
                    "status": "invalid_format",
                    "error": "Invalid QR code format"
                }
            
            # Step 2: Verify signature
            if not QRService.verify_qr_signature(ticket_uuid, event_id, signature):
                logger.warning(
                    f"Invalid QR signature for ticket {ticket_uuid} "
                    f"from scanner {scanner_user_id}"
                )
                return {
                    "status": "invalid_signature",
                    "error": "Invalid QR code"
                }
            
            # Step 3: Lookup ticket and event
            ticket = TicketService.get_ticket_with_verification(ticket_uuid)
            if not ticket:
                return {
                    "status": "not_found",
                    "error": "Ticket not found"
                }
            
            event = Event.query.get(event_id)
            if not event:
                return {
                    "status": "not_found",
                    "error": "Event not found"
                }
            
            # Step 4: Verify ticket is eligible for scan
            eligible, _, error_msg = TicketService.verify_ticket_for_scan(
                ticket_uuid,
                event_id
            )
            
            if not eligible:
                if error_msg == "Already scanned":
                    logger.warning(
                        f"Duplicate scan for ticket {ticket_uuid} by user {scanner_user_id}"
                    )
                    return {
                        "status": "duplicate",
                        "error": error_msg,
                        "used_at": ticket.used_at.isoformat() if ticket.used_at else None
                    }
                else:
                    logger.warning(f"Scan rejected: {error_msg} for ticket {ticket_uuid}")
                    return {
                        "status": "not_eligible",
                        "error": error_msg
                    }
            
            # Step 5: Mark ticket as used (with atomic lock)
            try:
                with db.session.begin_nested():
                    # Pessimistic lock to prevent race conditions
                    locked_ticket = Ticket.query.filter_by(
                        id=ticket.id
                    ).with_for_update().first()
                    
                    if locked_ticket.is_used:
                        # Another process already marked it used
                        logger.warning(
                            f"Duplicate scan (race condition) for ticket {ticket_uuid}"
                        )
                        return {
                            "status": "duplicate",
                            "error": "This ticket was just scanned",
                            "used_at": locked_ticket.used_at.isoformat()
                        }
                    
                    # Mark as used
                    entry_time = datetime.utcnow()
                    locked_ticket.is_used = True
                    locked_ticket.used_at = entry_time
                    db.session.flush()
                    
                    # Log to audit trail
                    audit_log = AuditLog(
                        admin_id=scanner_user_id,
                        action="ticket_scanned",
                        entity_type="Ticket",
                        entity_id=locked_ticket.id,
                        changes={
                            "is_used": True,
                            "used_at": entry_time.isoformat(),
                            "event": event.name
                        },
                        ip_address=ip_address,
                        created_at=entry_time
                    )
                    db.session.add(audit_log)
                    db.session.flush()
                
                db.session.commit()
                
                ticket_holder = ticket.user.name if ticket.user else "Unknown"
                
                logger.info(
                    f"✓ Ticket {ticket_uuid} scanned at {entry_time} "
                    f"for event {event.name}"
                )
                
                return {
                    "status": "success",
                    "ticket_uuid": ticket_uuid,
                    "event_id": event_id,
                    "event_name": event.name,
                    "ticket_holder": ticket_holder,
                    "ticket_type": ticket.ticket_type,
                    "quantity": ticket.quantity,
                    "entry_time": entry_time.isoformat(),
                    "message": f"✓ {ticket_holder} admitted"
                }
            
            except Exception as e:
                db.session.rollback()
                logger.error(
                    f"Error updating scan status: {str(e)}", 
                    exc_info=True
                )
                return {
                    "status": "error",
                    "error": "Failed to process scan"
                }
        
        except Exception as e:
            logger.error(f"Scan processing error: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "error": "Internal error"
            }
    
    @staticmethod
    def get_scan_audit_trail(event_id, limit=50, offset=0):
        """
        Get scan history for an event
        
        Args:
            event_id: Event ID
            limit: Number of results
            offset: Pagination offset
        
        Returns:
            list: Audit logs for scans
        """
        try:
            audit_logs = AuditLog.query.filter(
                AuditLog.action == "ticket_scanned"
            ).order_by(AuditLog.created_at.desc()).limit(limit).offset(offset).all()
            
            return [
                {
                    "id": log.id,
                    "ticket_id": log.entity_id,
                    "scanner_id": log.admin_id,
                    "scanned_at": log.created_at.isoformat(),
                    "event": log.changes.get("event") if log.changes else None,
                    "ip_address": log.ip_address
                }
                for log in audit_logs
            ]
        
        except Exception as e:
            logger.error(f"Error fetching audit trail: {str(e)}")
            return []
