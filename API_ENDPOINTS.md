# Flex-It API Endpoints Documentation

## Overview
This document describes all the backend API endpoints for the Flex-It ticketing platform. All endpoints require JWT authentication unless otherwise noted.

---

## 1. AUTHENTICATION ENDPOINTS

### Register New User
```
POST /register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "role": "user"  // Optional, defaults to "user"
}

Response (201):
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Login
```
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}

Response (200):
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## 2. EVENT MANAGEMENT ENDPOINTS

### Create Event (Admin Only)
```
POST /events
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Starlight Concert 2025",
  "date": "2025-06-15",
  "venue": "Kenya National Theatre",
  "description": "Amazing live concert",
  "ticket_prices": [
    {"ticket_type": "VIP", "price": 5000},
    {"ticket_type": "General", "price": 2000}
  ]
}

Response (201):
{
  "id": 1,
  "name": "Starlight Concert 2025",
  "date": "2025-06-15",
  "venue": "Kenya National Theatre",
  "ticket_prices": [...]
}
```

### Get All Events
```
GET /events?search=concert

Response (200):
[
  {
    "id": 1,
    "name": "Starlight Concert",
    "date": "2025-06-15",
    "venue": "Kenya National Theatre",
    "ticket_prices": [...]
  }
]
```

### Get Single Event
```
GET /events/1

Response (200):
{
  "id": 1,
  "name": "Starlight Concert",
  "ticket_prices": [...]
}
```

### Update Event (Admin Only)
```
PUT /events/1
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Event Name",
  "date": "2025-06-20"
}
```

### Delete Event (Admin Only)
```
DELETE /events/1
Headers: Authorization: Bearer {token}
```

### Get Event Availability
```
GET /events/1/availability

Response (200):
{
  "event_id": 1,
  "event_name": "Starlight Concert",
  "total_capacity": 400,
  "total_sold": 45,
  "total_remaining": 355,
  "sold_percentage": 11,
  "by_tier": {
    "VIP": {
      "capacity": 50,
      "sold": 10,
      "remaining": 40,
      "price": 5000
    },
    "General": {
      "capacity": 200,
      "sold": 25,
      "remaining": 175,
      "price": 2000
    }
  }
}
```

---

## 3. TICKET MANAGEMENT ENDPOINTS

### Create Ticket (User Must Be Logged In)
```
POST /tickets
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "event_id": 1,
  "ticket_type": "VIP",
  "quantity": 2,
  "email": "user@example.com",
  "phone": "+254712345678"
}

Response (201):
{
  "message": "Ticket created (awaiting payment)",
  "id": 42,
  "ticket_type": "VIP",
  "price": 5000,
  "quantity": 2,
  "status": "pending"
}
```

### Get User's Tickets
```
GET /user/tickets
Headers: Authorization: Bearer {token}

Response (200):
[
  {
    "id": 42,
    "type": "VIP",
    "price": 5000,
    "quantity": 2,
    "event_id": 1,
    "mpesa_status": "confirmed",
    "qr_code": "data:image/png;base64...",
    "created_at": "2025-01-15T10:30:00"
  }
]
```

### Get Single Ticket
```
GET /tickets/42
Response (200): Single ticket object
```

### Get All Tickets (Admin Only)
```
GET /admin/tickets?event_id=1&user_id=5&status=confirmed&page=1&per_page=20
Headers: Authorization: Bearer {token}

Response (200):
{
  "tickets": [...],
  "pagination": {...}
}
```

### Resend Ticket Email
```
POST /tickets/42/resend-email
Headers: Authorization: Bearer {token}

Response (200):
{
  "message": "Confirmation email resent",
  "ticket_id": 42,
  "email": "user@example.com"
}
```

### Regenerate QR Code
```
POST /tickets/42/regenerate-qr
Headers: Authorization: Bearer {token}

Response (200):
{
  "message": "QR code regenerated",
  "ticket_id": 42
}
```

### Cancel Ticket
```
POST /tickets/42/cancel
Headers: Authorization: Bearer {token}

Response (200):
{
  "message": "Ticket cancelled successfully",
  "ticket_id": 42,
  "status": "cancelled"
}
```

### Check-In Ticket (Admin Only)
```
POST /tickets/42/check-in
Headers: Authorization: Bearer {token}

Response (200):
{
  "message": "Ticket checked in successfully",
  "ticket_id": 42,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "event": {
    "id": 1,
    "name": "Starlight Concert"
  },
  "checked_in_at": "2025-01-15T18:45:00"
}
```

