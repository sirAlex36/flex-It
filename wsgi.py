import os
import sys

# Fix PostgreSQL URL for Render
if os.environ.get('DATABASE_URL'):
    os.environ['DATABASE_URL'] = os.environ['DATABASE_URL'].replace('postgres://', 'postgresql://', 1)

# Add the current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import create_app, db

app = create_app()

# Verify tables exist (fallback check)
with app.app_context():
    try:
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        existing_tables = inspector.get_table_names()
        
        if existing_tables:
            print(f"✅ Database tables verified: {len(existing_tables)} tables found")
        else:
            print("⚠️  Warning: No tables found in database")
            print("   Tables should have been created during build phase using 'flask db upgrade'")
            print("   If this is a new deployment, check render.yaml build command output")
            
    except Exception as e:
        print(f"⚠️  Could not verify tables on startup: {e}")
        # Don't fail startup for this - let Render logs show the actual error

if __name__ == "__main__":
    app.run()

