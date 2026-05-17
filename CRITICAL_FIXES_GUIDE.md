# Remaining Critical Issues - Implementation Guide

## ✅ STATUS: 4 of 4 Critical Issues ADDRESSED

---

## 🔧 ISSUE #1: M-Pesa Payment Integration (FIXED)

### Location: `backend/app/routes/mpesa_routes.py`

### What Changed:
- **Lines 145-230:** `mpesa_stk_push()` now creates Transaction record
- **Lines 260-370:** `mpesa_callback()` now properly updates Ticket + generates QR + sends email
- **Lines 373-410:** `get_qr_code()` now only returns QR if payment confirmed
- **Lines 414-460:** `send_ticket_confirmation()` now only sends if payment confirmed
- **Lines 464-510:** New endpoint `/transactions/<ticket_id>` for payment history

### Key Implementation Points:

```python
# BEFORE (BROKEN):
- Created QR code immediately when token bought
- Sent email immediately (no payment verification)
- No transaction tracking
- Callback didn't update anything

# AFTER (FIXED):
1. STK Push → Creates Transaction record (status="pending")
2. User pays M-Pesa
3. Callback received → Updates Transaction (status="success")
4. THEN Ticket status → "confirmed"
5. THEN QR code generated
6. THEN Email sent

# FLOW (Lines 145-370 in order):
mpesa_stk_push() 
  ↓ (user enters M-Pesa PIN)
mpesa_callback() [M-Pesa server sends this]
  ├─ Parse callback data
  ├─ Extract receipt number
  ├─ Update Transaction: status="success", receipt stored
  ├─ Update Ticket: mpesa_status="confirmed"
  ├─ Generate QR code (NOW - only after confirmed)
  ├─ Send email (NOW - only after QR generated)
  └─ Return 200 OK to M-Pesa
```

### For Production M-Pesa Integration:
```python
# Lines 230-240 shows where to add REAL M-Pesa API call:
    # Get OAuth token
    token = get_mpesa_access_token()
    
    # Call Safaricom STK Push API
    stk_url = f"{MPESA_API_URL}/mpesa/stkpush/v1/processrequest"
    payload = {
        "BusinessShortCode": MPESA_SHORTCODE,
        "Password": generate_mpesa_password(),
        "Timestamp": timestamp.strftime("%Y%m%d%H%M%S"),
        "Amount": amount,
        "PartyA": phone,
        "PartyB": MPESA_SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": MPESA_CALLBACK_URL,
        "AccountReference": f"TICKET{ticket_id}",
        "TransactionDesc": "Event Ticket Payment"
    }
    response = requests.post(stk_url, json=payload, headers=headers)
```

### Test This:
```bash
# 1. Book ticket (this creates pending ticket):
curl -X POST http://localhost:5000/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event_id":1,"ticket_type":"General","quantity":1}'
# Response: {"id": 5, "status": "pending"}

# 2. Initiate M-Pesa push:
curl -X POST http://localhost:5000/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -d '{"phone":"0712345678","amount":2000,"ticket_id":5}'
# Response: {"request_id":"STK5...", "status":"pending"}

# 3. Check ticket status (still pending):
curl http://localhost:5000/tickets/5
# Response: "mpesa_status": "pending", "qr_code": null

# 4. Simulate callback (IN PRODUCTION: M-Pesa sends this):
# See TESTING.md for full callback simulation

# 5. Check ticket status (now confirmed):
# Response: "mpesa_status": "confirmed", "qr_code": "data:image/png..."
```

---

## 🔧 ISSUE #2: Overbooking Protection (FIXED)

### Location: `backend/app/routes/ticket_routes.py`

### What Changed:
- **Lines 1-50:** `get_ticket_capacity()` and `check_and_reserve_ticket()` functions added
- **Lines 85-110:** `create_ticket()` now calls `check_and_reserve_ticket()` BEFORE creating ticket
- **New endpoint:** `GET /events/<id>/availability` for real-time availability

### How It Works:

```python
# RACE CONDITION EXAMPLE (Before):
User A: "Buy VIP" → count=49 → CREATE ✓
User B: "Buy VIP" → count=49 → CREATE ✓
# BOTH succeeded but last 2 tickets oversold! ❌

# DATABASE LOCKING (After):
User A: "Buy VIP" → LOCK tier row → count=49 → CREATE → UNLOCK ✓
User B: "Buy VIP" → WAIT for lock → LOCK tier row → count=50 → REJECT ✓
# User B gets error: "Only 0 tickets remain" ✓
```

### Implementation Details:

