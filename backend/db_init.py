"""
Database initialization script for Render deployment
Runs during the build phase to apply Flask-Migrate migrations
"""
import os
import sys
from pathlib import Path

# Fix PostgreSQL URL for Render (postgres:// -> postgresql://)
if os.environ.get('DATABASE_URL'):
    os.environ['DATABASE_URL'] = os.environ['DATABASE_URL'].replace('postgres://', 'postgresql://', 1)

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    print("🔧 Initializing database for Render deployment...")
    
    from app import create_app, db, migrate
    
    # Create Flask app context
    app = create_app()
    
    with app.app_context():
        print("✅ Flask app initialized")
        print(f"📊 Database URL: {os.environ.get('DATABASE_URL', 'Not set')[:50]}...")
        
        # Apply migrations using Flask-Migrate (Alembic)
        print("🔄 Running migrations with 'flask db upgrade'...")
        
        # Import the migration environment
        from alembic.config import Config as AlembicConfig
        from alembic.command import upgrade
        
        # Set up Alembic configuration
        migrations_dir = backend_dir / "migrations"
        alembic_cfg = AlembicConfig(str(migrations_dir / "alembic.ini"))
        alembic_cfg.set_main_option("sqlalchemy.url", os.environ.get('DATABASE_URL', ''))
        
        # Run migration upgrade
        upgrade(alembic_cfg, "head")
        print("✅ Migrations applied successfully!")
        
        # Verify tables were created
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        existing_tables = inspector.get_table_names()
        print(f"✅ Database tables created: {existing_tables}")
        
        if existing_tables:
            print("✅ Database initialization completed successfully!")
            sys.exit(0)
        else:
            print("⚠️  No tables found after migration - this may indicate an issue")
            sys.exit(1)
            
except Exception as e:
    print(f"❌ Database initialization failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
