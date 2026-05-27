"""
Celery Configuration
Issue #11: Blocking SMTP Inside Callback → Move to background jobs
Issue #20: No Queueing / Retry Architecture → Advanced retry with DLQ
"""

import os
from celery import Celery
from kombu import Exchange, Queue
from dotenv import load_dotenv

load_dotenv()

# Initialize Celery
celery_app = Celery(
    'flex_it',
    broker=os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/1'),
    include=['app.tasks']
)

# Define exchanges and queues (Issue #20)
default_exchange = Exchange('flex_it', type='direct')
dead_letter_exchange = Exchange('flex_it_dlq', type='direct')

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # Queue configuration with dead letter queue
    task_queues=(
        Queue('default', exchange=default_exchange, routing_key='default'),
        Queue('emails', exchange=default_exchange, routing_key='emails'),
        Queue('audit', exchange=default_exchange, routing_key='audit'),
        Queue('dlq', exchange=dead_letter_exchange, routing_key='dlq'),  # Dead Letter Queue
    ),
    
    task_default_queue='default',
    task_default_exchange='flex_it',
    task_default_routing_key='default',
    
    # Task timeout: 5 minutes
    task_soft_time_limit=300,
    task_time_limit=600,
    
    # Retry configuration (Issue #20)
    task_acks_late=True,  # Acknowledge after task completes
    task_reject_on_worker_lost=True,  # Re-queue if worker dies
    worker_prefetch_multiplier=1,  # Don't prefetch tasks
    task_max_retries=3,
    
    # Task routing
    task_routes={
        'app.tasks.send_confirmation_email_task': {'queue': 'emails'},
        'app.tasks.audit_log_task': {'queue': 'audit'},
        'app.tasks.send_resend_confirmation_email_task': {'queue': 'emails'},
    },
    
    # Result expiration
    result_expires=3600,  # Results expire after 1 hour
    result_backend_transport_options={
        'master_name': 'mymaster',
        'visibility_timeout': 3600,
    },
    
    # Worker settings
    worker_disable_rate_limits=False,
    worker_log_format='[%(asctime)s: %(levelname)s/%(processName)s] %(message)s',
    worker_task_log_format='[%(asctime)s: %(levelname)s/%(processName)s] [%(task_name)s(%(task_id)s)] %(message)s',
)

# Celery beat schedule (for periodic tasks)
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    'cleanup-expired-transactions': {
        'task': 'app.tasks.cleanup_expired_transactions',
        'schedule': crontab(hour=0, minute=0),  # Daily at midnight
    },
    'generate-audit-report': {
        'task': 'app.tasks.generate_audit_report',
        'schedule': crontab(hour=1, minute=0),  # Daily at 1 AM
    },
}

