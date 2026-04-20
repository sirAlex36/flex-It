# Quick Start Guide - Admin Features

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd /home/alex/Moringa/Project/flex-It/backend

# Install dependencies
pip install -r requirements.txt

# Run migrations (if needed)
flask db upgrade

# Start backend server
python run.py
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd /home/alex/Moringa/Project/flex-It

# Install dependencies
npm install

# Start frontend development server
npm run dev
# Open http://localhost:3000
```

### 3. Create Admin Account

Register as a regular user first:
1. Go to http://localhost:3000/sign-up
2. Create account with email/password
3. Go to database console and change role to "admin"

Or directly in database:
```sql
UPDATE users SET role='admin' WHERE email='your-admin@email.com';
```

---

## 📊 ADMIN DASHBOARD FEATURES

### Overview Tab
- Total events created
- Total users registered
- Total revenue collected
- Transaction statistics
- Quick create event button

### Events Tab
- View all events in table format
- Create new event
- Edit/delete existing events
- View event details

### Users Tab
- View all registered users
- Filter by role
- See user details (name, email, role, registration date, last login)
- *(Actions coming in Phase 2)*

### Transactions Tab
- View all payment transactions
- Filter by status (pending, success, failed)
- View payment details
- Confirm/refund payments manually
- *(Full implementation coming in Phase 2)*

### Tickets Tab
- View all tickets across events
- Filter by event, user, or status
- Resend confirmation emails
- Regenerate QR codes
- Cancel tickets
- Check-in (mark as used)
- *(UI implementation coming in Phase 2)*

### Analytics Tab
- Revenue dashboard
- Tickets sold metrics
- Payment success rate
- Event performance
- User growth trends
- *(Detailed charts coming in Phase 2)*

---

## 🔑 KEY ENDPOINTS TO TEST

### Test with curl or Postman:

```bash
# 1. Register user
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'

# 2. Login and get token
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# 3. Get dashboard analytics (requires token)
curl -X GET http://localhost:5000/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Get all users (admin only)
curl -X GET http://localhost:5000/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 5. Get transactions
curl -X GET http://localhost:5000/transactions \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🎟️ BOOKING FLOW (FIXED)

1. User logs in → JWT token generated
2. User visits event page → Selects ticket type & quantity
3. **User ID automatically taken from JWT token** (not hardcoded)
4. Ticket created in database with status="pending"
5. Frontend calls /mpesa/stk-push to initiate payment
6. User confirms M-Pesa on phone
7. Backend callback confirms payment
8. QR code generated and emitted
9. Confirmation email sent

**Security Fix**: User ID now comes from JWT, preventing users from booking for others.

---

## 👤 USER MANAGEMENT (Admin Only)

### View Users
```
GET /admin/users?page=1&per_page=10&role=user
```

### Get User Details
```
GET /admin/users/5
```

Shows:
- Basic info (name, email, role)
- Registration date & last login
- Statistics (tickets purchased, total spent, events attended)
- Recent login history

### Change User Role
```
PUT /admin/users/5/role
{"role": "admin"}
```

### Suspend User (Disable Login)
```
PUT /admin/users/5/suspend
{"suspend": true}
```

### Delete User (Soft Delete - Data Preserved)
```
DELETE /admin/users/5
```

### Reset User Password
```
POST /admin/users/5/reset-password
```

Admin gets temporary password to send to user.

---

## 💳 TRANSACTION MANAGEMENT (Admin Only)

### View All Transactions
```
GET /transactions?status=success&page=1&per_page=20
```

Filters:
- `status`: pending, success, failed, cancelled
- `payment_method`: mpesa, card, etc.

### Manually Confirm Payment (Fallback)
```
POST /transactions/123/confirm
{"mpesa_receipt": "ABC123"}
```

When M-Pesa callback fails, admin can manually confirm.

### Refund Payment
```
POST /transactions/123/refund
{"amount": 10000}
```

Amount optional (defaults to full transaction amount).

### Retry Failed Payment
```
POST /tickets/42/retry-payment
```

Resets transaction to pending for retry.

---

## 📈 ANALYTICS ENDPOINTS

### Dashboard Overview
```
GET /analytics/dashboard
```

Returns: revenues, user counts, event counts, top events

### Event Performance
```
GET /analytics/events/1/performance
```

Returns: ticket sales by tier, check-in rate, attendance

### Revenue Trends
```
GET /analytics/revenue-trends?days=30
```

Returns: daily revenue over last 30 days

### User Metrics
```
GET /analytics/user-metrics?days=30
```

Returns: new users, returning users, top customers

---

## 📋 AUDIT LOGS & SECURITY

### View All Admin Actions
```
GET /admin/audit-logs?entity_type=User&page=1&per_page=20
```

Shows:
- Who did what
- When it happened
- What data changed
- Entity affected (User, Event, Ticket, etc.)

### View Login History
```
GET /admin/login-history?user_id=5&page=1&per_page=20
```

Shows:
- All login attempts (success/failed)
- IP address
- Device/browser info
- Timestamp

---

## 🛠️ TROUBLESHOOTING

### Issue: "Admin access required" when testing endpoints

**Solution**: Make sure token belongs to admin user. Update in database:
```sql
UPDATE users SET role='admin' WHERE id=1;
```

### Issue: API returns 404 for new endpoints

**Solution**: Restart backend server to reload routes:
```bash
# Stop current server (Ctrl+C)
python run.py  # Start again
```

### Issue: JWT token invalid or expired

**Solution**: Get new token by logging in again:
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Issue: User booking failing with "Invalid user"

**Solution**: Make sure user is logged in first. The booking endpoint now requires JWT authentication and gets user ID from tthe token.

---

## 📚 DOCUMENTATION

Full documentation available in:
- `API_ENDPOINTS.md` - Complete API reference with examples
- `IMPLEMENTATION_COMPLETE.md` - Summary of all changes
- Code comments in route files

---

## 🔐 SECURITY NOTES

1. **Never share JWT tokens** - Treat them like passwords
2. **Always use HTTPS in production** - JWT tokens can be decoded
3. **Set strong SECRET_KEY** in environment
4. **Regularly review audit logs** for suspicious activity
5. **Be careful with password reset** - Send securely to user
6. **Log all administrative actions** - Audit trail for compliance

---

## ✅ VERIFICATION CHECKLIST

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can login as admin user
- [ ] Can view admin dashboard
- [ ] Can view users list
- [ ] Can create event
- [ ] Can view transactions
- [ ] Can view audit logs
- [ ] JWT token working properly
- [ ] Bookings using authenticated user ID

---

## 🆘 COMMON NEXT STEPS

1. **Database Migrations**: Run Alembic migrations to apply schema changes
2. **Email Integration**: Connect SendGrid/AWS SES for actual email sending
3. **M-Pesa Integration**: Connect real Safaricom API for payments
4. **UI Polish**: Build detailed admin pages for all features
5. **Testing**: Create test suite for all endpoints
6. **Deployment**: Set up Docker & deploy to staging

---

Questions or issues? Check the code comments or contact the development team.
