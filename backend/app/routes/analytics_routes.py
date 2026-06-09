"""
Analytics and reporting endpoints for admin dashboard
"""
from flask import request, jsonify
from app import db
from . import main
from app.models import Event, Ticket, Transaction, User
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime, timedelta
from sqlalchemy import func
from functools import wraps

def admin_required(f):
    """Decorator to check if user is admin"""
    @jwt_required()
    @wraps(f)
    def decorated_function(*args, **kwargs):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function


@main.route('/analytics/dashboard', methods=['GET'])
@admin_required
def get_dashboard_analytics():
    """Get comprehensive dashboard analytics"""
    
    # Total revenue
    total_revenue = db.session.query(db.func.sum(Transaction.amount)).filter_by(status="success").scalar() or 0
    
    # Total users
    total_users = User.query.filter_by(deleted_at=None).count()
    
    # Total events
    total_events = Event.query.count()
    
    # Total tickets sold
    total_tickets = Ticket.query.filter(Ticket.mpesa_status.in_(["confirmed", "completed"])).count()
    
    # Active users (users with tickets in last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_users = db.session.query(db.func.count(db.distinct(Ticket.user_id))).filter(
        Ticket.created_at >= thirty_days_ago
    ).scalar() or 0
    
    # Transactions by status
    transaction_stats = {}
    for status in ['pending', 'success', 'failed', 'cancelled']:
        count = Transaction.query.filter_by(status=status).count()
        transaction_stats[status] = count
    
    # Payment success rate
    successful_payments = Transaction.query.filter_by(status="success").count()
    total_payments = Transaction.query.count()
    success_rate = (successful_payments / total_payments * 100) if total_payments > 0 else 0
    
    # Top events by revenue
    top_events = db.session.query(
        Event.id,
        Event.name,
        db.func.sum(Transaction.amount).label('revenue'),
        db.func.count(Ticket.id).label('tickets_sold')
    ).join(Ticket, Event.id == Ticket.event_id)\
     .join(Transaction, Ticket.id == Transaction.ticket_id)\
     .filter(Transaction.status == "success")\
     .group_by(Event.id, Event.name)\
     .order_by(db.desc('revenue'))\
     .limit(5).all()
    
    return jsonify({
        "summary": {
            "total_revenue": total_revenue,
            "total_users": total_users,
            "total_events": total_events,
            "total_tickets_sold": total_tickets,
            "active_users_30d": active_users
        },
        "transactions": {
            "stats": transaction_stats,
            "success_rate": round(success_rate, 2)
        },
        "top_events": [{
            "event_id": e[0],
            "name": e[1],
            "revenue": e[2],
            "tickets_sold": e[3]
        } for e in top_events],
        "currency": "KES"
    }), 200


