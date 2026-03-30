# Flex-It Application - Comprehensive Audit & Fixes Required

## Executive Summary
The application has several **CRITICAL** issues that must be fixed before production. These include backend/frontend misconfigurations, incomplete payment integration, security vulnerabilities, and logical flaws that could lead to overbooking and data inconsistency.

---

## 🔴 CRITICAL ISSUES

### 1. **Backend Port Mismatch**
**Severity:** CRITICAL  
**Location:** `backend/run.py` vs Frontend configs

**Problem:**
- Backend runs on port **3002** (run.py:7)
- Frontend expects API on **5000** (multiple files)
- This causes all API calls to fail

**Current Code (run.py:7):**
```python
app.run(debug=True, port=3002)
```

**Frontend API URLs:**
- `src/app/page.js:8` - `http://localhost:5000`
- `src/app/booking/[id]/page.js:6` - `http://localhost:5000`
- `src/app/ticket/[id]/page.js:15` - `http://localhost:3002` (WRONG!)
- `src/app/event/[id]/page.js:25` - `http://localhost:5000`

**Fix Required:**
```python
# Change run.py to use port 5000
app.run(debug=True, port=5000)
```

---

### 2. **JWT Token Inconsistency**
**Severity:** CRITICAL  
**Location:** Multiple files

**Problem:**
Token structure is inconsistent across the app:
- Backend creates token with: `create_access_token(identity={"id": id, "role": role})`
- Frontend expects: `decoded.sub.role`, `decoded.sub.id` 
- JWT uses `sub` claim automatically

**Affected Files:**
- `src/app/login/page.js:32-39` - Decodes as `decoded.sub.role`
- `src/app/sign-up/page.js:52` - Decodes as `decoded.sub.role`
- `src/app/dashboard/user/page.js:31` - Decodes as `decoded.sub.id`
- Backend JWT creates identity dict but frontend tries to access `.role` directly

**Fix Required (backend/app/routes/user_routes.py):**
```python
# Current (WRONG):
access_token = create_access_token(identity={
    "id": user.id,
    "role": user.role
})

# Fixed:
from flask_jwt_extended import create_access_token
access_token = create_access_token(identity=user.id)
# Then use claims for role
```

---

### 3. **Hardcoded User ID (Major Security & Logic Flaw)**
**Severity:** CRITICAL  
**Location:** Multiple routes and frontend

**Problem:**
- All ticket creation uses `user_id: 1` hardcoded
- This means all bookings go to first user, not the logged-in user
- No user identification from JWT token

**Affected:**
- `src/app/event/[id]/page.js:116` - `user_id: 1`
- `src/app/booking/[id]/page.js:96` - `user_id: 1`
- `backend/app/routes/ticket_routes.py:13` - Gets user by ID but doesn't validate

**Fix Required:**
```javascript
// Extract user_id from JWT token
const token = localStorage.getItem('token');
const decoded = jwtDecode(token);
const userId = decoded.sub?.id || decoded.sub; // Depends on token fix

// Use it in booking
"user_id": userId
```

---

### 4. **Incomplete M-Pesa Integration (Mock Only)**
**Severity:** CRITICAL  
**Location:** `backend/app/routes/mpesa_routes.py`

**Problem:**
- STK Push endpoint only creates mock transaction
- Callback handler is incomplete and non-functional
- No actual M-Pesa API integration
- Payment status never updates to confirmed

**Current Issues:**
- `mpesa_stk_push()` generates fake request ID but doesn't call real Safaricom API
- `mpesa_callback()` receives callback but doesn't map it to ticket
- No receipt number tracking
- No payment confirmation webhook

**Needs:**
```python
# Real M-Pesa Integration Requirements:
1. Get OAuth token from M-Pesa API
2. Call C2B API with proper credentials
3. Handle callback with receipt mapping
4. Update ticket status to "confirmed" on successful payment
5. Store transaction ID properly
```

---

