"""
Logging Configuration
Issue #12: No Audit Logging → Structured logging setup
"""

import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime


def setup_logging(app):
    """
    Configure structured logging for the application
    
    Features:
    - Console logging with color and formatting
    - File logging with rotation (daily, max 10 files)
    - Separate logs for different components
    - Audit trail for sensitive operations
    """
    
    # Create logs directory if it doesn't exist
    logs_dir = 'logs'
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)
    
    # Log format with details
    log_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler (for development)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(log_format)
    
    # Main application log file
    app_log_file = os.path.join(logs_dir, f'app-{datetime.now().strftime("%Y-%m-%d")}.log')
    app_file_handler = RotatingFileHandler(
        app_log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=10
    )
    app_file_handler.setLevel(logging.DEBUG)
    app_file_handler.setFormatter(log_format)
    
    # Error log file
    error_log_file = os.path.join(logs_dir, f'errors-{datetime.now().strftime("%Y-%m-%d")}.log')
    error_file_handler = RotatingFileHandler(
        error_log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=10
    )
    error_file_handler.setLevel(logging.ERROR)
    error_file_handler.setFormatter(log_format)
    
    # Audit log file (for security/compliance)
    audit_log_file = os.path.join(logs_dir, f'audit-{datetime.now().strftime("%Y-%m-%d")}.log')
    audit_file_handler = RotatingFileHandler(
        audit_log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=30  # Keep more audit logs
    )
    audit_file_handler.setLevel(logging.INFO)
    audit_file_handler.setFormatter(log_format)
    
    # Payment log file (for debugging M-Pesa)
    payment_log_file = os.path.join(logs_dir, f'payments-{datetime.now().strftime("%Y-%m-%d")}.log')
    payment_file_handler = RotatingFileHandler(
        payment_log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=20
    )
    payment_file_handler.setLevel(logging.DEBUG)
    payment_file_handler.setFormatter(log_format)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(app_file_handler)
    root_logger.addHandler(error_file_handler)
    
    # Configure specific loggers
    
    # M-Pesa & Payment logging
    mpesa_logger = logging.getLogger('app.routes.mpesa_routes_secured')
    mpesa_logger.addHandler(payment_file_handler)
    
    # Security/Audit logging
    security_logger = logging.getLogger('app.security')
    security_logger.addHandler(audit_file_handler)
    
    # Scan logging
    scan_logger = logging.getLogger('app.routes.scan_routes')
    scan_logger.addHandler(audit_file_handler)
    
    # Tasks logging
    tasks_logger = logging.getLogger('app.tasks')
    tasks_logger.addHandler(app_file_handler)
    
    # Reduce noise from third-party libraries
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy').setLevel(logging.WARNING)
    
    app.logger.info("=" * 50)
    app.logger.info("Logging configured successfully")
    app.logger.info(f"Logs directory: {os.path.abspath(logs_dir)}")
    app.logger.info("=" * 50)