---

## 4. TRANSACTION & PAYMENT MANAGEMENT ENDPOINTS

### Get All Transactions (Admin Only)
```
GET /transactions?status=success&payment_method=mpesa&page=1&per_page=20
Headers: Authorization: Bearer {token}

Response (200):
{
  "transactions": [
    {
      "id": 1,
      "ticket_id": 42,
      "user": {...},
      "event": {...},
      "amount": 10000,
      "status": "success",
      "payment_method": "mpesa",
      "mpesa_receipt": "NJ2K12345",
      "error_message": null,
      "initiated_at": "2025-01-15T10:30:00",
      "confirmed_at": "2025-01-15T10:32:00"
    }
  ],
  "pagination": {...}
}
```

### Get Transaction Details (Admin Only)
```
GET /transactions/1
Headers: Authorization: Bearer {token}

Response (200):
{
  "id": 1,
  "ticket_id": 42,
  "ticket": {...},
  "user": {...},
  "event": {...},
  "amount": 10000,
  "status": "success",
  "payment_method": "mpesa",
  "mpesa_receipt": "NJ2K12345",
  "mpesa_reference": "ABC123",
  "error_message": null,
  "initiated_at": "2025-01-15T10:30:00",
  "confirmed_at": "2025-01-15T10:32:00"
}
```

### Manually Confirm Payment (Admin Only)
```
POST /transactions/1/confirm
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "mpesa_receipt": "NJ2K12345"  // Optional
}

Response (200):
{
  "message": "Payment confirmed successfully",
  "transaction_id": 1,
  "status": "success"
}
```

### Refund Payment (Admin Only)
```
POST /transactions/1/refund
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 10000  // Optional, defaults to full amount
}

Response (200):
{
  "message": "Payment refunded successfully",
  "transaction_id": 1,
  "refund_amount": 10000,
  "note": "In production, M-Pesa API would process actual refund"
}
```

### Retry Failed Payment  
```
POST /tickets/42/retry-payment
Headers: Authorization: Bearer {token}

Response (200):
{
  "message": "Payment retry initiated",
  "transaction_id": 1,
  "status": "pending"
}
```

### Get Transaction Statistics (Admin Only)
```
GET /transactions/stats
Headers: Authorization: Bearer {token}

Response (200):
{
  "total_revenue": 250000,
  "total_transactions": 50,
  "status_breakdown": {
    "pending": 5,
    "success": 40,
    "failed": 4,
    "cancelled": 1
  },
  "success_rate": 80.0,
  "currency": "KES"
}
```

---

## 5. USER MANAGEMENT ENDPOINTS (Admin Only)

### Get All Users
```
GET /admin/users?role=user&page=1&per_page=10
Headers: Authorization: Bearer {token}

Response (200):
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "is_active": true,
      "created_at": "2025-01-01T09:00:00",
      "last_login": "2025-01-15T14:30:00"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 42,
    "pages": 5
  }
}
```

### Get User Profile
```
GET /admin/users/1
Headers: Authorization: Bearer {token}

Response (200):
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "is_active": true,
  "created_at": "2025-01-01T09:00:00",
  "last_login": "2025-01-15T14:30:00",
  "statistics": {
    "total_tickets": 12,
    "total_spent": 45000,
    "events_attended": 5
  },
  "recent_logins": [
    {
      "timestamp": "2025-01-15T14:30:00",
      "ip": "192.168.1.1",
      "status": "success"
    }
  ]
}
```

### Change User Role
```
PUT /admin/users/1/role
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "admin"
}

Response (200):
{
  "message": "User role updated",
  "user_id": 1,
  "new_role": "admin"
}
```

### Suspend/Activate User
```
PUT /admin/users/1/suspend
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "suspend": true
}

Response (200):
{
  "message": "Suspended user",
  "user_id": 1,
  "is_active": false
}
```

### Delete User (Soft Delete)
```
DELETE /admin/users/1
Headers: Authorization: Bearer {token}

Response (200):
{
  "message": "User deleted successfully",
  "user_id": 1
}
```

### Reset User Password
```
POST /admin/users/1/reset-password
Headers: Authorization: Bearer {token}

Response (200):
{
  "message": "Password reset successful",
  "user_id": 1,
  "temp_password": "abc123xyz789",
  "note": "In production, this would be sent via email"
}
```

---

## 6. AUDIT & LOGGING ENDPOINTS (Admin Only)