@main.route('/analytics/events/<int:event_id>/performance', methods=['GET'])
@admin_required
def get_event_performance(event_id):
    """Get detailed performance metrics for a specific event"""
    
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    # Total tickets sold by tier
    tier_sales = {}
    total_revenue = 0
    total_tickets = 0
    
    for ticket_price in event.ticket_prices:
        tickets = Ticket.query.filter(
            Ticket.event_id == event_id,
            Ticket.ticket_type == ticket_price.ticket_type,
            Ticket.mpesa_status.in_(["confirmed", "completed"])
        ).all()
        
        revenue = sum(t.price for t in tickets)
        tier_sales[ticket_price.ticket_type] = {
            "price": ticket_price.price,
            "quantity_sold": len(tickets),
            "revenue": revenue,
            "percentage": 0  # Will calculate below
        }
        total_revenue += revenue
        total_tickets += len(tickets)
    
    # Calculate percentages
    for tier in tier_sales:
        if total_tickets > 0:
            tier_sales[tier]['percentage'] = round((tier_sales[tier]['quantity_sold'] / total_tickets * 100), 2)
    
    # Pending/failed transactions
    pending_transactions = Transaction.query.filter(
        Transaction.ticket_id.in_(
            db.session.query(Ticket.id).filter_by(event_id=event_id)
        ),
        Transaction.status.in_(["pending", "failed"])
    ).count()
    
    # Check-ins (used tickets)
    check_ins = Ticket.query.filter(
        Ticket.event_id == event_id,
        Ticket.used_at != None
    ).count()
    
    # Attendees who actually showed up
    no_show = total_tickets - check_ins
    
    return jsonify({
        "event": {
            "id": event.id,
            "name": event.name,
            "date": event.date,
            "venue": event.venue
        },
        "sales": {
            "total_revenue": total_revenue,
            "total_tickets": total_tickets,
            "by_tier": tier_sales
        },
        "payments": {
            "pending": pending_transactions,
            "paid": Transaction.query.filter(
                Transaction.ticket_id.in_(
                    db.session.query(Ticket.id).filter_by(event_id=event_id)
                ),
                Transaction.status == "success"
            ).count()
        },
        "attendance": {
            "check_ins": check_ins,
            "no_shows": no_show,
            "attendance_rate": round((check_ins / total_tickets * 100), 2) if total_tickets > 0 else 0
        },
        "currency": "KES"
    }), 200


@main.route('/analytics/revenue-trends', methods=['GET'])
@admin_required
def get_revenue_trends():
    """Get revenue trends over time"""
    days = request.args.get('days', 30, type=int)
    
    # Generate daily revenue data
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    daily_revenue = db.session.query(
        db.func.date(Transaction.confirmed_at).label('date'),
        db.func.sum(Transaction.amount).label('revenue'),
        db.func.count(Transaction.id).label('transactions')
    ).filter(
        Transaction.status == "success",
        Transaction.confirmed_at >= start_date,
        Transaction.confirmed_at <= end_date
    ).group_by(db.func.date(Transaction.confirmed_at))\
     .order_by('date').all()
    
    return jsonify({
        "period_days": days,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "daily_data": [{
            "date": str(d[0]),
            "revenue": d[1],
            "transactions": d[2]
        } for d in daily_revenue],
        "currency": "KES"
    }), 200


@main.route('/analytics/user-metrics', methods=['GET'])
@admin_required
def get_user_metrics():
    """Get user growth and engagement metrics"""
    days = request.args.get('days', 30, type=int)
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # New users in period
    new_users = User.query.filter(
        User.created_at >= start_date,
        User.created_at <= end_date,
        User.deleted_at == None
    ).count()
    
    # Returning users (users with multiple purchases)
    returning_users = db.session.query(db.func.count(db.distinct(Ticket.user_id))).filter(
        Ticket.created_at >= start_date,
        Ticket.mpesa_status.in_(["confirmed", "completed"])
    ).scalar() or 0
    
    # Users by role
    role_breakdown = db.session.query(
        User.role,
        db.func.count(User.id).label('count')
    ).filter(User.deleted_at == None).group_by(User.role).all()
    
    # Top customers by spending
    top_customers = db.session.query(
        User.id,
        User.name,
        User.email,
        db.func.count(Ticket.id).label('tickets'),
        db.func.sum(Ticket.price).label('total_spent')
    ).join(Ticket, User.id == Ticket.user_id)\
     .filter(Ticket.mpesa_status.in_(["confirmed", "completed"]))\
     .group_by(User.id, User.name, User.email)\
     .order_by(db.desc('total_spent'))\
     .limit(10).all()
    
    return jsonify({
        "period_days": days,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "new_users": new_users,
        "returning_users": returning_users,
        "role_breakdown": [{
            "role": r[0],
            "count": r[1]
        } for r in role_breakdown],
        "top_customers": [{
            "user_id": c[0],
            "name": c[1],
            "email": c[2],
            "tickets_purchased": c[3],
            "total_spent": c[4]
        } for c in top_customers],
        "currency": "KES"
    }), 200