### 5. **No Ticket Availability Protection (Overbooking Risk)**
**Severity:** CRITICAL  
**Location:** `src/app/event/[id]/page.js` and `backend/app/routes/ticket_routes.py`

**Problem:**
- Ticket availability is calculated client-side only
- Frontend fetches all tickets every 9 seconds (inefficient)
- Race condition: Two users can book last ticket simultaneously
- No database-level uniqueness constraint

**Current Issue:**
```javascript
// Client calculates remaining = capacity - sold
// But this can be stale or race with other users
```

**Solution Needed:**
```python
# Add to Ticket model - reserved tickets with expiration
# OR implement seat reservation system
# OR add database check before ticket creation:

def create_ticket():
    # LOCK the availability before creating ticket
    tier = TicketPrice.query.filter_by(...).with_for_update().first()
    sold_count = Ticket.query.filter_by(ticket_type=tier.ticket_type).count()
    
    if sold_count >= capacity:
        return error "Sold out"
    # Now create ticket safely
```

---

### 6. **Authentication Not Enforced on API Routes**
**Severity:** HIGH  
**Location:** All backend routes

**Problem:**
- Routes don't use `@jwt_required()` decorator
- Anyone can call `/user/tickets?user_id=999` and get any user's tickets
- M-Pesa callback is unauthenticated
- Admin endpoints are not protected

**Current:**
```python
@main.route('/user/tickets', methods=['GET'])
def get_user_tickets():  # NO PROTECTION!
    user_id = request.args.get('user_id', type=int)  # Client supplies this!
```

**Fix:**
```python
from flask_jwt_extended import jwt_required, get_jwt_identity

@main.route('/user/tickets', methods=['GET'])
@jwt_required()
def get_user_tickets():
    user_id = get_jwt_identity()  # From token, not request
```

---

### 7. **Ticket Payment Status Tracking Broken**
**Severity:** HIGH  
**Location:** `backend/app/models.py` and routes

**Problem:**
- `mpesa_status` starts as "pending" but never updates after payment
- Email confirmation doesn't correlate with payment success
- QR code generated before payment is complete
- No transaction history

**Current Flow (Wrong):**
```
1. Create Ticket → mpesa_status = "pending"
2. Send STK Push → (user pays)
3. M-Pesa callback received → (not handled properly)
4. Ticket status still "pending" → No confirmation
```

**Should Be:**
```
1. Create Ticket → mpesa_status = "pending" (hold)
2. Send STK Push
3. M-Pesa callback validates receipt
4. Update ticket mpesa_status = "confirmed"
5. Only THEN generate QR and send email
```

---

### 8. **No Email Verification Flow**
**Severity:** MEDIUM  
**Location:** `backend/app/routes/mpesa_routes.py`

**Problem:**
- Email configuration uses hardcoded credentials
- No way to verify user email before sending ticket
- Email could be fake/invalid
- SMTP credentials exposed in code

**Current:**
```python
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS", "your_email@gmail.com")  # SECURITY RISK
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "your_app_password")
```

---

## 🟡 MAJOR LOGIC ISSUES

### 9. **Ticket Price Management**
**Severity:** HIGH  
**Location:** `backend/app/models.py`, Admin dashboard

**Problem:**
- Two separate ticket storage systems:
  - `Ticket` model (actual bookings)
  - `TicketPrice` model (catalog)
- When booking, price is copied from request, not validated against `TicketPrice`
- Price can be manipulated from frontend

**Current Code (ticket_routes.py:10):**
```python
ticket = Ticket(
    price=data['price'],  # TRUSTS FRONTEND!
)
```

**Fix:**
```python
ticket_price = TicketPrice.query.filter_by(
    event_id=event_id,
    ticket_type=ticket_type
).first()
if not ticket_price or not ticket_price.price:
    return error "Invalid ticket type"
    
ticket = Ticket(
    price=ticket_price.price,  # FROM DATABASE
)
```

---

