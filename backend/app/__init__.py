import os
from typing import Any, cast

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import text
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix
from dotenv import load_dotenv

from .config import Config


# Load environment variables
load_dotenv()


# ============================================================
# EXTENSIONS
# ============================================================

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()


# ============================================================
# REDIS / RATE LIMITING
# ============================================================

redis_url = os.getenv("REDIS_URL")

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=redis_url if redis_url else "memory://"
)


# ============================================================
# APPLICATION FACTORY
# ============================================================

def create_app():

    app = Flask(__name__)

    # --------------------------------------------------------
    # Base configuration
    # --------------------------------------------------------

    app.config.from_object(Config)

    # --------------------------------------------------------
    # Database
    # --------------------------------------------------------
    database_url = (
        os.getenv("POSTGRES_URL_NON_POOLING")
        or os.getenv("POSTGRES_URL")
        or os.getenv("DATABASE_URL")
    )

    if not database_url:
        raise ValueError(
            "No PostgreSQL connection string found. "
            "Expected POSTGRES_URL_NON_POOLING, POSTGRES_URL, or DATABASE_URL."
        )

    if database_url.startswith("postgres://"):
        database_url = database_url.replace(
            "postgres://",
            "postgresql://",
            1
        )

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url

    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 5,
        "max_overflow": 10,
    }


    # --------------------------------------------------------
    # JWT
    # --------------------------------------------------------

    jwt_secret = os.getenv("JWT_SECRET_KEY")

    if not jwt_secret:
        raise ValueError("JWT_SECRET_KEY is missing")

    app.config["JWT_SECRET_KEY"] = jwt_secret
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400 * 30
    app.config["JWT_ALGORITHM"] = "HS256"

    # --------------------------------------------------------
    # Initialize extensions
    # --------------------------------------------------------

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)

    # --------------------------------------------------------
    # Reverse proxy configuration
    # --------------------------------------------------------

    app.wsgi_app = ProxyFix(
        app.wsgi_app,
        x_proto=1,
        x_host=1,
        x_port=1
    )

    # --------------------------------------------------------
    # CORS
    # --------------------------------------------------------

    allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")

    allowed_origins_list = [
        origin.strip()
        for origin in allowed_origins_env.split(",")
        if origin.strip()
    ]

    # Development fallback
    if not allowed_origins_list:
        allowed_origins_list = [
            "http://localhost:3000",
            "http://localhost:5173",
        ]

    CORS(
        app,
        resources={
            r"/*": {
                "origins": allowed_origins_list,
                "supports_credentials": True,
                "allow_headers": [
                    "Content-Type",
                    "Authorization",
                ],
                "methods": [
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE",
                    "OPTIONS",
                    "PATCH",
                ],
                "expose_headers": [
                    "Content-Type",
                ],
                "max_age": 3600,
            }
        },
    )

    # --------------------------------------------------------
    # Security middleware
    # --------------------------------------------------------

    from .security_middleware import setup_security_middleware

    setup_security_middleware(app)

    # --------------------------------------------------------
    # Register routes
    # --------------------------------------------------------

    from .routes import main

    app.register_blueprint(main)

    # --------------------------------------------------------
    # Home endpoint
    # --------------------------------------------------------

    @app.route("/")
    def home():
        return {
            "message": "Flex-It API running"
        }, 200

    # --------------------------------------------------------
    # Health check
    # --------------------------------------------------------

    @app.route("/health")
    def health():

        try:
            db.session.execute(text("SELECT 1"))

            return {
                "status": "healthy",
                "database": "connected"
            }, 200

        except Exception as e:

            app.logger.error(
                "Database health check failed: %s",
                e
            )

            return {
                "status": "unhealthy",
                "database": "disconnected"
            }, 500

    # --------------------------------------------------------
    # Error handlers
    # --------------------------------------------------------

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": "Endpoint not found"
        }), 404

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "error": str(error.description)
            if error.description
            else "Bad request"
        }), 400

    @app.errorhandler(500)
    def internal_error(error):

        db.session.rollback()

        app.logger.exception(
            "Internal server error"
        )

        return jsonify({
            "error": "Internal server error"
        }), 500

    # --------------------------------------------------------
    # JWT error handlers
    # --------------------------------------------------------

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):

        return jsonify({
            "error": "Token expired"
        }), 401

    def invalid_token_callback(error):

        return jsonify({
            "error": "Invalid token"
        }), 401

    cast(Any, jwt).invalid_token_loader(invalid_token_callback)

    # --------------------------------------------------------
    # Secure cookies
    # --------------------------------------------------------

    app.config["SESSION_COOKIE_SECURE"] = True
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

    app.config["REMEMBER_COOKIE_SECURE"] = True
    app.config["REMEMBER_COOKIE_HTTPONLY"] = True

    return app

