"""
Organiser routes for managing their own events and viewing analytics
"""
from flask import request, jsonify
from . import main
from ..models import Event, TicketPrice, Ticket, User, Transaction, AuditLog
from .. import db
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from datetime import datetime, timedelta
from functools import wraps
from sqlalchemy import func, or_

def organiser_required(fn):
    """Decorator to check if user has organiser role"""
    @jwt_required()
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get('role') not in ['organiser', 'admin']:  # admin can also manage events
            return jsonify({"error": "Organiser access required"}), 403
        return fn(*args, **kwargs)
    return wrapper


# ============ ORGANISER EVENT MANAGEMENT ============

@main.route('/organiser/events', methods=['POST'])
@organiser_required
def create_organiser_event():
    """Organiser creates a new event"""
    organiser_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('name') or not data.get('date') or not data.get('venue'):
        return jsonify({"error": "name, date, and venue are required"}), 400
    
    # Validate event date is in the future
    try:
        event_date = datetime.fromisoformat(data.get('date'))
        if event_date < datetime.now():
            return jsonify({"error": "Event date must be in the future"}), 400
    except:
        return jsonify({"error": "Invalid date format. Use ISO format (YYYY-MM-DD)"}), 400

    event = Event(
        name=data['name'],
        date=data['date'],
        venue=data['venue'],
        description=data.get('description'),
        image=data.get('image'),
        organiser_id=organiser_id
    )

    db.session.add(event)
    db.session.commit()

    # Add ticket prices if provided
    ticket_prices = data.get('ticket_prices', [])
    for price_data in ticket_prices:
        if 'ticket_type' in price_data and 'price' in price_data and price_data.get('price', 0) > 0:
            ticket_price = TicketPrice(
                event_id=event.id,
                ticket_type=price_data['ticket_type'],
                price=price_data['price']
            )
            db.session.add(ticket_price)
    
    db.session.commit()

    # Log this action
    log = AuditLog(
        admin_id=organiser_id,
        action=f"Created event: {event.name}",
        entity_type="Event",
        entity_id=event.id,
        changes={"created": True}
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({
        "message": "Event created successfully",
        "id": event.id,
        "event": {
            "id": event.id,
            "name": event.name,
            "date": event.date,
            "venue": event.venue,
            "description": event.description,
            "image": event.image
        }
    }), 201


@main.route('/organiser/events', methods=['GET'])
@organiser_required
def get_organiser_events():
    """Get all events for the logged-in organiser"""
    organiser_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    query = Event.query.filter_by(organiser_id=organiser_id)
    paginated = query.paginate(page=page, per_page=per_page)
    
    result = []
    for e in paginated.items:
        event_data = {
            "id": e.id,
            "name": e.name,
            "date": e.date,
            "venue": e.venue,
            "description": e.description,
            "image": e.image,
            "created_at": e.created_at.isoformat() if e.created_at else None,
            "ticket_prices": [
                {
                    "id": tp.id,
                    "ticket_type": tp.ticket_type,
                    "price": tp.price
                }
                for tp in e.ticket_prices
            ],
            "tickets_sold": len(e.tickets),
            "total_revenue": sum(t.price for t in e.tickets if t.confirmed)
        }
        result.append(event_data)

    return jsonify({
        "events": result,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": paginated.total,
            "pages": paginated.pages
        }
    }), 200