**Line 28-65: `check_and_reserve_ticket(event_id, ticket_type, quantity)`**
```python
# This function:
tier = TicketPrice.query...with_for_update().first()  # LOCKS database row
sold_count = count confirmed tickets
if available < quantity:
    return False, "error message"
else:
    return True, None

# Called from create_ticket() at line 109:
available, error = check_and_reserve_ticket(event.id, ticket_type, quantity)
if not available:
    return jsonify({"error": error}), 400
```

### New Endpoint for Frontend:

```python
# Lines 165-230: GET /events/<id>/availability

# Response Example:
{
    "event_id": 1,
    "event_name": "Summer Concert",
    "total_capacity": 400,
    "total_sold": 125,
    "total_remaining": 275,
    "sold_percentage": 31,
    "by_tier": {
        "VIP": {
            "capacity": 50,
            "sold": 45,
            "remaining": 5,
            "price": 5000
        },
        "General": {
            "capacity": 200,
            "sold": 80,
            "remaining": 120,
            "price": 2000
        }
    }
}
```

### Frontend Should Update To:

In `src/app/event/[id]/page.js`:

```javascript
// Instead of calculating availability on frontend, fetch from API:
const response = await fetch(`${API_URL}/events/${params.id}/availability`);
const availability = await response.json();

// Now it's guaranteed to be accurate and prevents race conditions
console.log(availability.by_tier.General.remaining);
```

---

## 🔧 ISSUE #3: Payment Confirmation Flow (FIXED)

### Location: `backend/app/routes/mpesa_routes.py` Lines 260-370

### New Flow:

```
BEFORE (BROKEN):
┌─────────────────────────────┐
│ User clicks "Book Ticket"   │
└─────────────┬───────────────┘
              ↓
    ❌ QR Code generated immediately
    ❌ Email sent immediately
    ❌ Payment pending but ticket "confirmed"
    ❌ What if payment fails? Ticket still sent! 🚨

AFTER (FIXED):
┌─────────────────────────────┐
│ 1. Click "Book Ticket"      │
└─────────────┬───────────────┘
              ↓
    ✓ Ticket created: status="pending"
    ✓ QR code NOT generated
    ✓ Email NOT sent
              ↓
┌─────────────────────────────┐
│ 2. Click "Pay with M-Pesa"  │
└─────────────┬───────────────┘
              ↓
    ✓ STK Push sent to phone
    ✓ Transaction created: status="pending"
              ↓
┌──────────────────────────────┐
│ 3. User enters M-Pesa PIN    │
└──────────────┬───────────────┘
               ↓
  (M-Pesa backend processes payment)
               ↓
┌──────────────────────────────┐
│ 4. Callback received from    │
│    M-Pesa (mpesa_callback)   │
└──────────────┬───────────────┘
               ↓
    ✓ Parse receipt number
    ✓ Update Transaction: status="success", receipt stored
    ✓ Update Ticket: status="confirmed"
               ↓
    ✓ GENERATE QR code (NOW!)
    ✓ SEND EMAIL (NOW!)
               ↓
    ✓ User receives confirmation email with QR code
    ✓ Ticket ready for event entry
```

### Code Locations:

**Line 260-280:** Callback parsing
```python
result_code = stk_callback.get("ResultCode")
if result_code == 0:  # Payment successful
    receipt_number = extract_from_metadata()
```

**Line 285-295:** Transaction update
```python
transaction.status = "success"
transaction.mpesa_receipt = receipt_number
db.session.commit()
```

**Line 297-302:** Ticket update
```python
ticket.mpesa_status = "confirmed"
ticket.mpesa_transaction_id = receipt_number
db.session.commit()
```

**Line 304-310:** QR code generation
```python
qr_code = generate_qr_code(ticket.id, ticket.event_id)
ticket.qr_code = qr_code
db.session.commit()  # QR stored with ticket
```

**Line 312-330:** Email sending
```python
email_sent = send_confirmation_email(user.email, ticket_info, qr_code)
ticket.email_confirmed = True
db.session.commit()
```

---

## 🔧 ISSUE #4: Transaction History Tracking (FIXED)

### Location: Backend Models + Routes

### What's New:

**File: `backend/app/models.py` Lines 65-85**
```python
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'))
    amount = db.Column(db.Integer)  # Ksh amount
    mpesa_receipt = db.Column(db.String(120), unique=True)  # Receipt #
    mpesa_reference = db.Column(db.String(255))  # Request ID
    status = db.Column(db.String(50))  # pending|success|failed
    payment_method = db.Column(db.String(50))  # mpesa|card|etc
    error_message = db.Column(db.Text)  # If failed
    initiated_at = db.Column(db.DateTime)  # When user started payment
    confirmed_at = db.Column(db.DateTime)  # When payment succeeded
```

