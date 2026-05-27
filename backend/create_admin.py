#!/usr/bin/env python
"""
Create Admin User Script
Run: python create_admin.py
"""

import os
import sys
from dotenv import load_dotenv

# Add the app directory to path
sys.path.insert(0, os.path.dirname(__file__))

load_dotenv()

from app import create_app, db, bcrypt
from app.models import User

def create_admin_user():
    """Create an admin user in the database"""
    app = create_app()
    
    with app.app_context():
        # Admin credentials
        admin_email = "admin@flexIt.com"
        admin_password = "Admin@123456"
        admin_name = "Admin User"
        
        # Check if admin already exists
        existing_admin = User.query.filter_by(email=admin_email).first()
        if existing_admin:
            print(f"❌ Admin user already exists: {admin_email}")
            return False
        
        try:
            # Hash password
            hashed_password = bcrypt.generate_password_hash(admin_password).decode('utf-8')
            
            # Create admin user
            admin = User(
                name=admin_name,
                email=admin_email,
                password=hashed_password,
                role="admin",
                is_active=True
            )
            
            # Save to database
            db.session.add(admin)
            db.session.commit()
            
            print("✅ Admin user created successfully!")
            print(f"   Email: {admin_email}")
            print(f"   Password: {admin_password}")
            print(f"   Role: admin")
            print("\n⚠️  IMPORTANT: Change this password after first login!")
            print("💡 Use this to login at http://localhost:3000/login")
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating admin user: {str(e)}")
            return False

if __name__ == '__main__':
    print("=" * 60)
    print("Creating Admin User for Flex-It")
    print("=" * 60)
    create_admin_user()
    print("=" * 60)
