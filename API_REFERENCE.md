# Flex-It API Reference - After Fixes

## Base URL
- **Development:** `http://localhost:5000`
- **Environment:** Set `NEXT_PUBLIC_API_URL` in Next.js for frontend

---

## 🔐 Authentication Endpoints

### Register User
```
POST /register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response: 201 Created
{
  "message": "User created successfully"
}
```

### Login
```
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response: 200 OK
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Store token: localStorage.setItem('token', access_token)
Use in requests: Authorization: Bearer {access_token}
```

---

## 📅 Event Endpoints

### Get All Events
```
GET /events
No authentication required

Response: 200 OK
[
  {
    "id": 1,
    "name": "Summer Concert",
    "date": "2025-07-20",
    "venue": "City Arena",
    "description": "...",
    "image": "...",
    "ticket_prices": [
      {
        "id": 1,
        "ticket_type": "VIP",
        "price": 5000
      },
      {
        "id": 2,
        "ticket_type": "General",
        "price": 2000
      }
    ]
  }
]
```

### Get Single Event
```
GET /events/{event_id}
No authentication required

Response: 200 OK
{
  "id": 1,
  "name": "Summer Concert",
  "date": "2025-07-20",
  "venue": "City Arena",
  ...
}
```

### Create Event (Admin Only)
```
POST /events
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Winter Festival",
  "date": "2025-12-25",
  "venue": "Central Park",
  "description": "Holiday celebration",
  "image": "https://...",
  "ticket_prices": [
    {
      "ticket_type": "VIP",
      "price": 5000
    },
    {
      "ticket_type": "General",
      "price": 2000
    }
  ]
}

Response: 201 Created
{
  "message": "Event created",
  "id": 1
}

❌ WITHOUT admin token: 403 Forbidden
```

### Update Event (Admin Only)
```
PUT /events/{event_id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Updated Name",
  "date": "2025-12-26",
  ...
}

Response: 200 OK
{
  "message": "Event updated"
}
```

### Delete Event (Admin Only)
```
DELETE /events/{event_id}
Authorization: Bearer {admin_token}

Response: 200 OK
{
  "message": "Event deleted"
}
```

---

## 🎫 Ticket Endpoints

### Create Ticket (Book Ticket)
```
POST /tickets
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "event_id": 1,
  "ticket_type": "VIP",
  "quantity": 2,
  "payment_method": "mpesa"
}

⚠️ NOTE: 
- Price is NOT sent - backend validates from TicketPrice table
- User ID is extracted from JWT token (not sent)
- If no token, uses default user_id

Response: 201 Created
{
  "message": "Ticket created",
  "id": 5,
  "ticket_type": "VIP",
  "price": 5000,
  "quantity": 2
}
```

### Get All Tickets (Public - for availability)
```
GET /tickets
No authentication required

Response: 200 OK
[
  {
    "id": 1,
    "type": "VIP",
    "price": 5000,
    "quantity": 2,
    "user_id": 1,
    "event_id": 1,
    "mpesa_status": "confirmed",
    ...
  }
]
```

### Get Specific Ticket
```
GET /tickets/{ticket_id}
No authentication required

Response: 200 OK
{
  "id": 1,
  "ticket_type": "VIP",
  "price": 5000,
  "quantity": 2,
  "qr_code": "data:image/png;base64,...",
  "mpesa_status": "confirmed",
  "mpesa_transaction_id": "...",
  ...
}
```

### Get My Tickets (Authenticated User Only)
```
GET /user/tickets
Authorization: Bearer {user_token}
⚠️ OLD: /user/tickets?user_id={id} (no longer needed, JWT used)

Response: 200 OK
[
  {
    "id": 5,
    "type": "VIP",
    "price": 5000,
    "user_id": 1,
    "event_id": 1,
    "mpesa_status": "confirmed",
    "qr_code": "...",
    "created_at": "2025-01-15T10:30:00"
  }
]

❌ WITHOUT token: 401 Unauthorized
❌ WITHOUT valid token: 422 Unprocessable Entity
```

---

## 💳 Payment Endpoints

### Initiate M-Pesa Payment (STK Push)
```
POST /mpesa/stk-push
Content-Type: application/json

{
  "phone": "0712345678",  or "+254712345678"
  "amount": 10000,
  "ticket_id": 5,
  "first_name": "John",
  "last_name": "Doe"
}

Response: 200 OK
{
  "request_id": "STK5202501151030450123",
  "status": "pending",
  "message": "STK Push sent to 254712345678. Please enter your M-Pesa PIN.",
  "phone": "254712345678",
  "amount": 10000
}

⚠️ IMPORTANT:
- User should receive STK prompt on their phone
- User enters M-Pesa PIN
- Your callback URL receives the response
- You must update ticket status in callback
```