@main.route('/organiser/events/<int:event_id>', methods=['GET'])
@organiser_required
def get_organiser_event(event_id):
    """Get a specific event for organiser (must own it)"""
    organiser_id = get_jwt_identity()
    event = Event.query.get(event_id)
    
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    if event.organiser_id != organiser_id and get_jwt().get('role') != 'admin':
        return jsonify({"error": "Unauthorised: This is not your event"}), 403

    tickets = Ticket.query.filter_by(event_id=event_id).all()
    confirmed_tickets = [t for t in tickets if t.confirmed]
    
    return jsonify({
        "id": event.id,
        "name": event.name,
        "date": event.date,
        "venue": event.venue,
        "description": event.description,
        "image": event.image,
        "created_at": event.created_at.isoformat() if event.created_at else None,
        "ticket_prices": [
            {
                "id": tp.id,
                "ticket_type": tp.ticket_type,
                "price": tp.price
            }
            for tp in event.ticket_prices
        ],
        "stats": {
            "total_tickets_sold": len(confirmed_tickets),
            "total_revenue": sum(t.price for t in confirmed_tickets),
            "total_attendees": len(confirmed_tickets),
            "capacity": sum(t.quantity for t in confirmed_tickets)
        }
    }), 200


@main.route('/organiser/events/<int:event_id>', methods=['PUT'])
@organiser_required
def update_organiser_event(event_id):
    """Update an event (organiser must own it)"""
    organiser_id = get_jwt_identity()
    event = Event.query.get(event_id)
    
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    if event.organiser_id != organiser_id and get_jwt().get('role') != 'admin':
        return jsonify({"error": "Unauthorised: This is not your event"}), 403

    data = request.get_json()
    old_data = {
        "name": event.name,
        "date": event.date,
        "venue": event.venue,
        "description": event.description,
        "image": event.image
    }

    event.name = data.get('name', event.name)
    event.date = data.get('date', event.date)
    event.venue = data.get('venue', event.venue)
    event.description = data.get('description', event.description)
    event.image = data.get('image', event.image)

    # Update ticket prices if provided
    if 'ticket_prices' in data:
        TicketPrice.query.filter_by(event_id=event_id).delete()
        ticket_prices = data.get('ticket_prices', [])
        for price_data in ticket_prices:
            if 'ticket_type' in price_data and 'price' in price_data and price_data.get('price', 0) > 0:
                ticket_price = TicketPrice(
                    event_id=event.id,
                    ticket_type=price_data['ticket_type'],
                    price=price_data['price']
                )
                db.session.add(ticket_price)

    db.session.commit()

    # Log this action
    log = AuditLog(
        admin_id=organiser_id,
        action=f"Updated event: {event.name}",
        entity_type="Event",
        entity_id=event_id,
        changes={"old": old_data, "new": {"name": event.name, "date": event.date, "venue": event.venue}}
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Event updated successfully"}), 200


@main.route('/organiser/events/<int:event_id>', methods=['DELETE'])
@organiser_required
def delete_organiser_event(event_id):
    """Delete an event (organiser must own it)"""
    organiser_id = get_jwt_identity()
    event = Event.query.get(event_id)
    
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    if event.organiser_id != organiser_id and get_jwt().get('role') != 'admin':
        return jsonify({"error": "Unauthorised: This is not your event"}), 403

    # Log this action before deleting
    log = AuditLog(
        admin_id=organiser_id,
        action=f"Deleted event: {event.name}",
        entity_type="Event",
        entity_id=event_id,
        changes={"deleted": True}
    )
    db.session.add(log)

    db.session.delete(event)
    db.session.commit()

    return jsonify({"message": "Event deleted successfully"}), 200


# ============ ORGANISER TICKET MANAGEMENT ============

@main.route('/organiser/events/<int:event_id>/tickets', methods=['GET'])
@organiser_required
def get_event_tickets(event_id):
    """Get all tickets for an event (organiser must own it)"""
    organiser_id = get_jwt_identity()
    event = Event.query.get(event_id)
    
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    if event.organiser_id != organiser_id and get_jwt().get('role') != 'admin':
        return jsonify({"error": "Unauthorised: This is not your event"}), 403

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status', None)  # pending, confirmed, used, cancelled
    
    query = Ticket.query.filter_by(event_id=event_id)
    
    if status == 'confirmed':
        query = query.filter_by(confirmed=True)
    elif status == 'used':
        query = query.filter(Ticket.used_at != None)
    
    paginated = query.paginate(page=page, per_page=per_page)
    
    tickets_data = []
    for ticket in paginated.items:
        user = User.query.get(ticket.user_id)
        tickets_data.append({
            "id": ticket.id,
            "ticket_type": ticket.ticket_type,
            "price": ticket.price,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "confirmed": ticket.confirmed,
            "used": ticket.used_at is not None,
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None
        })

    return jsonify({
        "tickets": tickets_data,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": paginated.total,
            "pages": paginated.pages
        }
    }), 200


