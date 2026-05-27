from flask import request, jsonify
from . import main
from ..models import Event, TicketPrice
from .. import db
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime
from functools import wraps
from sqlalchemy import or_

def admin_required(fn):
    """Decorator to check if user has admin role"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

@main.route('/events', methods=['POST'])
@admin_required
def create_event():
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
        image=data.get('image')
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

    return jsonify({"message": "Event created", "id": event.id}), 201


@main.route('/events', methods=['GET'])
def get_events():
    search = request.args.get('search', '').strip()
    venue_filter = request.args.get('venue', '').strip()
    min_price = request.args.get('minPrice', type=float)
    max_price = request.args.get('maxPrice', type=float)
    start_date = request.args.get('startDate', '').strip()
    end_date = request.args.get('endDate', '').strip()
    
    query = Event.query
    
    if search:
        # Search in name, venue, and description
        query = query.filter(
            or_(
                Event.name.ilike(f'%{search}%'),
                Event.venue.ilike(f'%{search}%'),
                Event.description.ilike(f'%{search}%')
            )
        )
    
    if venue_filter:
        query = query.filter(Event.venue.ilike(f'%{venue_filter}%'))
    
    if start_date:
        query = query.filter(Event.date >= start_date)
    
    if end_date:
        query = query.filter(Event.date <= end_date)
    
    events = query.order_by(Event.date.asc()).all()
    
    # Apply price filter after fetching (since prices are in TicketPrice table)
    if min_price is not None or max_price is not None:
        filtered_events = []
        for e in events:
            if e.ticket_prices:
                prices = [tp.price for tp in e.ticket_prices]
                min_ticket_price = min(prices)
                max_ticket_price = max(prices)
                
                if min_price is not None and min_ticket_price < min_price:
                    continue
                if max_price is not None and max_ticket_price > max_price:
                    continue
            filtered_events.append(e)
        events = filtered_events

    result = []
    for e in events:
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
            ]
        }
        result.append(event_data)

    return jsonify(result)


@main.route('/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

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
        ]
    })


@main.route('/events/<int:event_id>', methods=['PUT'])
@admin_required
def update_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    data = request.get_json()
    event.name = data.get('name', event.name)
    event.date = data.get('date', event.date)
    event.venue = data.get('venue', event.venue)
    event.description = data.get('description', event.description)
    event.image = data.get('image', event.image)

    # Update ticket prices if provided
    if 'ticket_prices' in data:
        # Delete existing prices
        TicketPrice.query.filter_by(event_id=event_id).delete()
        
        # Add new prices
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
    return jsonify({"message": "Event updated"})


@main.route('/events/<int:event_id>', methods=['DELETE'])
@admin_required
def delete_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "Event deleted"}), 200