### 10. **Role-Based Access Control Missing**
**Severity:** HIGH  
**Location:** Admin dashboard and routes

**Problem:**
- Only frontend checks role, backend doesn't
- Any user can access `/admin` route and try to modify events
- No API endpoint validation for admin operations
- User dashboard shows all users data

**Routes Needing Protection:**
- POST/PUT/DELETE `/events` - Admin only
- DELETE `/events/<id>` - Admin only  
- GET `/users` - Should not exist in public API

---

### 11. **QR Code Generation Issues**
**Severity:** MEDIUM  
**Location:** `backend/app/routes/mpesa_routes.py:37`

**Problem:**
- Uses only ticket_id in QR code data
- Not unique enough to prevent fraud
- Should include timestamp, event ID, hash

**Current:**
```python
qr_data = f"TICKET#{ticket_id}"  # TOO SIMPLE
```

**Better:**
```python
import hashlib
timestamp = datetime.now().isoformat()
hash_str = hashlib.sha256(f"{ticket_id}{event_id}{timestamp}".encode()).hexdigest()[:8]
qr_data = f"TICKET#{ticket_id}#{hash_str}"
```

---

### 12. **Session Storage for Booking Data**
**Severity:** MEDIUM  
**Location:** `src/app/booking/[id]/page.js`

**Problem:**
- Uses `sessionStorage` which can be manipulated
- Booking data could be altered before submission
- No validation of stored booking details

**Should:**
- Store only ticket ID in session
- Re-fetch ticket details from API before payment
- Validate price hasn't changed

---

### 13. **No Concurrent Request Handling**
**Severity:** HIGH  
**Location:** Database models

**Problem:**
- Multiple simultaneous bookings not handled
- No transaction isolation
- Possible data corruption

**Fix:**
- Add database constraints
- Use pessimistic locking
- Add transaction timeouts

---

## 🟢 MEDIUM ISSUES

### 14. **Event Date Not Validated**
- Events in the past can still accept bookings
- Should validate event.date > now()

### 15. **No Password Requirements**
- Sign-up checks 8 chars minimum but...
- Backend doesn't validate password strength
- No special character requirements

### 16. **CORS Enabled for All Origins**
```python
CORS(app)  # Dangerous! Should specify allowed origins
```

### 17. **No Rate Limiting**
- User can spam requests
- M-Pesa can be spammed
- No protection against DDoS

### 18. **Database Migrations**
- Multiple migration files but no clear sequence
- Should use proper versioning

---

## 📋 ACTION PLAN (Priority Order)

### Phase 1: CRITICAL (Do First)
- [ ] Fix backend port to 5000
- [ ] Fix JWT token structure and usage
- [ ] Extract user_id from JWT, remove hardcoded 1
- [ ] Add @jwt_required() to all protected routes
- [ ] Implement proper M-Pesa callback handling
- [ ] Add database check for ticket availability

### Phase 2: HIGH (Do Second)
- [ ] Implement ticket price validation from DB
- [ ] Add admin-only decorators to event routes
- [ ] Fix payment status tracking flow
- [ ] Remove/protect user listing endpoint
- [ ] Add event date validation

### Phase 3: MEDIUM (Do After)
- [ ] Improve QR code generation
- [ ] Move session validation to API
- [ ] Add rate limiting
- [ ] Fix CORS configuration
- [ ] Add email verification

---

## ✅ VERIFICATION CHECKLIST

After fixes, verify:
- [ ] Login works and token is generated correctly
- [ ] User dashboard shows only own tickets
- [ ] Can't book more tickets than available
- [ ] Two simultaneous bookings don't overbook
- [ ] M-Pesa callback properly updates ticket status
- [ ] Email sent only after payment confirmed
- [ ] QR codes are unique and scannable
- [ ] Admin can create/edit events
- [ ] Regular users can't access admin routes
- [ ] All dates are in correct timezone
- [ ] Payment amounts match exactly