### Handle M-Pesa Callback
```
The system receives callback at configured URL
MPESA_CALLBACK_URL = http://yourserver.com/mpesa/callback

The callback handler:
1. Checks result code (0 = success)
2. Extracts receipt number
3. Updates ticket mpesa_status to "confirmed"

⚠️ CURRENTLY: This is mock - real implementation needed
```

### Get QR Code for Ticket
```
GET /tickets/{ticket_id}/qr-code

Response: 200 OK
{
  "ticket_id": 5,
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
}

QR Code data contains: TICKET#{ticket_id}#{hash}
```

### Send Confirmation Email
```
POST /tickets/{ticket_id}/send-confirmation
Content-Type: application/json

{
  "email": "customer@example.com",
  "qr_code": "data:image/png;base64,..."
}

Response: 200 OK
{
  "status": "success",
  "message": "Confirmation email sent to customer@example.com"
}

⚠️ REQUIRES: Valid SMTP credentials in env vars
```

---

## 📊 Key Changes from Original Code

| Issue | Before | After |
|-------|--------|-------|
| **Backend Port** | 3002 | 5000 |
| **User ID in Booking** | Hardcoded to 1 | Extracted from JWT |
| **Price in Booking** | From frontend request | Validated from database |
| **Event Creation** | Any user can create | Admin only (requires JWT) |
| **User Tickets Endpoint** | Query param (security issue) | JWT extraction (secure) |
| **Auth Enforcement** | None | @jwt_required() decorators |
| **CORS** | Allow all origins | Restricted to frontend URL |
| **JWT Token Structure** | identity dict | identity as ID, claims for role |

---

## 🚨 Common Errors & Solutions

### 401 Unauthorized
**Cause:** Missing or invalid JWT token
```javascript
const token = localStorage.getItem('token');
if (!token) {
  // Redirect to login
  router.push('/login');
}

// When making request:
headers: {
  'Authorization': `Bearer ${token}`
}
```

### 403 Forbidden
**Cause:** User is not admin
**Solution:** Only admin users can create/edit/delete events
```python
# Check in dashboard/admin that decoded.sub.role === "admin"
```

### 400 Bad Request - "Invalid ticket type"
**Cause:** Ticket type doesn't exist for that event
**Solution:** Select a ticket type that was created with the event
```
Event must have ticket_prices with matching ticket_type
```

### 409 Conflict - Price doesn't match
**Cause:** Frontend sent different price than database has
**Solution:** Backend now uses DB price, this error shouldn't occur

### 422 Unprocessable Entity - No token
**Cause:** Wrong endpoint or missing JWT header
**Solution:** Check Authorization header is set: `Bearer {token}`

---

## ✅ Verification Steps

### Step 1: Backend Running
```bash
# Check if backend is accessible
curl http://localhost:5000/events

# Should return: [] or list of events
# Should NOT return: Connection refused
```

### Step 2: Create Test User
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### Step 3: Login and Get Token
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'

# Save the token:
TOKEN="eyJ0eXA..."
```

### Step 4: Create Test Event (Admin)
```bash
# First, you need an admin user
# Modify user role in database
# UPDATE users SET role = 'admin' WHERE id = 1

curl -X POST http://localhost:5000/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Event",
    "date": "2025-12-31",
    "venue": "Test Arena",
    "ticket_prices": [
      {"ticket_type": "General", "price": 1000}
    ]
  }'
```

### Step 5: Book Ticket
```bash
curl -X POST http://localhost:5000/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "event_id": 1,
    "ticket_type": "General",
    "quantity": 1,
    "payment_method": "card"
  }'
```

### Step 6: Verify Your Tickets
```bash
curl http://localhost:5000/user/tickets \
  -H "Authorization: Bearer $TOKEN"

# Should see the ticket you just created
```

---

## 📝 Notes on Remaining Work

### M-Pesa Integration
- Currently returns mock responses
- Real implementation requires Safaricom API credentials
- Callback handling is incomplete
- Payment status not updated after actual payment

### Overbooking Protection
- Frontend checks availability but race conditions possible
- Database-level locking not yet implemented
- Multiple simultaneous bookings could oversell

### Email Confirmations
- Only send if payment confirmed (not yet checked)
- QR code embedded in email (working)
- Email credentials needed from Gmail/SMTP provider

See `COMPREHENSIVE_AUDIT_REPORT.md` and `IMPLEMENTATION_SUMMARY.md` for details.
