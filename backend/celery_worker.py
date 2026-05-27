#!/usr/bin/env python
"""
Celery Worker Script
Run with: python celery_worker.py

This starts the Celery background task worker that processes:
- Email sending (Issue #11)
- Audit logging (Issue #12)
- Other async tasks
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Add the app directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app.celery_config import celery_app
from app import create_app

# Create Flask app context for Celery
app = create_app()
app.app_context().push()

if __name__ == '__main__':
    print("=" * 60)
    print("Starting Celery Worker")
    print(f"Broker: {os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')}")
    print(f"Backend: {os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/1')}")
    print("=" * 60)
    
    celery_app.worker_main([
        'worker',
        '--loglevel=info',
        '--concurrency=4',  # Number of concurrent workers
        '--max-tasks-per-child=100',  # Restart worker after 100 tasks
    ])
