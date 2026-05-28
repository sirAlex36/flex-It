import os

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import text
from .config import DevelopmentConfig
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_limiter import Limiter  # Issue #8: Rate limiting
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix

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
redis_url = os.getenv("REDIS_URL")
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=redis_url if redis_url else "memory://"
)
SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}
config_name = os.getenv("FLASK_ENV", "development")

def create_app():
    app = Flask(__name__)
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL is missing")

    if database_url.startswith("postgres://"):
        database_url = database_url.replace(
        "postgres://",
        "postgresql://",
        1
    )
    
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }


    if config_name == "production":
        from .config import ProductionConfig
        app.config.from_object(ProductionConfig)
    else:
        app.config.from_object(DevelopmentConfig)
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url

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
    allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
    allowed_origins_list = [
        "http://localhost:3000",
        "http://localhost:5000",
        "https://flex-it-six.vercel.app",
        "https://flex-it.onrender.com"
    ]
    
    if allowed_origins_env:
        allowed_origins_list.extend([origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()])
    
    CORS(
        app,
        resources={
            r"/*": { 
                "origins": allowed_origins_list
            }
       },
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    # Issue #12: Setup structured logging
    from .logging_config import setup_logging
    setup_logging(app)
    
    # Issue #14, #15: Setup security middleware (HTTPS, CSRF)
    from .security_middleware import setup_security_middleware
    setup_security_middleware(app)

    # 🔗 REGISTER ROUTES
    from .routes import main
    app.register_blueprint(main)

    @app.route("/")
    def home():
        return {
            "message": "Flex-It API running"
         }, 200

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
        try:
            db.session.execute(text("SELECT 1"))
            return {
            "status": "healthy",
            "database": "connected"
            }, 200
        except Exception as e:
            return {
               "status": "unhealthy",
               "error": str(e)
            }, 500
    
    app.config["SESSION_COOKIE_SECURE"] = True
    app.config["REMEMBER_COOKIE_SECURE"] = True
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

    return app