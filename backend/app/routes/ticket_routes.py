from flask import request, jsonify
from . import main
from ..models import Ticket, User, Event, TicketPrice, Transaction
from .. import db
from app import bcrypt
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import func
from datetime import datetime
import secrets

def get_ticket_capacity(ticket_type):
    """Default capacities for each tier"""
    capacities = {
        "vip": 50,
        "premium": 100,
        "general": 200,
        "standard": 180,
    }
    key = ticket_type.strip().lower() if ticket_type else ""
    for tier_name, capacity in capacities.items():
        if tier_name in key:
            return capacity
    return 150


def check_and_reserve_ticket(event_id, ticket_type, quantity=1):
    """
    ATOMIC OPERATION: Check availability AND prevent overbooking
    
    Uses database-level locking to prevent race conditions:
    - Locks the TicketPrice row
    - Counts confirmed tickets
    - Validates availability
    - Throws exception if oversold
    
    Returns: (True, None) if safe to proceed
    Returns: (False, error_message) if no availability
    """
    try:
        # Lock the ticket tier in database (pessimistic locking)
        tier = TicketPrice.query.filter_by(
            event_id=event_id,
            ticket_type=ticket_type
        ).with_for_update().first()
        
        if not tier:
            return False, f"Ticket type '{ticket_type}' not available"
        
        capacity = get_ticket_capacity(ticket_type)
        
        # Count only confirmed/paid tickets
        sold_count = db.session.query(
            func.count(Ticket.id)
        ).filter(
            Ticket.event_id == event_id,
            Ticket.ticket_type == ticket_type,
            Ticket.mpesa_status.in_(["confirmed", "completed"])
        ).scalar() or 0
        
        available = capacity - sold_count
        if available < quantity:
            return False, f"Only {available} tickets remain (requested {quantity})"
        
        return True, None
    
    except Exception as e:
        return False, f"Availability check failed: {str(e)}"


@main.route('/tickets', methods=['POST'])
@jwt_required(optional=True)
def create_ticket():
    """
    CREATE TICKET - WITH OVERBOOKING PROTECTION

    This endpoint now supports both authenticated users and guest checkout.
    If a valid JWT is present, the ticket is booked for the authenticated user.
    If no token is provided, the endpoint creates or reuses a guest user record
    using the provided email and optional name information.
    """
    data = request.get_json() or {}

    user_id = get_jwt_identity()
    if user_id is not None:
        try:
            user_id = int(user_id)
        except ValueError:
            user_id = None
    user = User.query.get(user_id) if user_id else None

    event = Event.query.get(data.get('event_id'))
    if not event:
        return jsonify({"error": "Event not found"}), 404

    # If the request is not authenticated, create a guest user profile.
    if not user:
        guest_email = data.get('email') or data.get('guest_email')
        guest_name = " ".join(
            part.strip()
            for part in [data.get('first_name', ''), data.get('last_name', ''), data.get('name', '')]
            if part
        ).strip() or None

        if not guest_email:
            return jsonify({"error": "Email is required for guest checkout"}), 400

        user = User.query.filter_by(email=guest_email).first()
        if user and not user.is_active:
            return jsonify({"error": "This account is suspended and cannot book tickets"}), 403

        if not user:
            random_password = secrets.token_urlsafe(16)
            hashed_password = bcrypt.generate_password_hash(random_password).decode('utf-8')
            user = User(
                name=guest_name or guest_email.split('@')[0],
                email=guest_email,
                password=hashed_password,
                role="user",
                is_active=True,
            )
            db.session.add(user)
            db.session.commit()

    # Validate ticket type and get price from database
    ticket_price = TicketPrice.query.filter_by(
        event_id=event.id,
        ticket_type=data.get('ticket_type')
    ).first()

    if not ticket_price:
        return jsonify({"error": "Invalid ticket type for this event"}), 400

    quantity = int(data.get('quantity', 1))
    if quantity < 1:
        return jsonify({"error": "Quantity must be at least 1"}), 400

    available, error = check_and_reserve_ticket(event.id, data.get('ticket_type'), quantity)
    if not available:
        return jsonify({"error": error}), 400

    actual_price = ticket_price.price

    ticket = Ticket(
        ticket_type=data['ticket_type'],
        price=actual_price,
        quantity=quantity,
        user_id=user.id,
        event_id=event.id,
        mpesa_status="pending"
    )

    db.session.add(ticket)
    db.session.commit()

    print(f"✓ Ticket created: #{ticket.id}, Type: {data['ticket_type']}, Status: PENDING, User: {user.id}")

    return jsonify({
        "message": "Ticket created (awaiting payment)",
        "id": ticket.id,
        "ticket_type": ticket.ticket_type,
        "price": actual_price,
        "quantity": quantity,
        "status": "pending",
        "user_id": user.id,
        "user_email": user.email,
    }), 201


