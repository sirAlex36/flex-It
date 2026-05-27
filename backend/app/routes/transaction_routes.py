"""
Transaction and payment management routes
"""
from flask import request, jsonify
from app import db
from . import main
from app.models import Transaction, Ticket, User, AuditLog
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
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


@main.route('/transactions', methods=['GET'])
@admin_required
def get_all_transactions():
    """Get all transactions with filters"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status', None)  # pending, success, failed
    payment_method = request.args.get('payment_method', None)
    
    query = Transaction.query
    
    if status:
        query = query.filter_by(status=status)
    if payment_method:
        query = query.filter_by(payment_method=payment_method)
    
    paginated = query.order_by(Transaction.initiated_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        "transactions": [{
            "id": t.id,
            "ticket_id": t.ticket_id,
            "user": {
                "id": t.ticket.user.id,
                "name": t.ticket.user.name,
                "email": t.ticket.user.email
            },
            "event": {
                "id": t.ticket.event.id,
                "name": t.ticket.event.name
            },
            "amount": t.amount,
            "status": t.status,
            "payment_method": t.payment_method,
            "mpesa_receipt": t.mpesa_receipt,
            "error_message": t.error_message,
            "initiated_at": t.initiated_at.isoformat(),
            "confirmed_at": t.confirmed_at.isoformat() if t.confirmed_at else None
        } for t in paginated.items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": paginated.total,
            "pages": paginated.pages
        }
    }), 200


@main.route('/transactions/<int:transaction_id>', methods=['GET'])
@admin_required
def get_transaction_details(transaction_id):
    """Get detailed transaction information"""
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404
    
    return jsonify({
        "id": transaction.id,
        "ticket_id": transaction.ticket_id,
        "ticket": {
            "id": transaction.ticket.id,
            "type": transaction.ticket.ticket_type,
            "price": transaction.ticket.price,
            "event_id": transaction.ticket.event_id,
            "qr_code": transaction.ticket.qr_code,
            "confirmed": transaction.ticket.confirmed
        },
        "user": {
            "id": transaction.ticket.user.id,
            "name": transaction.ticket.user.name,
            "email": transaction.ticket.user.email,
            "phone": transaction.ticket.user.email  # TODO: Add phone field
        },
        "event": {
            "id": transaction.ticket.event.id,
            "name": transaction.ticket.event.name,
            "date": transaction.ticket.event.date,
            "venue": transaction.ticket.event.venue
        },
        "amount": transaction.amount,
        "status": transaction.status,
        "payment_method": transaction.payment_method,
        "mpesa_receipt": transaction.mpesa_receipt,
        "mpesa_reference": transaction.mpesa_reference,
        "error_message": transaction.error_message,
        "initiated_at": transaction.initiated_at.isoformat(),
        "confirmed_at": transaction.confirmed_at.isoformat() if transaction.confirmed_at else None
    }), 200


@main.route('/transactions/<int:transaction_id>/confirm', methods=['POST'])
@admin_required
def manually_confirm_payment(transaction_id):
    """Admin manually confirms a payment (fallback for failed M-Pesa)"""
    admin_id = get_jwt_identity()
    data = request.get_json()
    
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404
    
    if transaction.status == "success":
        return jsonify({"error": "Transaction already confirmed"}), 400
    
    # Update transaction status
    transaction.status = "success"
    transaction.confirmed_at = datetime.utcnow()
    transaction.mpesa_receipt = data.get('mpesa_receipt', transaction.mpesa_receipt)
    
    # Update ticket as confirmed
    ticket = transaction.ticket
    ticket.confirmed = True
    ticket.mpesa_status = "confirmed"
    
    db.session.commit()
    
    # Log admin action
    log = AuditLog(
        admin_id=admin_id,
        action="Manually confirmed payment",
        entity_type="Transaction",
        entity_id=transaction_id,
        changes={"status": "success"}
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        "message": "Payment confirmed successfully",
        "transaction_id": transaction_id,
        "status": "success"
    }), 200


@main.route('/transactions/<int:transaction_id>/refund', methods=['POST'])
@admin_required
def refund_payment(transaction_id):
    """Initiate a refund for a transaction"""
    admin_id = get_jwt_identity()
    data = request.get_json()
    
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404
    
    if transaction.status != "success":
        return jsonify({"error": "Only confirmed payments can be refunded"}), 400
    
    refund_amount = data.get('amount', transaction.amount)
    if refund_amount > transaction.amount:
        return jsonify({"error": "Refund amount exceeds transaction amount"}), 400
    
    # TODO: Integrate with M-Pesa API to actually send refund
    # For now, create a record of the refund action
    
    transaction.status = "cancelled"  # Mark as cancelled/refunded
    ticket = transaction.ticket
    ticket.confirmed = False
    
    db.session.commit()
    
    # Log admin action
    log = AuditLog(
        admin_id=admin_id,
        action=f"Refunded payment - Amount: {refund_amount}",
        entity_type="Transaction",
        entity_id=transaction_id,
        changes={"status": "cancelled", "refund_amount": refund_amount}
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        "message": "Payment refunded successfully",
        "transaction_id": transaction_id,
        "refund_amount": refund_amount,
        "note": "In production, M-Pesa API would process actual refund"
    }), 200


@main.route('/tickets/<int:ticket_id>/retry-payment', methods=['POST'])
@admin_required
def retry_failed_payment(ticket_id):
    """Retry a failed payment"""
    admin_id = get_jwt_identity()
    
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404
    
    # Get the failed transaction
    transaction = Transaction.query.filter_by(ticket_id=ticket_id, status="failed").first()
    if not transaction:
        return jsonify({"error": "No failed payment found for this ticket"}), 404
    
    # TODO: Call M-Pesa API to retry payment
    # For now, reset the transaction to pending
    
    transaction.status = "pending"
    transaction.error_message = None
    ticket.mpesa_status = "pending"
    
    db.session.commit()
    
    # Log action
    log = AuditLog(
        admin_id=admin_id,
        action="Retried failed payment",
        entity_type="Transaction",
        entity_id=transaction.id,
        changes={"status": "pending"}
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        "message": "Payment retry initiated",
        "transaction_id": transaction.id,
        "status": "pending",
        "note": "In production, M-Pesa API would process payment"
    }), 200


@main.route('/transactions/stats', methods=['GET'])
@admin_required
def get_transaction_stats():
    """Get transaction statistics"""
    # Total revenue
    total_revenue = db.session.query(db.func.sum(Transaction.amount)).filter_by(status="success").scalar() or 0
    
    # Count by status
    status_counts = {}
    for status in ['pending', 'success', 'failed', 'cancelled']:
        count = Transaction.query.filter_by(status=status).count()
        status_counts[status] = count
    
    # Success rate
    successful = Transaction.query.filter_by(status="success").count()
    total = Transaction.query.count()
    success_rate = (successful / total * 100) if total > 0 else 0
    
    return jsonify({
        "total_revenue": total_revenue,
        "total_transactions": total,
        "status_breakdown": status_counts,
        "success_rate": round(success_rate, 2),
        "currency": "KES"
    }), 200