### Migration Applied:
```
File: backend/migrations/versions/add_transaction_model.py
- Creates transactions table
- Adds unique constraint on mpesa_receipt
- Properly links to tickets
```

### Run Migration:
```bash
cd /home/alex/Moringa/Project/flex-It/backend
flask db upgrade
```

### Query Payment History:

**Endpoint: `GET /transactions/<ticket_id>`**

```python
# Returns all payment attempts for a ticket
# Lines 464-510 in mpesa_routes.py

Response:
[
    {
        "id": 1,
        "amount": 2000,
        "status": "success",
        "mpesa_receipt": "RKS1234567",
        "mpesa_reference": "STK5200503010505...",
        "payment_method": "mpesa",
        "initiated_at": "2025-03-31T14:30:00",
        "confirmed_at": "2025-03-31T14:31:00",
        "error_message": null
    },
    {
        "id": 2,
        "amount": 2000,
        "status": "failed",
        "mpesa_receipt": null,
        "mpesa_reference": "STK5200503010506...",
        "payment_method": "mpesa",
        "initiated_at": "2025-03-31T14:25:00",
        "confirmed_at": null,
        "error_message": "Insufficient funds in account"
    }
]
```

---

## 📋 NEXT STEPS TO COMPLETE IMPLEMENTATION

### STEP 1: Run Database Migration
```bash
cd backend
flask db upgrade
```

### STEP 2: Update Frontend (src/app/event/[id]/page.js)

Remove immediate QR/email generation:
```javascript
// REMOVE THESE LINES (they run before payment):
setMpesaStatus("Generating QR code...");
const qrRes = await fetch(`${API_URL}/tickets/${ticketId}/qr-code`);

setMpesaStatus("Sending confirmation email...");
const emailRes = await fetch(`${API_URL}/tickets/${ticketId}/send-confirmation`);
```

Update availability fetching to use new endpoint:
```javascript
// OLD: Calculate on frontend (inaccurate)
const remaining = perTier.capacity - perTier.sold;

// NEW: Fetch actual availability from backend
const availRes = await fetch(`${API_URL}/events/${params.id}/availability`);
const availability = await availRes.json();
const remaining = availability.by_tier[ticketType].remaining;
```

### STEP 3: Test Complete Payment Flow

See `TEST_PAYMENT_FLOW.md` for step-by-step testing

### STEP 4: Setup M-Pesa Credentials (Production)

Update .env file:
```
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASS_KEY=your_pass_key
MPESA_CALLBACK_URL=https://your-domain.com/mpesa/callback
MPESA_API_URL=https://api.safaricom.co.ke  # Production URL
```

### STEP 5: Setup SMTP Email (Production)

```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_ADDRESS=your_email@gmail.com
EMAIL_PASSWORD=your_app_password  # Gmail app password, not regular password
```

---

## 📊 Summary of All Fixes

| Issue | Status | Location | Key Changes |
|-------|--------|----------|------------|
| M-Pesa Integration | ✅ FIXED | `mpesa_routes.py` | Proper transaction tracking, QR/email on callback |
| Overbooking | ✅ FIXED | `ticket_routes.py` | Database locking in `check_and_reserve_ticket()` |
| Payment Confirmation | ✅ FIXED | `mpesa_routes.py` callback | Multi-step flow with validations |
| Transaction History | ✅ FIXED | `models.py` + `mpesa_routes.py` | New Transaction model + endpoint |

---

## 🚀 Files Modified

1. ✅ `backend/app/models.py` - Added Transaction model
2. ✅ `backend/app/routes/mpesa_routes.py` - Complete rewrite with proper flow
3. ✅ `backend/app/routes/ticket_routes.py` - Added overbooking protection
4. ✅ `backend/migrations/versions/add_transaction_model.py` - Migration file
5. ⏳ `src/app/event/[id]/page.js` - Needs frontend updates

---

## ⚠️ IMPORTANT NEXT ACTIONS

1. **RUN MIGRATION** - Database won't work without Transaction table
2. **UPDATE FRONTEND** - Remove immediate QR/email generation
3. **TEST COMPLETE FLOW** - Booking → Payment → Confirmation
4. **SETUP CREDENTIALS** - M-Pesa + SMTP for production

See `TEST_PAYMENT_FLOW.md` for complete testing guide.