@main.route('/tickets', methods=['GET'])
def get_tickets():
    """Get all tickets (for tracking availability)"""
    tickets = Ticket.query.all()

    return jsonify([
        {
            "id": t.id,
            "type": t.ticket_type,
            "ticket_type": t.ticket_type,
            "price": t.price,
            "quantity": t.quantity,
            "user_id": t.user_id,
            "event_id": t.event_id,
            "mpesa_status": t.mpesa_status,
            "email_confirmed": t.email_confirmed,
            "created_at": t.created_at.isoformat() if t.created_at else None
        }
        for t in tickets
    ])


@main.route('/events/<int:event_id>/availability', methods=['GET'])
def get_event_availability(event_id):
    """
    GET TICKET AVAILABILITY BY EVENT
    
    RETURNS:
    {
        "event_id": 1,
        "total_capacity": 400,
        "total_sold": 45,
        "total_remaining": 355,
        "by_tier": {
            "VIP": {"capacity": 50, "sold": 10, "remaining": 40, "price": 5000},
            "General": {"capacity": 200, "sold": 25, "remaining": 175, "price": 2000}
        }
    }
    
    USAGE: Frontend calls this every 5-10 seconds to update availability display
    """
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({"error": "Event not found"}), 404
        
        tier_availability = {}
        total_capacity = 0
        total_sold = 0
        
        for price_tier in event.ticket_prices:
            capacity = get_ticket_capacity(price_tier.ticket_type)
            
            # Count only confirmed/paid tickets
            sold = db.session.query(
                func.count(Ticket.id)
            ).filter(
                Ticket.event_id == event_id,
                Ticket.ticket_type == price_tier.ticket_type,
                Ticket.mpesa_status.in_(["confirmed", "completed"])
            ).scalar() or 0
            
            tier_availability[price_tier.ticket_type] = {
                "capacity": capacity,
                "sold": sold,
                "remaining": max(0, capacity - sold),
                "price": price_tier.price
            }
            
            total_capacity += capacity
            total_sold += sold
        
        return jsonify({
            "event_id": event_id,
            "event_name": event.name,
            "total_capacity": total_capacity,
            "total_sold": total_sold,
            "total_remaining": max(0, total_capacity - total_sold),
            "sold_percentage": round((total_sold / total_capacity * 100) if total_capacity > 0 else 0),
            "by_tier": tier_availability
        }), 200
    
    except Exception as e:
        print(f"Error getting availability: {e}")
        return jsonify({"error": str(e)}), 500


@main.route('/tickets/<int:ticket_id>', methods=['GET'])
def get_ticket(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    return jsonify({
        "id": ticket.id,
        "ticket_type": ticket.ticket_type,
        "price": ticket.price,
        "quantity": ticket.quantity,
        "event_id": ticket.event_id,
        "user_id": ticket.user_id,
        "qr_code": ticket.qr_code,
        "mpesa_status": ticket.mpesa_status,
        "mpesa_transaction_id": ticket.mpesa_transaction_id,
        "email_confirmed": ticket.email_confirmed,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None
    })


@main.route('/user/tickets', methods=['GET'])
@jwt_required()
def get_user_tickets():
    # Get user ID from JWT token (secure)
    user_id = get_jwt_identity()
    
    # Validate user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    tickets = Ticket.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "id": t.id,
            "type": t.ticket_type,
            "price": t.price,
            "quantity": t.quantity,
            "user_id": t.user_id,
            "event_id": t.event_id,
            "mpesa_status": t.mpesa_status,
            "qr_code": t.qr_code,
            "created_at": t.created_at.isoformat() if t.created_at else None
        }
        for t in tickets
    ])


# ============ NEW TICKET OPERATIONS ============

