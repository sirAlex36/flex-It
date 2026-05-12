# Flex-It Project - Comprehensive Codebase Audit Report
**Date:** April 30, 2026  
**Project:** flex-It Event Booking Platform  
**Status:** Multiple critical issues identified requiring attention

---

## Executive Summary

The flex-It codebase has significant issues including:
- **Duplicate organizer dashboard implementations** with conflicting data handling
- **Mock data hardcoded** in production code
- **7 incomplete backend features** (TODOs blocking functionality)
- **Security vulnerability** with hardcoded user IDs
- **Missing image handling** across all dashboards
- **API connectivity mismatches** between frontend and backend

**Priority Actions Required:**
1. Delete deprecated organizer dashboard (organizer/page.js)
2. Remove mock data from organiser/page.js
3. Implement missing TODO features (email, QR, M-Pesa refunds)
4. Fix user ID handling in booking flow
5. Add image upload functionality

---

## 1. MOCK DATA & HARDCODED VALUES

### 1.1 Frontend Mock Events
**File:** [src/app/dashboard/organizer/page.js](src/app/dashboard/organizer/page.js#L336-L343)  
**Severity:** 🔴 HIGH - Production code with fake data

```javascript
// Lines 336-343
const mockEvents = [
  { id: 1, name: "Tech Summit 2024", date: "2024-04-25", venue: "Convention Center", status: "live" },
  { id: 2, name: "Music Festival", date: "2024-05-10", venue: "Central Park", status: "live" },
  { id: 3, name: "Workshop Series", date: "2024-05-15", venue: "Tech Hub", status: "draft" },
];
```
**Impact:** This data displays in EventsTab instead of fetching from API. Users see same 3 events regardless of their actual events.

**Fix:** Replace with API call:
```javascript
useEffect(() => {
  loadEvents();
}, [activeTab]);
```

---

### 1.2 Mock Console Log Handlers
**File:** [src/app/dashboard/organizer/page.js](src/app/dashboard/organizer/page.js#L361-L364)  
**Severity:** 🔴 HIGH - Broken functionality

```javascript
<PremiumEventCard
  key={event.id}
  event={event}
  onEdit={() => console.log("Edit:", event)}           // ❌ No-op
  onAnalytics={() => console.log("Analytics:", event)} // ❌ No-op
  onAttendees={() => console.log("Attendees:", event)} // ❌ No-op
  onDelete={() => console.log("Delete:", event)}       // ❌ No-op
/>
```
**Impact:** All event management buttons are non-functional in this dashboard view.

---

### 1.3 Admin Dashboard Mock Handlers
**File:** [src/app/dashboard/admin/page.js](src/app/dashboard/admin/page.js#L468-L470)  
**Severity:** 🟡 MEDIUM - Incomplete implementation

```javascript
actions={[
  { label: "View", icon: EyeIcon, onClick: (row) => console.log(row) },      // ❌ No-op
  { label: "Edit", icon: PencilIcon, onClick: (row) => console.log(row) },   // ❌ No-op
  { label: "Delete", icon: TrashIcon, onClick: (row) => console.log(row) },  // ❌ No-op
]}
```
**Impact:** Admin cannot edit/delete users or events from dashboard.

---

### 1.4 Hardcoded User ID in Booking
**File:** [src/app/booking/[id]/page.js](src/app/booking/[id]/page.js#L43)  
**Severity:** 🔴 CRITICAL - Security vulnerability

```javascript
const payload = {
  event_id: bookingData.eventId,
  ticket_type: bookingData.ticketType,
  quantity: bookingData.quantity,
  price: bookingData.totalAmount,
  user_id: 1,  // ❌ HARDCODED - All bookings attributed to user 1!
};
```
**Impact:** Any user booking tickets gets them attributed to user ID 1, breaking ticket ownership and user history.

**Fix:** Use JWT identity from session:
```javascript
// Get from NextAuth session
const user_id = session?.user?.id;
```

---

## 2. CRITICAL NAMING INCONSISTENCY

### 2.1 Dual Dashboard Paths
**Severity:** 🔴 HIGH - Architectural confusion

The project has TWO separate organizer dashboard implementations:

**Path 1 - CORRECT (Uses API):** [src/app/dashboard/organiser/page.js](src/app/dashboard/organiser/page.js)
- ✅ Proper API integration
- ✅ Real data loading
- ✅ Working event management
- ✅ British spelling: "organiser"

**Path 2 - DEPRECATED (Uses Mock):** [src/app/dashboard/organizer/page.js](src/app/dashboard/organizer/page.js)
- ❌ Mock data hardcoded
- ❌ Broken action handlers
- ❌ American spelling: "organizer"
- ❌ Should be deleted entirely

**Database Model:** [backend/app/models.py](backend/app/models.py#L29)
```python
organiser_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # British spelling
```

**Recommendation:**
1. Keep: `/organiser/page.js` (British spelling)
2. Delete: `/organizer/page.js` (deprecated duplicate)
3. Keep database field as `organiser_id`
4. Ensure all URLs use `/organiser/` path

---

## 3. MISSING & INCOMPLETE BACKEND ENDPOINTS

### 3.1 Incomplete Ticket Features
**File:** [backend/app/routes/ticket_routes.py](backend/app/routes/ticket_routes.py)

#### Issue 3.1.1 - Email Resend Not Implemented
**Line:** 303  
**Severity:** 🟡 MEDIUM

```python
@main.route('/tickets/<int:ticket_id>/resend-email', methods=['POST'])
def resend_ticket_email(ticket_id):
    # ... validation code ...
    # TODO: Send email again  # ❌ NOT IMPLEMENTED
    return jsonify({"message": "Email resent"}), 200
```
**Impact:** Users cannot re-request confirmation emails for their tickets.

#### Issue 3.1.2 - QR Code Regeneration Not Implemented
**Line:** 333  
**Severity:** 🟡 MEDIUM

```python
@main.route('/tickets/<int:ticket_id>/regenerate-qr', methods=['POST'])
def regenerate_qr_code(ticket_id):
    # ... validation code ...
    # TODO: Generate new QR code  # ❌ NOT IMPLEMENTED
    return jsonify({"message": "QR code regenerated"}), 200
```
**Impact:** Users with lost QR codes cannot get new ones.

#### Issue 3.1.3 - Ticket Cancellation Not Implemented
**Line:** 365  
**Severity:** 🔴 HIGH

```python
@main.route('/tickets/<int:ticket_id>/cancel', methods=['POST'])
def cancel_ticket(ticket_id):
    # ... validation code ...
    # TODO: Refund payment via M-Pesa if confirmed  # ❌ NOT IMPLEMENTED
    return jsonify({"message": "Ticket cancelled"}), 200
```
**Impact:** Users cannot cancel tickets or receive refunds.

---

### 3.2 Incomplete Transaction Features
**File:** [backend/app/routes/transaction_routes.py](backend/app/routes/transaction_routes.py)

#### Issue 3.2.1 - User Phone Field Missing
**Line:** 95  
**Severity:** 🟡 MEDIUM

```python
"user": {
    "id": transaction.ticket.user.id,
    "name": transaction.ticket.user.name,
    "email": transaction.ticket.user.email,
    "phone": transaction.ticket.user.email  # TODO: Add phone field  # ❌ WRONG - email stored twice!
}
```
**Impact:** Phone numbers not captured in transaction data.

#### Issue 3.2.2 - M-Pesa Refund Not Implemented
**Line:** 176  
**Severity:** 🔴 HIGH

```python
@main.route('/transactions/<int:transaction_id>/refund', methods=['POST'])
def refund_payment(transaction_id):
    # ... code ...
    # TODO: Integrate with M-Pesa API to actually send refund  # ❌ NOT IMPLEMENTED
    transaction.status = "cancelled"
    db.session.commit()
    return jsonify({"message": "Payment refunded successfully"}), 200
```
**Impact:** System marks payments as refunded but doesn't send money back to customers.

#### Issue 3.2.3 - Payment Retry Not Implemented
**Line:** 219  
**Severity:** 🟡 MEDIUM

```python
@main.route('/tickets/<int:ticket_id>/retry-payment', methods=['POST'])
def retry_payment(ticket_id):
    # ... code ...
    # TODO: Call M-Pesa API to retry payment  # ❌ NOT IMPLEMENTED
    return jsonify({"message": "Payment retry initiated"}), 200
```
**Impact:** Users cannot retry failed payments.

---

### 3.3 Incomplete Admin Features
**File:** [backend/app/routes/admin_routes.py](backend/app/routes/admin_routes.py#L224)

#### Issue 3.3.1 - Password Reset Email Not Implemented
**Severity:** 🟡 MEDIUM

```python
@main.route('/admin/users/<int:user_id>/reset-password', methods=['POST'])
def reset_user_password(user_id):
    admin_id = get_jwt_identity()
    user = User.query.get(user_id)
    # ... code ...
    # TODO: Send email to user with temp password  # ❌ NOT IMPLEMENTED
    return jsonify({"message": "Password reset initiated"}), 200
```
**Impact:** Admins cannot securely reset user passwords.

---

## 4. API CONNECTIVITY ANALYSIS

### 4.1 Working API Endpoints ✅

| Frontend Function | Backend Endpoint | Status |
|---|---|---|
| `getEvents()` | `GET /events` | ✅ Working |
| `getEvent(id)` | `GET /events/{id}` | ✅ Working |
| `getTickets()` | `GET /tickets` | ✅ Working |
| `getUserTickets()` | `GET /user/tickets` | ✅ Working |
| `getDashboardAnalytics()` | `GET /analytics/dashboard` | ✅ Working |
| `getOrganizerEvents()` | `GET /organiser/events` | ✅ Working |
| `getOrganizerDashboardAnalytics()` | `GET /organiser/dashboard-analytics` | ✅ Working |
| `createOrganizerEvent()` | `POST /organiser/events` | ✅ Working |
| `getEventAvailability()` | `GET /events/{id}/availability` | ✅ Working |

### 4.2 Broken/Incomplete Endpoints ❌

| Frontend Function | Backend Endpoint | Issue |
|---|---|---|
| `resendTicketEmail()` | `POST /tickets/{id}/resend-email` | Email not sent (TODO) |
| `regenerateTicketQR()` | `POST /tickets/{id}/regenerate-qr` | QR not generated (TODO) |
| `cancelTicket()` | `POST /tickets/{id}/cancel` | Refund not processed (TODO) |
| `refundPayment()` | `POST /transactions/{id}/refund` | M-Pesa not called (TODO) |
| `retryFailedPayment()` | `POST /tickets/{id}/retry-payment` | Payment not retried (TODO) |
| `resetUserPassword()` | `POST /admin/users/{id}/reset-password` | Email not sent (TODO) |

---

## 5. FRONTEND STATE MANAGEMENT ISSUES

### 5.1 Admin Dashboard Issues
**File:** [src/app/dashboard/admin/page.js](src/app/dashboard/admin/page.js#L223-L240)

**Issue 5.1.1** - No Pagination
```javascript
const fetchDashboardData = async () => {
  // Fetches ALL events and ALL users without pagination
  const [eventsRes, usersRes] = await Promise.all([
    fetch(`${API_URL}/events`, { headers }),      // ❌ No ?page=1&per_page=10
    fetch(`${API_URL}/users`, { headers }),       // ❌ No pagination
  ]);
```
**Impact:** With thousands of events/users, page will be slow/unresponsive.

**Issue 5.1.2** - No Role Filtering
```javascript
// Backend supports: ?role=admin|user|organiser
// Frontend doesn't use it
const [usersRes] = await Promise.all([
  fetch(`${API_URL}/users`, { headers }),  // ❌ Ignores role param in API
]);
```
**Impact:** Cannot filter users by role in UI despite backend support.

**Issue 5.1.3** - Mock Action Handlers
- Edit/View/Delete buttons only call `console.log(row)`
- No modal dialogs or actual operations

---

### 5.2 User Dashboard Issues
**File:** [src/app/dashboard/user/page.js](src/app/dashboard/user/page.js#L251-L290)

**Issue 5.2.1** - Duplicate Event Fetching
```javascript
const fetchDashboardData = async () => {
  // Fetches tickets...
  const [ticketsRes] = await Promise.all([
    fetch(`${API_URL}/user/tickets`, { headers }),
  ]);
  
  // THEN fetches events separately
  await fetchEvents();  // ❌ Redundant second fetch
};
```
**Impact:** Network overhead, slower page load.

**Issue 5.2.2** - No Favorites Persistence
```javascript
const [favorites, setFavorites] = useState([]);  // ❌ Local state only
// No POST to backend to save favorites
// Lost when page refreshes
```
**Impact:** User's favorite events list lost on page refresh.

**Issue 5.2.3** - Search Not Real-Time
```javascript
const handleSearch = (e) => {
  setSearchTerm(e.target.value);
  // No debounce, no instant search
  // fetchEvents only called on button click, not onChange
};
```
**Impact:** Search is slow and not responsive.

---

### 5.3 Organizer Dashboard Issues

**File - CORRECT:** [src/app/dashboard/organiser/page.js](src/app/dashboard/organiser/page.js)
- ✅ Proper event loading
- ✅ Correct API integration
- ✅ Working state management

**File - DEPRECATED:** [src/app/dashboard/organizer/page.js](src/app/dashboard/organizer/page.js)
- ❌ Mock events hardcoded
- ❌ Broken handlers
- ❌ Should be removed

---

## 6. UI/UX PROBLEMS

### 6.1 Missing Event Images
**Severity:** 🟡 MEDIUM - Critical for UX

**Affected Files:**
- [src/app/dashboard/user/page.js](src/app/dashboard/user/page.js#L50) - EventCard component
- [src/app/dashboard/admin/page.js](src/app/dashboard/admin/page.js) - No image display
- [src/app/dashboard/organiser/page.js](src/app/dashboard/organiser/page.js) - Gradient placeholder

**Current Implementation:**
```javascript
<div className="bg-gradient-to-br from-blue-500 to-blue-600 h-48 flex items-center justify-center">
  <CalendarIcon className="w-16 h-16 text-white opacity-50" />
</div>
```

**Problems:**
- All events show same gradient
- No actual image upload in create event
- User dashboard has fallback: `event.image || "https://via.placeholder.com/400x250"`

**Fix Needed:**
1. Add image field to Event model migration
2. Add image upload to event creation forms
3. Create `/public/images` directory
4. Implement image display in all dashboards

---

### 6.2 Form Issues

**Issue 6.2.1** - No Image Upload
**File:** [src/app/dashboard/admin/page.js](src/app/dashboard/admin/page.js#L596)
```javascript
<input
  type="text"
  placeholder="Image URL"  // ❌ Text input only, no file upload
  className="..."
/>
```

**Issue 6.2.2** - No File Preview
- Booking form doesn't preview event details
- No QR code preview before confirmation

---

### 6.3 Responsive Design Issues

**Issue 6.3.1** - Mobile Menu
**File:** [src/components/Header.jsx](src/components/Header.jsx#L94-L104)
- Mobile menu implemented but not fully styled
- Search overlay needs better styling

---

## 7. DASHBOARD-SPECIFIC ANALYSIS

### 7.1 Admin Dashboard (/dashboard/admin)
**File:** [src/app/dashboard/admin/page.js](src/app/dashboard/admin/page.js)

**Status Summary:**
| Feature | Status | Notes |
|---------|--------|-------|
| Overview Tab | ✅ Loads | Shows stats, but hardcoded values |
| Events Tab | ⚠️ Partial | Displays events but no search/filter |
| Users Tab | ⚠️ Partial | Shows all users, no role filter |
| Create Event | ✅ Works | API call implemented |
| Edit/Delete | ❌ Broken | Console.log only |

**Critical Issues:**
1. Event creation tied to admin, but backend allows organizers too
2. No role-based filtering despite UI labels
3. Stats show placeholder data, not calculated from API

---

### 7.2 User Dashboard (/dashboard/user)
**File:** [src/app/dashboard/user/page.js](src/app/dashboard/user/page.js)

**Status Summary:**
| Feature | Status | Notes |
|---------|--------|-------|
| Events Tab | ✅ Works | Real events displayed |
| My Tickets Tab | ✅ Works | User's tickets shown |
| Favorites | ⚠️ Partial | UI works, not persisted |
| Search | ⚠️ Partial | Works but no real-time |
| Booking Flow | ✅ Works | Stores in sessionStorage |

**Critical Issues:**
1. Favorites lost on refresh
2. No proper search debounce
3. Booking modals use hardcoded ticket types

---

### 7.3 Organizer Dashboard (/organiser)
**File:** [src/app/dashboard/organiser/page.js](src/app/dashboard/organiser/page.js)

**Status Summary:**
| Feature | Status | Notes |
|---------|--------|-------|
| Overview | ✅ Works | Real analytics loaded |
| Events List | ✅ Works | Proper API pagination |
| Create Event | ✅ Works | Full form, API call |
| Edit/Delete | ✅ Works | Functional |
| Attendees Tab | ⚠️ Incomplete | UI ready, missing data |
| Analytics | ✅ Works | Event performance loaded |

**Issues:**
1. Attendees tab not fully connected to backend
2. No event statistics display
3. Settings tab incomplete

---

### 7.4 Organizer Dashboard (/organizer - DEPRECATED)
**File:** [src/app/dashboard/organizer/page.js](src/app/dashboard/organizer/page.js)

**❌ SHOULD BE DELETED**
- Uses mockEvents
- All handlers are console.log stubs
- Duplicates functionality from /organiser
- Causes routing confusion

---

## 8. SECURITY VULNERABILITIES

### 8.1 🔴 CRITICAL - Hardcoded User ID
**File:** [src/app/booking/[id]/page.js](src/app/booking/[id]/page.js#L43)

```javascript
const payload = {
  // ... ticket details ...
  user_id: 1,  // ❌ HARDCODED - Broken user attribution!
};
```

**Attack Scenario:**
1. User A books tickets → tickets attributed to user ID 1
2. User B books tickets → also attributed to user ID 1
3. User 1 sees all bookings made by everyone
4. User history completely broken

**Fix Required:**
```javascript
// Get from NextAuth session
const response = await fetch(`${API_URL}/tickets`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    event_id: bookingData.eventId,
    ticket_type: bookingData.ticketType,
    quantity: bookingData.quantity,
    // ✅ User ID comes from JWT, not frontend
  }),
});
// Backend extracts user_id from JWT token
```

---

### 8.2 🟡 MEDIUM - Missing Email Verification
- Password reset doesn't verify email
- User can receive temp password but no secure flow

### 8.3 🟡 MEDIUM - No Rate Limiting Visible
- Login endpoint not rate-limited
- Susceptible to brute force

---

## 9. RECOMMENDATIONS & FIXES

### Priority 1 - CRITICAL (Do First)

#### Fix 1.1: Remove Hardcoded User ID
**File:** [src/app/booking/[id]/page.js](src/app/booking/[id]/page.js#L43)
```javascript
// BEFORE (BROKEN):
const payload = {
  event_id: bookingData.eventId,
  user_id: 1,  // ❌
};

// AFTER (FIXED):
// Let backend extract from JWT token
const payload = {
  event_id: bookingData.eventId,
  ticket_type: bookingData.ticketType,
  quantity: bookingData.quantity,
};

// Backend automatically gets user from JWT:
# backend/app/routes/ticket_routes.py
user_id = get_jwt_identity()  # ✅ From JWT, not frontend
```

#### Fix 1.2: Delete Deprecated Dashboard
**Action:** Delete entire folder: `src/app/dashboard/organizer/`

**Why:** Duplicate with mock data and broken handlers. Keep only `/organiser/`

#### Fix 1.3: Remove Mock Data
**File:** [src/app/dashboard/organizer/page.js](src/app/dashboard/organizer/page.js#L336)

Remove hardcoded mockEvents array and use actual API calls from `organiser/page.js`

---

### Priority 2 - HIGH (Do Second)

#### Fix 2.1: Implement Email Functions
**Files:**
- [backend/app/routes/ticket_routes.py#L303](backend/app/routes/ticket_routes.py#L303) - Resend email
- [backend/app/routes/ticket_routes.py#L333](backend/app/routes/ticket_routes.py#L333) - QR regeneration
- [backend/app/routes/admin_routes.py#L224](backend/app/routes/admin_routes.py#L224) - Password reset email

Use existing `send_confirmation_email()` function in [backend/app/routes/mpesa_routes.py](backend/app/routes/mpesa_routes.py#L64)

#### Fix 2.2: Implement M-Pesa Features
**Files:**
- [backend/app/routes/transaction_routes.py#L176](backend/app/routes/transaction_routes.py#L176) - Actual refund via API
- [backend/app/routes/transaction_routes.py#L219](backend/app/routes/transaction_routes.py#L219) - Retry payment

Connect to M-Pesa API callbacks already in place

#### Fix 2.3: Add Image Upload
**Steps:**
1. Update Event model to store image path
2. Create migration
3. Add file upload to event forms
4. Store in `/public/events/` directory
5. Display in all dashboards

---

### Priority 3 - MEDIUM (Do Third)

#### Fix 3.1: Add Admin Functionality
**File:** [src/app/dashboard/admin/page.js](src/app/dashboard/admin/page.js#L468)

Replace console.log handlers with actual modals:
```javascript
actions={[
  { 
    label: "Edit", 
    icon: PencilIcon, 
    onClick: (row) => openEditModal(row)  // ✅ Real handler
  },
]}
```

#### Fix 3.2: Add Favorites Persistence
**File:** [src/app/dashboard/user/page.js](src/app/dashboard/user/page.js#L238)

Add backend endpoint to save favorites:
```javascript
POST /user/favorites
DELETE /user/favorites/{eventId}
GET /user/favorites
```

#### Fix 3.3: Add Search Debounce
```javascript
import { useMemo } from 'react';

const debouncedSearch = useMemo(
  () => debounce((value) => {
    setSearchTerm(value);
    fetchEvents();
  }, 500),
  []
);
```

#### Fix 3.4: Fix Phone Field Bug
**File:** [backend/app/routes/transaction_routes.py#L95](backend/app/routes/transaction_routes.py#L95)

```javascript
// BEFORE (BROKEN):
"phone": transaction.ticket.user.email  # Same as email!

// AFTER (FIXED):
"phone": transaction.ticket.user.phone  # If field exists
# Or create migration to add phone field to User model
```

---

### Priority 4 - LOW (Polish)

#### Fix 4.1: Rename for Consistency
- Standardize on "organiser" (British spelling) throughout
- Update any remaining "organizer" references

#### Fix 4.2: Add Pagination
**File:** [src/app/dashboard/admin/page.js](src/app/dashboard/admin/page.js#L227)
```javascript
fetch(`${API_URL}/events?page=1&per_page=20`)
fetch(`${API_URL}/users?page=1&per_page=10`)
```

#### Fix 4.3: Add Real-Time Search
Implement search debounce and instant results

---

## 10. FILE LOCATION REFERENCE

### Key Files for Fixes:

**Frontend:**
- [src/app/booking/[id]/page.js](src/app/booking/[id]/page.js) - User ID bug
- [src/app/dashboard/admin/page.js](src/app/dashboard/admin/page.js) - Admin handlers
- [src/app/dashboard/user/page.js](src/app/dashboard/user/page.js) - Favorites, search
- [src/app/dashboard/organiser/page.js](src/app/dashboard/organiser/page.js) - Keep this
- [src/app/dashboard/organizer/page.js](src/app/dashboard/organizer/page.js) - **DELETE THIS**
- [src/lib/api.js](src/lib/api.js) - API functions (add favorites endpoints)

**Backend:**
- [backend/app/routes/ticket_routes.py](backend/app/routes/ticket_routes.py) - TODO: Email, QR
- [backend/app/routes/transaction_routes.py](backend/app/routes/transaction_routes.py) - TODO: Refund, retry
- [backend/app/routes/admin_routes.py](backend/app/routes/admin_routes.py) - TODO: Password reset email
- [backend/app/routes/mpesa_routes.py](backend/app/routes/mpesa_routes.py) - Email template reference
- [backend/app/models.py](backend/app/models.py) - Add image field to Event

**Components:**
- [src/components/Header.jsx](src/components/Header.jsx) - Mobile menu polish
- [src/components/Footer.jsx](src/components/Footer.jsx) - Already good

---

## 11. TESTING CHECKLIST

After implementing fixes, test:

- [ ] User booking flow - verify tickets assigned to correct user
- [ ] Delete organizer dashboard - no broken links
- [ ] Admin panel - edit/delete buttons work
- [ ] Organizer dashboard - events display from API
- [ ] User favorites - persist after page refresh
- [ ] Email sending - resend, password reset
- [ ] M-Pesa - refund and retry work
- [ ] Images - upload and display in all dashboards
- [ ] Mobile - responsive on small screens

---

## CONCLUSION

The codebase has solid architecture but needs:
1. **7 incomplete backend features** implemented
2. **Mock data removed** from production code
3. **Broken action handlers** fixed
4. **Security issue** (hardcoded user ID) resolved
5. **Duplicate code** consolidated

**Estimated effort:** 3-4 days for experienced developer

**Critical blocking issues:** 3 (hardcoded user ID, mock data, TODO features)

