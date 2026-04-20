# Authentication Debug Guide

## Issue Summary
The login endpoint is returning HTML (likely a 404 error page) instead of JSON, causing NextAuth to fail with:
```
❌ Auth error: Unexpected token '<', "<!doctype "... is not valid JSON
```

## Fixes Applied ✅

### 1. **NextAuth Error Handling** (`src/app/api/auth/[...nextauth]/route.js`)
- Added detection for non-JSON responses
- Now logs the first 200 chars of HTML error responses
- Gracefully handles malformed JSON responses

### 2. **Flask Error Handlers** (`backend/app/__init__.py`)
- Added global error handlers for 404, 500, 400
- Ensures **all** errors return JSON, never HTML

### 3. **Login Route Error Handling** (`backend/app/routes/user_routes.py`)
- Added try-catch wrapper around the entire login route
- Records failed login attempts even on exceptions
- Returns proper JSON error messages

### 4. **CORS Configuration** (`backend/app/__init__.py`)
- Added `localhost:3001` as allowed origin
- Added `Authorization` header support

---

## ⚠️ Step 1: Verify Backend Database

First, ensure your admin user exists:

```bash
cd /home/alex/Moringa/Project/flex-It/backend
python3
```

```python
from app import create_app, db
from app.models import User

app = create_app()
with app.app_context():
    admin = User.query.filter_by(email='admin@flexit.com').first()
    if admin:
        print(f"✅ Admin user found: {admin.name} ({admin.email})")
        print(f"   Role: {admin.role}")
        print(f"   Active: {admin.is_active}")
    else:
        print("❌ Admin user NOT found")
        
    # List all users
    all_users = User.query.all()
    print(f"\nTotal users in DB: {len(all_users)}")
    for u in all_users:
        print(f"  - {u.email} ({u.role})")
exit()
```

---

## ⚠️ Step 2: Create Admin User (if missing)

If the admin user doesn't exist, create it:

```bash
cd /home/alex/Moringa/Project/flex-It/backend
python3
```

```python
from app import create_app, db, bcrypt
from app.models import User
from datetime import datetime

app = create_app()
with app.app_context():
    # Check if admin exists
    admin = User.query.filter_by(email='admin@flexit.com').first()
    
    if not admin:
        # Create admin user
        hashed_pwd = bcrypt.generate_password_hash('admin123').decode('utf-8')
        admin = User(
            name='Admin User',
            email='admin@flexit.com',
            password=hashed_pwd,
            role='admin',
            is_active=True
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created: admin@flexit.com / admin123")
    else:
        print(f"✅ Admin user already exists: {admin.email}")

exit()
```

---

## ⚠️ Step 3: Start Backend Server

```bash
cd /home/alex/Moringa/Project/flex-It/backend
python3 -m flask run --port=5000 --debug
```

**Expected output:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

---

## ⚠️ Step 4: Test Backend Login Directly

Open another terminal:

```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@flexit.com", "password": "admin123"}'
```

**Expected response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@flexit.com",
    "role": "admin"
  }
}
```

If you get HTML, the backend server is either:
- Not running
- Not at http://localhost:5000
- Missing dependencies

---

## ⚠️ Step 5: Start Frontend Server

```bash
cd /home/alex/Moringa/Project/flex-It
npm run dev
```

**Expected output:**
```
> next dev
▲ Next.js 14.x.x
- local:   http://localhost:3000
```

---

## ⚠️ Step 6: Test Login in Browser

1. Navigate to `http://localhost:3000/login`
2. Enter:
   - Email: `admin@flexit.com`
   - Password: `admin123`
3. Click "Sign In"

---

## 🔍 Debugging Checklist

- [ ] Backend running on port 5000?
- [ ] Frontend running on port 3000?
- [ ] Admin user exists in database?
- [ ] `npm run dev` shows no errors?
- [ ] Browser console shows NextAuth logs?
- [ ] Backend logs show the login attempt?

---

## 📋 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| HTML response from backend | Backend not running | `python3 -m flask run` |
| 404 error | Login route not registered | Check `backend/app/routes/__init__.py` |
| Password mismatch | Wrong password or hash issue | Re-create admin user |
| CORS error | Origin not allowed | Added `localhost:3001` to CORS config |
| Timeout error | Backend too slow | Check database queries |

---

## 🔧 Environment Variables

Ensure `.env.local` exists in root folder:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=c5d7bd68f56060e60d8c014d4f4e4d99d720d4049f0d9434ea0a710f6c7c483e
```

---

## 📝 Logs to Check

- **NextAuth logs**: Browser console (F12) → Console tab
- **Backend logs**: Terminal running Flask server
- **Network requests**: Browser console → Network tab → Find POST to `/api/auth/callback/credentials`

---

## ✅ Success Indicators

When login works:
1. ✅ Network tab shows 200 response from `/api/auth/callback/credentials`
2. ✅ Browser console shows NextAuth success messages
3. ✅ Redirected to appropriate dashboard (admin or user)
4. ✅ Session established (check cookies in DevTools)

