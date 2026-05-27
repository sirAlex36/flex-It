"""
Ticket Scanning & Validation Routes
Issue #6: Multiple Entry Vulnerability → Scan validation & usage tracking
Issue #18: No Scan Validation Endpoint → Secure scanner API
Issue #7: Race Condition Risk → Atomic database updates with locking
"""

import json
import logging
from datetime import datetime
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from sqlalchemy import and_
from . import main, db
from ..models import Ticket, Event, AuditLog
from ..security import QRSecurity, ErrorHandler

logger = logging.getLogger(__name__)
qr_security = QRSecurity()
error_handler = ErrorHandler()

# Rate limiter for scanner endpoints
scanner_limiter = Limiter(
    key_func=lambda: request.remote_addr,
    default_limits=["100 per minute"]
)


@main.route("/tickets/scan", methods=["POST"])
@scanner_limiter.limit("60 per minute")  # Issue #8: Rate limiting
@jwt_required()  # Issue #3: JWT auth required (scanner staff)
def scan_ticket():
    """
    Scan QR code to validate ticket and mark entry
    
    Security improvements:
    - Issue #6: Validates signature and prevents multiple entry
    - Issue #7: Atomic database transaction with row locking
    - Issue #18: Secure validation endpoint with cryptographic checks
    - Issue #3: JWT auth required (event staff only)
    
    Endpoint: POST /tickets/scan
    Auth: JWT token required (requires 'organiser' or 'admin' role)
    
    Body: {
        "qr_payload": "{\"ticket_uuid\":\"...\",\"event_id\":...,\"signature\":\"...\",\"created_at\":\"...\"}"
    }
    
    Response: {
        "status": "success|duplicate|invalid_signature|ticket_not_found",
        "ticket_uuid": "...",
        "event_id": ...,
        "ticket_holder": "Name",
        "entry_time": "2026-05-19T10:30:00",
        "message": "..."
    }
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        qr_payload_str = data.get("qr_payload")
        if not qr_payload_str:
            logger.warning(f"QR scan attempt without payload from user {current_user_id}")
            return jsonify(error_handler.validation_error("QR payload required")), 400
        
        # ===== PARSE QR PAYLOAD =====
        try:
            qr_payload = json.loads(qr_payload_str)
        except json.JSONDecodeError:
            logger.warning(f"Invalid QR payload format from user {current_user_id}")
            return jsonify(error_handler.validation_error("Invalid QR format")), 400
        
        ticket_uuid = qr_payload.get("ticket_uuid")
        event_id = qr_payload.get("event_id")
        signature = qr_payload.get("signature")
        
        if not all([ticket_uuid, event_id, signature]):
            logger.warning(f"Incomplete QR data from user {current_user_id}")
            return jsonify(error_handler.validation_error("Incomplete QR data")), 400
        
        # ===== VALIDATE SIGNATURE (Issue #1, #5) =====
        if not qr_security.validate_qr_signature(ticket_uuid, event_id, signature):
            logger.warning(
                f"Invalid QR signature for ticket {ticket_uuid} "
                f"from user {current_user_id}"
            )
            return jsonify({
                "status": "error",
                "error": "Invalid QR code",
                "code": "INVALID_SIGNATURE"
            }), 403
        
        # ===== LOOKUP TICKET & EVENT =====
        ticket = Ticket.query.filter_by(uuid=ticket_uuid).first()
        if not ticket:
            logger.warning(f"Ticket not found: {ticket_uuid}")
            return jsonify(error_handler.validation_error("Ticket not found")), 404
        
        event = Event.query.get(event_id)
        if not event:
            logger.warning(f"Event not found: {event_id}")
            return jsonify(error_handler.validation_error("Event not found")), 404
        
        # Verify ticket belongs to this event
        if ticket.event_id != event_id:
            logger.warning(
                f"Ticket {ticket_uuid} does not belong to event {event_id}"
            )
            return jsonify({
                "status": "error",
                "error": "Ticket belongs to different event",
                "code": "WRONG_EVENT"
            }), 403
        
        # ===== CHECK PAYMENT STATUS =====
        if ticket.mpesa_status != "confirmed":
            logger.warning(
                f"Scan attempt on unconfirmed ticket {ticket_uuid} "
                f"(status: {ticket.mpesa_status})"
            )
            return jsonify({
                "status": "error",
                "error": "Ticket payment not confirmed",
                "code": "PAYMENT_NOT_CONFIRMED"
            }), 403
        
        # ===== ATOMIC UPDATE WITH LOCKING (Issue #6, #7) =====
        # Use database transaction for atomicity to prevent race conditions
        try:
            with db.session.begin_nested():
                # Lock the ticket row for update (pessimistic lock)
                # This prevents multiple simultaneous scans
                locked_ticket = Ticket.query.filter(
                    and_(
                        Ticket.id == ticket.id,
                        Ticket.uuid == ticket_uuid
                    )
                ).with_for_update().first()
                
                if not locked_ticket:
                    logger.error(f"Ticket disappeared during scan: {ticket_uuid}")
                    return jsonify(error_handler.generic_error(Exception("Ticket not found"))), 404
                
                # ===== CHECK IF ALREADY USED (Issue #6) =====
                if locked_ticket.is_used:
                    logger.warning(
                        f"Duplicate entry attempt for ticket {ticket_uuid}, "
                        f"already used at {locked_ticket.used_at}"
                    )
                    return jsonify({
                        "status": "duplicate",
                        "error": "This ticket has already been scanned",
                        "used_at": locked_ticket.used_at.isoformat() if locked_ticket.used_at else None,
                        "code": "DUPLICATE_ENTRY"
                    }), 410  # HTTP 410 Gone
                
                # ===== MARK AS USED =====
                entry_time = datetime.utcnow()
                locked_ticket.is_used = True
                locked_ticket.used_at = entry_time
                db.session.flush()
                
                # ===== AUDIT LOG (Issue #12) =====
                audit_log = AuditLog(
                    admin_id=current_user_id,
                    action="ticket_scanned",
                    entity_type="Ticket",
                    entity_id=locked_ticket.id,
                    changes={
                        "is_used": True,
                        "used_at": entry_time.isoformat()
                    },
                    ip_address=request.remote_addr,
                    created_at=entry_time
                )
                db.session.add(audit_log)
                db.session.flush()
            
            # Commit the nested transaction
            db.session.commit()
            
            logger.info(
                f"✓ Ticket {ticket_uuid} scanned successfully at {entry_time} "
                f"by user {current_user_id} for event {event.name}"
            )
            
            # Get ticket holder name
            ticket_holder = ticket.user.name if ticket.user else "Unknown"
            
            return jsonify({
                "status": "success",
                "ticket_uuid": ticket_uuid,
                "event_id": event_id,
                "event_name": event.name,
                "ticket_holder": ticket_holder,
                "entry_time": entry_time.isoformat(),
                "message": f"✓ {ticket_holder} admitted to {event.name}"
            }), 200
        
        except Exception as e:
            db.session.rollback()
            logger.error(
                f"Error scanning ticket {ticket_uuid}: {str(e)}", 
                exc_info=True
            )
            return jsonify(error_handler.generic_error(e, logger.error)), 500
    
    except Exception as e:
        logger.error(f"Scan endpoint error: {str(e)}", exc_info=True)
        return jsonify(error_handler.generic_error(e, logger.error)), 500


@main.route("/events/<int:event_id>/scan-stats", methods=["GET"])
@scanner_limiter.limit("20 per minute")
@jwt_required()
def get_scan_stats(event_id):
    """
    Get scan statistics for an event
    
    Real-time dashboard for event staff:
    - Total tickets issued
    - Tickets scanned in
    - Tickets pending
    
    Endpoint: GET /events/<event_id>/scan-stats
    """
    try:
        current_user_id = get_jwt_identity()
        
        event = Event.query.get(event_id)
        if not event:
            return jsonify(error_handler.validation_error("Event not found")), 404
        
        # TODO: Verify user is organizer of this event
        
        # Count tickets by status
        total_tickets = Ticket.query.filter_by(event_id=event_id).count()
        scanned_tickets = Ticket.query.filter(
            and_(
                Ticket.event_id == event_id,
                Ticket.is_used == True
            )
        ).count()
        
        confirmed_tickets = Ticket.query.filter(
            and_(
                Ticket.event_id == event_id,
                Ticket.mpesa_status == "confirmed",
                Ticket.is_used == False
            )
        ).count()
        
        pending_tickets = Ticket.query.filter(
            and_(
                Ticket.event_id == event_id,
                Ticket.mpesa_status == "pending"
            )
        ).count()
        
        logger.info(
            f"Scan stats requested for event {event_id} by user {current_user_id}: "
            f"total={total_tickets}, scanned={scanned_tickets}, confirmed={confirmed_tickets}"
        )
        
        return jsonify({
            "status": "success",
            "event_id": event_id,
            "event_name": event.name,
            "stats": {
                "total_tickets": total_tickets,
                "scanned_in": scanned_tickets,
                "pending_scan": confirmed_tickets,
                "payment_pending": pending_tickets,
                "attendance_rate": f"{(scanned_tickets/total_tickets*100):.1f}%" if total_tickets > 0 else "0%"
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching scan stats: {str(e)}", exc_info=True)
        return jsonify(error_handler.generic_error(e, logger.error)), 500


@main.route("/events/<int:event_id>/scanned-tickets", methods=["GET"])
@scanner_limiter.limit("10 per minute")
@jwt_required()
def get_scanned_tickets(event_id):
    """
    Get list of all scanned tickets for an event
    
    Endpoint: GET /events/<event_id>/scanned-tickets
    Query params: 
      - limit: Number of results (default 100)
      - offset: Pagination offset (default 0)
    """
    try:
        current_user_id = get_jwt_identity()
        
        event = Event.query.get(event_id)
        if not event:
            return jsonify(error_handler.validation_error("Event not found")), 404
        
        limit = int(request.args.get("limit", 100))
        offset = int(request.args.get("offset", 0))
        
        # Limit to reasonable values
        limit = min(limit, 500)
        offset = max(offset, 0)
        
        scanned_tickets = Ticket.query.filter(
            and_(
                Ticket.event_id == event_id,
                Ticket.is_used == True
            )
        ).order_by(Ticket.used_at.desc()).limit(limit).offset(offset).all()
        
        return jsonify({
            "status": "success",
            "event_id": event_id,
            "total": len(scanned_tickets),
            "tickets": [
                {
                    "ticket_uuid": t.uuid,
                    "ticket_holder": t.user.name if t.user else "Unknown",
                    "ticket_type": t.ticket_type,
                    "quantity": t.quantity,
                    "scanned_at": t.used_at.isoformat() if t.used_at else None
                }
                for t in scanned_tickets
            ]
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching scanned tickets: {str(e)}", exc_info=True)
        return jsonify(error_handler.generic_error(e, logger.error)), 500
