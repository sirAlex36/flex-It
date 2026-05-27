from datetime import datetime 
from . import db
import uuid

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default="user")
    is_active = db.Column(db.Boolean, default=True)
    deleted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)

    # relationship
    tickets = db.relationship("Ticket", back_populates="user")
    login_history = db.relationship("LoginHistory", back_populates="user", cascade='all, delete-orphan')
    audit_logs = db.relationship("AuditLog", back_populates="admin_user", cascade='all, delete-orphan')


class Event(db.Model):
    __tablename__ = 'events'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    date = db.Column(db.String(120), nullable=False)
    venue = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(255), nullable=True)
    organiser_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationship
    tickets = db.relationship('Ticket', back_populates='event')
    ticket_prices = db.relationship('TicketPrice', back_populates='event', cascade='all, delete-orphan')
    organiser = db.relationship('User', backref='events')


class Ticket(db.Model):
    __tablename__ = 'tickets'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()), index=True)  # Issue #2: UUID for public ID
    ticket_type = db.Column(db.String(120), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    quantity = db.Column(db.Integer, default=1)
    qr_code = db.Column(db.Text, nullable=True)  # Base64 or URL to QR code image
    qr_signature = db.Column(db.String(255), nullable=True)  # Issue #1: Cryptographic signature for QR validation
    email_confirmed = db.Column(db.Boolean, default=False)
    confirmed = db.Column(db.Boolean, default=False)  # Payment confirmed
    is_used = db.Column(db.Boolean, default=False, index=True)  # Issue #6: Track if ticket used at entry
    used_at = db.Column(db.DateTime, nullable=True)  # Check-in time
    mpesa_transaction_id = db.Column(db.String(120), nullable=True, index=True)  # Issue #16: Add index for query optimization
    mpesa_status = db.Column(db.String(50), default="pending", index=True)  # pending, confirmed, failed (Issue #16: indexed)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), index=True)  # Issue #16: Add index
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)  # Issue #16: Add index
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationship
    event = db.relationship('Event', back_populates='tickets')
    user = db.relationship("User", back_populates="tickets")


class TicketPrice(db.Model):
    __tablename__ = 'ticket_prices'
    
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    ticket_type = db.Column(db.String(120), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationship
    event = db.relationship('Event', back_populates='ticket_prices')


class Transaction(db.Model):
    """Tracks all payment transactions"""
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False, index=True)  # Issue #16: Add index
    amount = db.Column(db.Integer, nullable=False)  # Amount in cents (Ksh)
    mpesa_receipt = db.Column(db.String(120), unique=True, nullable=True, index=True)  # Issue #16: Add index for idempotency
    mpesa_reference = db.Column(db.String(255), nullable=True, index=True)  # Issue #16: Add index - request ID or conversation ID
    status = db.Column(db.String(50), default="pending", index=True)  # pending, success, failed, cancelled (Issue #16: indexed)
    payment_method = db.Column(db.String(50), default="mpesa")  # mpesa, card, etc
    error_message = db.Column(db.Text, nullable=True)  # Store error if payment fails
    initiated_at = db.Column(db.DateTime, default=datetime.utcnow)
    confirmed_at = db.Column(db.DateTime, nullable=True)  # When payment actually succeeded
    
    # relationship
    ticket = db.relationship('Ticket', backref='transactions')


class LoginHistory(db.Model):
    """Track user login attempts"""
    __tablename__ = 'login_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    ip_address = db.Column(db.String(120), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), default="success")  # success, failed
    logged_in_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # relationship
    user = db.relationship('User', back_populates='login_history')


class AuditLog(db.Model):
    """Track admin actions for security/compliance"""
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(255), nullable=False)  # What was done
    entity_type = db.Column(db.String(50), nullable=False)  # User, Event, Ticket, Transaction
    entity_id = db.Column(db.Integer, nullable=False)  # Which record was affected
    changes = db.Column(db.JSON, nullable=True)  # Before/after values
    ip_address = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # relationship
    admin_user = db.relationship('User', back_populates='audit_logs')
