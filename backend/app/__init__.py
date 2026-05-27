import os

from flask import Flask, app, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from .config import DevelopmentConfig
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_limiter import Limiter  # Issue #8: Rate limiting
from flask_limiter.util import get_remote_address

from dotenv import load_dotenv
load_dotenv()

QR_SECRET = os.getenv("QR_SECRET")
SMTP_SERVER = os.getenv("SMTP_SERVER") 
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=os.getenv("REDIS_URL", "redis://localhost:6379")
)
SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}


def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI']=("postgresql+psycopg2://Kipkorir:Alex1234@localhost:5432/flexIt")
    app.config.from_object(DevelopmentConfig)

    # 🔒 JWT CONFIG
    jwt_secret = os.getenv("JWT_SECRET_KEY")
    if not jwt_secret:raise ValueError("JWT_SECRET_KEY is missing")
    app.config["JWT_SECRET_KEY"] = jwt_secret
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400 * 30  # 30 days
    app.config["JWT_ALGORITHM"] = "HS256"

    # 🔧 INIT EXTENSIONS
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)  # Issue #8: Initialize rate limiter

    # 🔥 CORS FIX (IMPORTANT)
    CORS(
        app,
        origins=os.getenv("ALLOWED_ORIGINS", "").split(","),
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"]
    )

    # Issue #12: Setup structured logging
    from .logging_config import setup_logging
    setup_logging(app)
    
    # Issue #14, #15: Setup security middleware (HTTPS, CSRF)
    from .security_middleware import setup_security_middleware
    setup_security_middleware(app)

    # 🔗 REGISTER ROUTES
    from .routes import main
    app.register_blueprint(main)

    # ❌ GLOBAL ERROR HANDLERS - Ensure JSON responses
    @app.errorhandler(404)
    def not_found(error):
        from flask import jsonify
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        from flask import jsonify
        db.session.rollback()
        print(f"❌ Internal Server Error: {error}")
        return jsonify({"error": "Internal server error"}), 500

    @app.errorhandler(400)
    def bad_request(error):
        from flask import jsonify
        return jsonify({"error": str(error.description) or "Bad request"}), 400
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
        "error": "Token expired"
    }), 401


    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
        "error": "Invalid token"
    }), 401
    
    @app.route("/health")
    def health():
        return {"status": "healthy"}, 200
    
    app.config["SESSION_COOKIE_SECURE"] = True
    app.config["REMEMBER_COOKIE_SECURE"] = True
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

    return app