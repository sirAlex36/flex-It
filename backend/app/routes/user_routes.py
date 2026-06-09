from flask import request, jsonify
from app import db, bcrypt
from . import main
from app.models import User, LoginHistory
from flask_jwt_extended import create_access_token
from datetime import datetime

@main.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not data or not name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    user = User(
        name=name,
        email=email,
        password=hashed_password,
        role=data.get('role', 'user')
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User created successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 201


@main.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Missing email or password"}), 400

        user = User.query.filter_by(email=data.get('email')).first()

        if user and bcrypt.check_password_hash(user.password, data.get('password')):
            # Check if user is active
            if not user.is_active:
                return jsonify({"error": "User account is suspended"}), 403

            # Create token with user ID as identity (becomes 'sub' claim)
            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={
                    "role": user.role,
                    "name": user.name,
                    "email": user.email
                }
            )

            # Record login in history
            login_record = LoginHistory(
                user_id=user.id,
                status="success",
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', '')
            )
            db.session.add(login_record)

            # Update last login time
            user.last_login = datetime.utcnow()
            db.session.commit()

            return jsonify({
                "access_token": access_token,
                "token_type": "Bearer",
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role
                }
            }), 200

        # Record failed login attempt
        if user:
            login_record = LoginHistory(
                user_id=user.id,
                status="failed",
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', '')
            )
            db.session.add(login_record)
            db.session.commit()

        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        print(f"❌ Login route error: {str(e)}")
        db.session.rollback()
        return jsonify({"error": "Internal server error during login"}), 500


@main.route('/users', methods=['GET'])
def get_users():
    """Get all active users (basic info only)"""
    users = User.query.filter_by(deleted_at=None).all()
    return jsonify([
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role
        }
        for u in users
    ])