# ============ ORGANISER ANALYTICS ============

@main.route('/organiser/dashboard-analytics', methods=['GET'])
@organiser_required
def get_organiser_dashboard():
    """Get dashboard analytics for organiser"""
    organiser_id = get_jwt_identity()
    
    # Get organiser's events
    events = Event.query.filter_by(organiser_id=organiser_id).all()
    event_ids = [e.id for e in events]
    
    if not event_ids:
        return jsonify({
            "total_events": 0,
            "total_tickets_sold": 0,
            "total_revenue": 0,
            "upcoming_events": 0,
            "pending_payouts": 0
        }), 200
    
    # Get tickets for organiser's events
    tickets = Ticket.query.filter(Ticket.event_id.in_(event_ids)).all()
    confirmed_tickets = [t for t in tickets if t.confirmed]
    
    # Get upcoming events
    now = datetime.now()
    upcoming_events = [e for e in events if datetime.fromisoformat(e.date) > now]
    
    total_revenue = sum(t.price for t in confirmed_tickets)
    
    return jsonify({
        "total_events": len(events),
        "total_tickets_sold": len(confirmed_tickets),
        "total_revenue": total_revenue,
        "upcoming_events": len(upcoming_events),
        "pending_payouts": total_revenue * 0.8  # Assuming 20% platform fee
    }), 200


@main.route('/organiser/event-performance/<int:event_id>', methods=['GET'])
@organiser_required
def get_organiser_event_performance(event_id):
    """Get performance metrics for a specific event"""
    organiser_id = get_jwt_identity()
    event = Event.query.get(event_id)
    
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    if event.organiser_id != organiser_id and get_jwt().get('role') != 'admin':
        return jsonify({"error": "Unauthorised"}), 403

    tickets = Ticket.query.filter_by(event_id=event_id).all()
    confirmed_tickets = [t for t in tickets if t.confirmed]
    used_tickets = [t for t in tickets if t.used_at]
    
    total_revenue = sum(t.price for t in confirmed_tickets)
    attendance_rate = (len(used_tickets) / len(confirmed_tickets) * 100) if confirmed_tickets else 0

    return jsonify({
        "event_name": event.name,
        "total_tickets_sold": len(confirmed_tickets),
        "total_revenue": total_revenue,
        "attendance_rate": round(attendance_rate, 2),
        "tickets_checked_in": len(used_tickets),
        "revenue_by_ticket_type": __get_revenue_by_type(tickets)
    }), 200


def __get_revenue_by_type(tickets):
    """Helper to calculate revenue by ticket type"""
    revenue_map = {}
    for ticket in tickets:
        if ticket.confirmed:
            if ticket.ticket_type not in revenue_map:
                revenue_map[ticket.ticket_type] = 0
            revenue_map[ticket.ticket_type] += ticket.price
    return revenue_map


# ============ ORGANISER PROFILE ============

@main.route('/organiser/profile', methods=['GET'])
@organiser_required
def get_organiser_profile():
    """Get organiser's profile information"""
    organiser_id = get_jwt_identity()
    user = User.query.get(organiser_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Get event statistics
    events = Event.query.filter_by(organiser_id=organiser_id).all()
    total_tickets = Ticket.query.filter(
        Ticket.event_id.in_([e.id for e in events])
    ).count() if events else 0

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "total_events": len(events),
        "total_tickets_sold": total_tickets,
        "created_at": user.created_at.isoformat()
    }), 200