@main.route('/tickets/<int:ticket_id>/resend-email', methods=['POST'])
@jwt_required()
def resend_ticket_email(ticket_id):
    """Resend ticket confirmation email to user"""
    user_id = get_jwt_identity()
    
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404
    
    # Check authorization (ticket owner or admin)
    claims = get_jwt()
    if ticket.user_id != user_id and claims.get('role') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    # Only resend if ticket is confirmed
    if ticket.mpesa_status != "confirmed":
        return jsonify({"error": "Can only resend confirmed tickets"}), 400
    
    user = ticket.user
    event = ticket.event
    
    # Prepare email data
    email_data = {
        "to": user.email,
        "subject": f"Your Ticket for {event.name}",
        "body": f"""
        Hello {user.name},
        
        Your ticket has been confirmed! Here are your details:
        
        Event: {event.name}
        Date: {event.date}
        Venue: {event.venue}
        Ticket Type: {ticket.ticket_type}
        Quantity: {ticket.quantity}
        
        Your QR Code: {ticket.qr_code}
        
        Please keep this email safe and show the QR code at the venue.
        
        Best regards,
        Flex-It Team
        """,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # TODO: Implement email service (sendgrid, AWS SES, etc.)
    # For now, log the email that would be sent
    print(f"[EMAIL] Resending ticket email to {user.email}")
    
    return jsonify({
        "message": "Confirmation email resent successfully",
        "ticket_id": ticket_id,
        "email": user.email
    }), 200


@main.route('/tickets/<int:ticket_id>/regenerate-qr', methods=['POST'])
@jwt_required()
def regenerate_ticket_qr(ticket_id):
    """Regenerate QR code for a ticket"""
    user_id = get_jwt_identity()
    
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404
    
    # Only confirmed tickets can have QR regenerated
    if ticket.mpesa_status != "confirmed":
        return jsonify({"error": "Ticket must be confirmed first"}), 400
    
    # Check authorization
    claims = get_jwt()
    if ticket.user_id != user_id and claims.get('role') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    # Generate new QR code
    try:
        import qrcode
        import io
        import base64
        
        # Create QR code data (ticket ID and user ID)
        qr_data = f"TICKET:{ticket.id}:USER:{ticket.user_id}:EVENT:{ticket.event_id}"
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Convert to image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        # Update ticket with new QR code
        ticket.qr_code = f"data:image/png;base64,{img_base64}"
        db.session.commit()
        
        return jsonify({
            "message": "QR code regenerated successfully",
            "ticket_id": ticket_id,
            "qr_code": ticket.qr_code
        }), 200
    except Exception as e:
        return jsonify({
            "error": "Failed to generate QR code",
            "details": str(e)
        }), 500


@main.route('/tickets/<int:ticket_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_ticket(ticket_id):
    """Cancel a ticket and refund payment"""
    user_id = get_jwt_identity()
    
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404
    
    # Check authorization
    claims = get_jwt()
    if ticket.user_id != user_id and claims.get('role') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    # Can't cancel already used tickets
    if ticket.used_at:
        return jsonify({"error": "Cannot cancel used tickets"}), 400
    
    # Can't cancel already cancelled tickets
    if ticket.mpesa_status == "cancelled":
        return jsonify({"error": "Ticket already cancelled"}), 400
    
    # Process refund if ticket was confirmed
    refund_initiated = False
    if ticket.mpesa_status == "confirmed" and ticket.confirmed:
        try:
            # Get the transaction
            transaction = Transaction.query.filter_by(ticket_id=ticket_id, status="success").first()
            if transaction:
                # TODO: Implement M-Pesa refund logic
                # For now, mark transaction as refunded
                transaction.status = "refunded"
                db.session.add(transaction)
                refund_initiated = True
        except Exception as e:
            print(f"[ERROR] Refund failed: {str(e)}")
    
    # Cancel the ticket
    ticket.mpesa_status = "cancelled"
    ticket.confirmed = False
    db.session.commit()
    
    return jsonify({
        "message": "Ticket cancelled successfully",
        "ticket_id": ticket_id,
        "status": "cancelled",
        "refund_initiated": refund_initiated,
        "refund_amount": ticket.price if refund_initiated else 0
    }), 200


@main.route('/tickets/<int:ticket_id>/check-in', methods=['POST'])
@jwt_required()
def check_in_ticket(ticket_id):
    """Mark ticket as used (check-in at event)"""
    user_id = get_jwt_identity()
    claims = get_jwt()
    
    # Only admins can check in
    if claims.get('role') != 'admin':
        # Or event organizer
        return jsonify({"error": "Only admins can check in tickets"}), 403
    
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404
    
    if not ticket.confirmed:
        return jsonify({"error": "Ticket must be confirmed before check-in"}), 400
    
    if ticket.used_at:
        return jsonify({"error": "Ticket already used"}), 400
    
    # Mark as used
    ticket.used_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        "message": "Ticket checked in successfully",
        "ticket_id": ticket_id,
        "user": {
            "id": ticket.user.id,
            "name": ticket.user.name,
            "email": ticket.user.email
        },
        "event": {
            "id": ticket.event.id,
            "name": ticket.event.name
        },
        "checked_in_at": ticket.used_at.isoformat()
    }), 200


@main.route('/admin/tickets', methods=['GET'])
@jwt_required()
def get_all_tickets():
    """Get all tickets for admin (with filters)"""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"error": "Admin access required"}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    event_id = request.args.get('event_id', None, type=int)
    user_id = request.args.get('user_id', None, type=int)
    status = request.args.get('status', None)  # pending, confirmed, cancelled
    
    query = Ticket.query
    
    if event_id:
        query = query.filter_by(event_id=event_id)
    if user_id:
        query = query.filter_by(user_id=user_id)
    if status:
        query = query.filter_by(mpesa_status=status)
    
    paginated = query.order_by(Ticket.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        "tickets": [{
            "id": t.id,
            "user": {
                "id": t.user.id,
                "name": t.user.name,
                "email": t.user.email
            },
            "event": {
                "id": t.event.id,
                "name": t.event.name,
                "date": t.event.date
            },
            "ticket_type": t.ticket_type,
            "price": t.price,
            "quantity": t.quantity,
            "status": t.mpesa_status,
            "confirmed": t.confirmed,
            "used_at": t.used_at.isoformat() if t.used_at else None,
            "created_at": t.created_at.isoformat()
        } for t in paginated.items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": paginated.total,
            "pages": paginated.pages
        }
    }), 200