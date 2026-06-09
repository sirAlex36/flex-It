"""
Admin routes for user management, system settings, and audit logs
"""
from flask import request, jsonify
from app import db, bcrypt
from . import main
from app.models import User, AuditLog, LoginHistory, Event, Ticket, Transaction
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from datetime import datetime, timedelta
from functools import wraps
import json

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


@main.route('/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users with optional pagination and filters"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    role_filter = request.args.get('role', None)
    
    query = User.query.filter_by(deleted_at=None)
    
    if role_filter:
        query = query.filter_by(role=role_filter)
    
    paginated = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        "users": [{
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat(),
            "last_login": u.last_login.isoformat() if u.last_login else None
        } for u in paginated.items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": paginated.total,
            "pages": paginated.pages
        }
    }), 200


@main.route('/admin/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user_profile(user_id):
    """Get detailed user profile including activity"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Get user's tickets
    tickets = Ticket.query.filter_by(user_id=user_id).all()
    
    # Get login history
    logins = LoginHistory.query.filter_by(user_id=user_id).order_by(LoginHistory.logged_in_at.desc()).limit(10).all()
    
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat(),
        "last_login": user.last_login.isoformat() if user.last_login else None,
        "statistics": {
            "total_tickets": len(tickets),
            "total_spent": sum(t.price for t in tickets),
            "events_attended": len(set(t.event_id for t in tickets))
        },
        "recent_logins": [{
            "timestamp": l.logged_in_at.isoformat(),
            "ip": l.ip_address,
            "status": l.status
        } for l in logins]
    }), 200


@main.route('/admin/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def change_user_role(user_id):
    """Change user role (user or admin)"""
    admin_id = get_jwt_identity()
    data = request.get_json()
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    new_role = data.get('role')
    if new_role not in ['user', 'admin']:
        return jsonify({"error": "Invalid role"}), 400
    
    old_role = user.role
    user.role = new_role
    db.session.commit()
    
    # Log the action
    log = AuditLog(
        admin_id=admin_id,
        action=f"Changed user role from {old_role} to {new_role}",
        entity_type="User",
        entity_id=user_id,
        changes={"from": old_role, "to": new_role}
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        "message": "User role updated",
        "user_id": user_id,
        "new_role": new_role
    }), 200


@main.route('/admin/users/<int:user_id>/suspend', methods=['PUT'])
@admin_required
def suspend_user(user_id):
    """Suspend/activate user"""
    admin_id = get_jwt_identity()
    data = request.get_json()
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    is_suspend = data.get('suspend', True)
    user.is_active = not is_suspend
    db.session.commit()
    
    # Log the action
    action = "Suspended user" if is_suspend else "Activated user"
    log = AuditLog(
        admin_id=admin_id,
        action=action,
        entity_type="User",
        entity_id=user_id,
        changes={"is_active": user.is_active}
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        "message": action,
        "user_id": user_id,
        "is_active": user.is_active
    }), 200


@main.route('/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def soft_delete_user(user_id):
    """Soft delete user (mark as deleted, don't remove from DB)"""
    admin_id = get_jwt_identity()
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user.deleted_at = datetime.utcnow()
    user.is_active = False
    db.session.commit()
    
    # Log the action
    log = AuditLog(
        admin_id=admin_id,
        action="Deleted user",
        entity_type="User",
        entity_id=user_id,
        changes={"deleted_at": user.deleted_at.isoformat()}
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        "message": "User deleted successfully",
        "user_id": user_id
    }), 200


@main.route('/admin/users/<int:user_id>/reset-password', methods=['POST'])
@admin_required
def reset_user_password(user_id):
    """Admin-triggered password reset (send email or generate temp password)"""
    admin_id = get_jwt_identity()
    data = request.get_json()
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Generate a temporary password
    import secrets
    temp_password = secrets.token_urlsafe(12)
    hashed_password = bcrypt.generate_password_hash(temp_password).decode('utf-8')
    user.password = hashed_password
    db.session.commit()
    
    # Log the action
    log = AuditLog(
        admin_id=admin_id,
        action="Reset user password",
        entity_type="User",
        entity_id=user_id
    )
    db.session.add(log)
    db.session.commit()
    
    # TODO: Send email to user with temp password
    # For now, return it (in production, email it)
    
    return jsonify({
        "message": "Password reset successful",
        "user_id": user_id,
        "temp_password": temp_password,
        "note": "In production, this would be sent via email"
    }), 200


@main.route('/admin/audit-logs', methods=['GET'])
@admin_required
def get_audit_logs():
    """Get admin activity logs"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    entity_filter = request.args.get('entity_type', None)
    
    query = AuditLog.query
    
    if entity_filter:
        query = query.filter_by(entity_type=entity_filter)
    
    # Order by newest first
    paginated = query.order_by(AuditLog.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        "logs": [{
            "id": log.id,
            "admin": {
                "id": log.admin_user.id,
                "name": log.admin_user.name,
                "email": log.admin_user.email
            },
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "changes": log.changes,
            "created_at": log.created_at.isoformat()
        } for log in paginated.items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": paginated.total,
            "pages": paginated.pages
        }
    }), 200


@main.route('/admin/login-history', methods=['GET'])
@admin_required
def get_login_history():
    """Get global login history"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    user_id = request.args.get('user_id', None, type=int)
    
    query = LoginHistory.query
    
    if user_id:
        query = query.filter_by(user_id=user_id)
    
    paginated = query.order_by(LoginHistory.logged_in_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        "logins": [{
            "id": log.id,
            "user": {
                "id": log.user.id,
                "name": log.user.name,
                "email": log.user.email
            },
            "ip_address": log.ip_address,
            "status": log.status,
            "logged_in_at": log.logged_in_at.isoformat()
        } for log in paginated.items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": paginated.total,
            "pages": paginated.pages
        }
    }), 200
