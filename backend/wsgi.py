import os
import sys

# Fix database URL for Render
if os.environ.get('DATABASE_URL'):
    os.environ['DATABASE_URL'] = os.environ['DATABASE_URL'].replace('postgres://', 'postgresql://', 1)

from backend.app import create_app, db
import app.models

app = create_app()

# Create tables on startup (fallback)
with app.app_context():
    try:
        db.create_all()
        app.logger.info("✓ Database tables verified/created")
    except Exception as e:
        app.logger.error(f"Database initialization error: {e}")

if __name__ == "__main__":
    app.run