### Get Audit Logs
```
GET /admin/audit-logs?entity_type=User&page=1&per_page=20
Headers: Authorization: Bearer {token}

Response (200):
{
  "logs": [
    {
      "id": 1,
      "admin": {
        "id": 2,
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "action": "Changed user role from user to admin",
      "entity_type": "User",
      "entity_id": 1,
      "changes": {"from": "user", "to": "admin"},
      "created_at": "2025-01-15T15:00:00"
    }
  ],
  "pagination": {...}
}
```

### Get Login History
```
GET /admin/login-history?user_id=1&page=1&per_page=20
Headers: Authorization: Bearer {token}

Response (200):
{
  "logins": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "John Doe",
        "email":"john@example.com"
      },
      "ip_address": "192.168.1.1",
      "status": "success",
      "logged_in_at": "2025-01-15T14:30:00"
    }
  ],
  "pagination": {...}
}
```

---

## 7. ANALYTICS & REPORTING ENDPOINTS (Admin Only)

### Get Dashboard Analytics
```
GET /analytics/dashboard
Headers: Authorization: Bearer {token}

Response (200):
{
  "summary": {
    "total_revenue": 1500000,
    "total_users": 245,
    "total_events": 12,
    "total_tickets_sold": 3500,
    "active_users_30d": 180
  },
  "transactions": {
    "stats": {
      "pending": 5,
      "success": 350,
      "failed": 10,
      "cancelled": 2
    },
    "success_rate": 96.7
  },
  "top_events": [
    {
      "event_id": 1,
      "name": "Starlight Concert",
      "revenue": 250000,
      "tickets_sold": 125
    }
  ],
  "currency": "KES"
}
```

### Get Event Performance
```
GET /analytics/events/1/performance
Headers: Authorization: Bearer {token}

Response (200):
{
  "event": {
    "id": 1,
    "name": "Starlight Concert",
    "date": "2025-06-15",
    "venue": "Kenya National Theatre"
  },
  "sales": {
    "total_revenue": 250000,
    "total_tickets": 125,
    "by_tier": {
      "VIP": {
        "price": 5000,
        "quantity_sold": 25,
        "revenue": 125000,
        "percentage": 20.0
      }
    }
  },
  "payments": {
    "pending": 2,
    "paid": 123
  },
  "attendance": {
    "check_ins": 120,
    "no_shows": 5,
    "attendance_rate": 96.0
  },
  "currency": "KES"
}
```

### Get Revenue Trends
```
GET /analytics/revenue-trends?days=30
Headers: Authorization: Bearer {token}

Response (200):
{
  "period_days": 30,
  "start_date": "2024-12-18T10:30:00",
  "end_date": "2025-01-15T10:30:00",
  "daily_data": [
    {
      "date": "2025-01-15",
      "revenue": 150000,
      "transactions": 45
    }
  ],
  "currency": "KES"
}
```

### Get User Metrics
```
GET /analytics/user-metrics?days=30
Headers: Authorization: Bearer {token}

Response (200):
{
  "period_days": 30,
  "start_date": "2024-12-18T10:30:00",
  "end_date": "2025-01-15T10:30:00",
  "new_users": 25,
  "returning_users": 145,
  "role_breakdown": [
    {"role": "user", "count": 240},
    {"role": "admin", "count": 5}
  ],
  "top_customers": [
    {
      "user_id": 7,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "tickets_purchased": 15,
      "total_spent": 75000
    }
  ],
  "currency": "KES"
}
```

---

## ERROR RESPONSES

All endpoints return standardized error responses:

```
400 Bad Request
{
  "error": "Required field missing"
}

401 Unauthorized
{
  "error": "Invalid credentials"
}

403 Forbidden
{
  "error": "Admin access required"
}

404 Not Found
{
  "error": "Resource not found"
}

500 Internal Server Error
{
  "error": "Internal server error message"
}
```

---

## AUTHENTICATION REQUIREMENTS

Most endpoints require JWT token in Authorization header:

```
Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token claims include:
- `sub`: User ID (identity)
- `role`: User role (user or admin)
- `name`: User name
- `email`: User email

---

## RATE LIMITING & PAGINATION

Paginated endpoints support:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10-20)

Response includes:
```json
{
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

## PAYMENT & M-PESA INTEGRATION

Payment initiation endpoint:
```
POST /mpesa/stk-push
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "phone": "+254712345678",
  "amount": 10000,
  "account_ref": "ticket-42",
  "transaction_desc": "Purchase tickets"
}
```

*Note: M-Pesa integration is currently mocked. In production, this integrates with Safaricom's M-Pesa API.*
