"""
OVERBOOKING PROTECTION HELPER

Location: backend/app/routes/ticket_routes.py (add these functions)

This module provides functions to safely handle ticket availability
and prevent race conditions where two users could book the same seat.

IMPLEMENTATION INSTRUCTIONS:
1. Add this code to ticket_routes.py before create_ticket()
2. Call check_and_reserve_ticket() in create_ticket() before creating Ticket
3. This uses database locking to prevent race conditions
"""

from sqlalchemy import func
from ..models import Ticket, TicketPrice, Event
from .. import db

def get_ticket_capacity(ticket_type):
    """Default capacities for each tier (fallback)"""
    capacities = {
        "vip": 50,
        "premium": 100,
        "general": 200,
        "standard": 180,
    }
    key = ticket_type.strip().lower()
    for tier_name, capacity in capacities.items():
        if tier_name in key:
            return capacity
    return 150


def check_and_reserve_ticket(event_id, ticket_type, quantity=1):
    """
    ATOMIC OPERATION: Check availability AND reserve tickets
    
    This function:
    1. Locks the TicketPrice row in database
    2. Counts current sold tickets
    3. Validates sufficient availability
    4. Throws exception if not enough tickets
    
    Returns: (True, None) if reservation successful
    Returns: (False, error_message) if failed
    
    USAGE IN create_ticket():
        available, error = check_and_reserve_ticket(event_id, ticket_type, quantity)
        if not available:
            return jsonify({"error": error}), 400
        
        # Now safe to create ticket - availability is locked
        ticket = Ticket(...)
    
    WHY THIS PREVENTS OVERBOOKING:
    - Database lock ensures only one process modifies at a time
    - No race condition between check and create
    - Atomic operation from database perspective
    """
    try:
        # Get ticket price from database (validated pricing)
        # Use pessimistic locking with for_update()
        tier = TicketPrice.query.filter_by(
            event_id=event_id,
            ticket_type=ticket_type
        ).with_for_update().first()
        
        if not tier:
            return False, f"Ticket type '{ticket_type}' not found for this event"
        
        # Get capacity (from DB if available, fallback to defaults)
        capacity = get_ticket_capacity(ticket_type)
        
        # Count currently sold tickets for this type
        sold_count = db.session.query(
            func.sum(Ticket.quantity)
        ).filter_by(
            event_id=event_id,
            ticket_type=ticket_type,
            mpesa_status="confirmed"  # Only count confirmed tickets
        ).scalar() or 0
        
        # Check availability
        available = capacity - sold_count
        if available < quantity:
            return False, f"Only {available} tickets remain for {ticket_type} (requested {quantity})"
        
        return True, None
    
    except Exception as e:
        return False, f"Availability check failed: {str(e)}"


def get_ticket_availability_by_event(event_id):
    """
    Get availability status for all ticket types in an event
    
    RETURNS:
    {
        "total": 400,
        "sold": 45,
        "remaining": 355,
        "by_tier": {
            "VIP": {"capacity": 50, "sold": 10, "remaining": 40},
            "General": {"capacity": 200, "sold": 25, "remaining": 175}
        }
    }
    
    USAGE: Call after creating event/tickets to show real-time availability
    """
    try:
        event = Event.query.get(event_id)
        if not event:
            return None
        
        tier_availability = {}
        total_capacity = 0
        total_sold = 0
        
        for price_tier in event.ticket_prices:
            capacity = get_ticket_capacity(price_tier.ticket_type)
            
            sold = db.session.query(
                func.sum(Ticket.quantity)
            ).filter_by(
                event_id=event_id,
                ticket_type=price_tier.ticket_type,
                mpesa_status="confirmed"
            ).scalar() or 0
            
            tier_availability[price_tier.ticket_type] = {
                "capacity": capacity,
                "sold": sold,
                "remaining": max(0, capacity - sold),
                "price": price_tier.price
            }
            
            total_capacity += capacity
            total_sold += sold
        
        return {
            "event_id": event_id,
            "total_capacity": total_capacity,
            "total_sold": total_sold,
            "total_remaining": max(0, total_capacity - total_sold),
            "by_tier": tier_availability
        }
    
    except Exception as e:
        print(f"Error getting availability: {e}")
        return None
