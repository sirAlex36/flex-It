"""
Ticket Service
Issue #17: Monolithic refactoring → Service layer
Encapsulates ticket-related business logic
"""

import logging
from datetime import datetime
from app import db
from app.models import Ticket, Event

logger = logging.getLogger(__name__)


class TicketService:
    """
    Service for ticket management
    """
    
    @staticmethod
    def get_ticket_with_verification(ticket_uuid, user_id=None):
        """
        Get ticket by UUID with optional ownership verification
        
        Args:
            ticket_uuid: Ticket UUID
            user_id: If provided, verify ownership
        
        Returns:
            Ticket object or None
        """
        ticket = Ticket.query.filter_by(uuid=ticket_uuid).first()
        
        if not ticket:
            logger.warning(f"Ticket not found: {ticket_uuid}")
            return None
        
        if user_id and ticket.user_id != user_id:
            logger.warning(
                f"Ownership check failed for ticket {ticket_uuid} "
                f"by user {user_id}"
            )
            return None
        
        return ticket
    
    @staticmethod
    def verify_ticket_for_payment(ticket_id, user_id):
        """
        Verify ticket is eligible for payment
        
        Args:
            ticket_id: Ticket ID
            user_id: User attempting payment
        
        Returns:
            tuple: (is_eligible, ticket_object, error_message)
        """
        ticket = Ticket.query.get(ticket_id)
        
        if not ticket:
            return False, None, "Ticket not found"
        
        if ticket.user_id != user_id:
            return False, None, "Unauthorized"
        
        if ticket.mpesa_status == "confirmed":
            return False, None, "Already paid"
        
        if ticket.mpesa_status == "failed":
            return True, ticket, None  # Can retry after failure
        
        return True, ticket, None
    
    @staticmethod
    def verify_ticket_for_scan(ticket_uuid, event_id):
        """
        Verify ticket is eligible for entry scan
        
        Args:
            ticket_uuid: Ticket UUID
            event_id: Event ID
        
        Returns:
            tuple: (is_eligible, ticket_object, error_message)
        """
        ticket = Ticket.query.filter_by(uuid=ticket_uuid).first()
        
        if not ticket:
            return False, None, "Ticket not found"
        
        if ticket.event_id != event_id:
            return False, None, "Ticket belongs to different event"
        
        if ticket.mpesa_status != "confirmed":
            return False, None, "Payment not confirmed"
        
        if ticket.is_used:
            return False, None, "Already scanned"
        
        return True, ticket, None
    
    @staticmethod
    def mark_ticket_used(ticket_id):
        """
        Mark ticket as used for entry
        
        Uses atomic update to prevent race conditions
        
        Args:
            ticket_id: Ticket ID
        
        Returns:
            dict: {'status': 'success|error', 'message': '...'}
        """
        try:
            with db.session.begin_nested():
                # Pessimistic lock
                ticket = Ticket.query.filter_by(id=ticket_id).with_for_update().first()
                
                if not ticket:
                    return {"status": "error", "message": "Ticket not found"}
                
                if ticket.is_used:
                    return {"status": "duplicate", "message": "Already scanned"}
                
                ticket.is_used = True
                ticket.used_at = datetime.utcnow()
                db.session.flush()
            
            db.session.commit()
            logger.info(f"✓ Ticket {ticket_id} marked as used")
            
            return {
                "status": "success",
                "used_at": ticket.used_at.isoformat()
            }
        
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error marking ticket used: {str(e)}", exc_info=True)
            return {"status": "error", "message": str(e)}
    
    @staticmethod
    def get_event_tickets_by_status(event_id, status):
        """
        Get tickets for an event filtered by status
        
        Args:
            event_id: Event ID
            status: mpesa_status filter
        
        Returns:
            list: Ticket objects
        """
        tickets = Ticket.query.filter_by(
            event_id=event_id,
            mpesa_status=status
        ).all()
        
        return tickets
    
    @staticmethod
    def get_ticket_stats(event_id):
        """
        Get ticket statistics for an event
        
        Args:
            event_id: Event ID
        
        Returns:
            dict: Ticket counts by status
        """
        from sqlalchemy import and_
        
        total = Ticket.query.filter_by(event_id=event_id).count()
        confirmed = Ticket.query.filter_by(
            event_id=event_id,
            mpesa_status="confirmed"
        ).count()
        scanned = Ticket.query.filter(
            and_(
                Ticket.event_id == event_id,
                Ticket.is_used == True
            )
        ).count()
        pending = Ticket.query.filter_by(
            event_id=event_id,
            mpesa_status="pending"
        ).count()
        failed = Ticket.query.filter_by(
            event_id=event_id,
            mpesa_status="failed"
        ).count()
        
        return {
            "total": total,
            "confirmed": confirmed,
            "scanned": scanned,
            "pending": pending,
            "failed": failed,
            "attendance_rate": f"{(scanned/total*100):.1f}%" if total > 0 else "0%"
        }
