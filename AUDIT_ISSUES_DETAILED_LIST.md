# Flex-It Audit Issues - Detailed List

## CRITICAL SECURITY ISSUES 🔴

### 1. Hardcoded User ID in Booking
- **Location:** `src/app/booking/[id]/page.js:43`
- **Code:** `user_id: 1`
- **Problem:** All bookings attributed to user ID 1
- **Impact:** Ticket ownership completely broken
- **Risk Level:** 🔴 CRITICAL - Data integrity violation
- **Fix Complexity:** ⭐ Very Simple (1 line change)

```javascript
// BROKEN:
const payload = { user_id: 1, ... }

// FIXED:
// Backend gets user_id from JWT token
```

---

## MOCK DATA IN PRODUCTION 🔴

### 2. Mock Events Array
- **Location:** `src/app/dashboard/organizer/page.js:336-343`
- **Problem:** `mockEvents` array has 3 hardcoded fake events
- **Impact:** Users see wrong event data
- **Status:** ❌ Not connected to API
- **Risk Level:** 🔴 CRITICAL - Wrong data shown
- **Fix Complexity:** ⭐ Very Simple (delete array)

```javascript
// HARDCODED MOCK DATA:
const mockEvents = [
  { id: 1, name: "Tech Summit 2024", ... },
  { id: 2, name: "Music Festival", ... },
  { id: 3, name: "Workshop Series", ... },
];
```

---

## DUPLICATE CODE ARCHITECTURE 🔴

### 3. Two Organizer Dashboards
- **Location 1 (KEEP):** `src/app/dashboard/organiser/page.js` ✅ Correct
  - Uses real API
  - Working state management
  - British spelling
  
- **Location 2 (DELETE):** `src/app/dashboard/organizer/page.js` ❌ Broken
  - Mock data
  - Broken handlers
  - American spelling
  - Confuses routing

- **Impact:** 🔴 CRITICAL - Routing confusion, duplicate code
- **Fix Complexity:** ⭐ Very Simple (delete folder)

**Solution:** Delete entire `src/app/dashboard/organizer/` folder

---

## BROKEN ACTION HANDLERS 🔴

### 4. Mock Console Handlers in Organizer Dashboard
- **Location:** `src/app/dashboard/organizer/page.js:361-364`
- **Problem:** Edit/Analytics/Attendees/Delete only call `console.log()`
- **Impact:** No actual event management
- **Status:** ❌ All buttons non-functional

```javascript
onEdit={() => console.log("Edit:", event)}           // ❌ No-op
onAnalytics={() => console.log("Analytics:", event)} // ❌ No-op
onAttendees={() => console.log("Attendees:", event)} // ❌ No-op
onDelete={() => console.log("Delete:", event)}       // ❌ No-op
```

### 5. Mock Console Handlers in Admin Dashboard
- **Location:** `src/app/dashboard/admin/page.js:468-470`
- **Problem:** Edit/View/Delete buttons only console.log
- **Impact:** Admin cannot manage users/events
- **Status:** ❌ All buttons non-functional

```javascript
{ label: "View", onClick: (row) => console.log(row) },  // ❌ No-op
{ label: "Edit", onClick: (row) => console.log(row) },  // ❌ No-op
{ label: "Delete", onClick: (row) => console.log(row) } // ❌ No-op
```

---

## MISSING BACKEND FEATURES 🔴

### Email Features (3 NOT IMPLEMENTED)

#### 6. Resend Ticket Email
- **Location:** `backend/app/routes/ticket_routes.py:303`
- **Endpoint:** `POST /tickets/{id}/resend-email`
- **Status:** ❌ TODO
- **Impact:** Users cannot re-request confirmation emails
- **Severity:** 🟡 MEDIUM

#### 7. Regenerate QR Code
- **Location:** `backend/app/routes/ticket_routes.py:333`
- **Endpoint:** `POST /tickets/{id}/regenerate-qr`
- **Status:** ❌ TODO
- **Impact:** Users cannot get replacement QR codes
- **Severity:** 🟡 MEDIUM

#### 8. Reset User Password with Email
- **Location:** `backend/app/routes/admin_routes.py:224`
- **Endpoint:** `POST /admin/users/{id}/reset-password`
- **Status:** ❌ TODO (comment: "Send email to user with temp password")
- **Impact:** No secure password reset flow
- **Severity:** 🟡 MEDIUM

### M-Pesa Features (2 NOT IMPLEMENTED)

#### 9. Process Refunds
- **Location:** `backend/app/routes/transaction_routes.py:176`
- **Endpoint:** `POST /transactions/{id}/refund`
- **Status:** ❌ TODO (comment: "Integrate with M-Pesa API to actually send refund")
- **Impact:** Money not returned to users
- **Severity:** 🔴 HIGH - Financial impact

#### 10. Retry Failed Payments
- **Location:** `backend/app/routes/transaction_routes.py:219`
- **Endpoint:** `POST /tickets/{id}/retry-payment`
- **Status:** ❌ TODO (comment: "Call M-Pesa API to retry payment")
- **Impact:** Failed payments stuck, no recovery path
- **Severity:** 🔴 HIGH

### Other Missing Features (2)

#### 11. Ticket Cancellation with Refund
- **Location:** `backend/app/routes/ticket_routes.py:365`
- **Endpoint:** `POST /tickets/{id}/cancel`
- **Status:** ❌ TODO (comment: "Refund payment via M-Pesa if confirmed")
- **Impact:** Users cannot cancel tickets
- **Severity:** 🔴 HIGH

#### 12. Phone Field Bug
- **Location:** `backend/app/routes/transaction_routes.py:95`
- **Status:** ❌ BUG - storing email twice
- **Code:** `"phone": transaction.ticket.user.email  # TODO: Add phone field`
- **Impact:** No phone number in transactions
- **Severity:** 🟡 MEDIUM

---

## FRONTEND STATE MANAGEMENT ISSUES 🟠

### 13. No Favorites Persistence
- **Location:** `src/app/dashboard/user/page.js:238`
- **Problem:** Favorites stored in local state only
- **Impact:** Lost on page refresh
- **Status:** ⚠️ PARTIAL - UI works, backend not used
- **Severity:** 🟠 HIGH

```javascript
const [favorites, setFavorites] = useState([]); // ❌ Local state only
// No POST to backend to persist
```

### 14. Duplicate Event Fetching
- **Location:** `src/app/dashboard/user/page.js:251-290`
- **Problem:** Events fetched twice (in fetchDashboardData + fetchEvents)
- **Impact:** Slower page load, network overhead
- **Status:** ⚠️ INEFFICIENT
- **Severity:** 🟡 MEDIUM

```javascript
const fetchDashboardData = async () => {
  // Fetches tickets...
  const [ticketsRes] = await Promise.all([
    fetch(`${API_URL}/user/tickets`, { headers }),
  ]);
  
  await fetchEvents(); // ❌ Second fetch for same data
};
```

### 15. No Real-time Search
- **Location:** `src/app/dashboard/user/page.js:267-276`
- **Problem:** No debounce, onChange doesn't trigger search
- **Impact:** Search is delayed and unresponsive
- **Status:** ⚠️ INCOMPLETE
- **Severity:** 🟡 MEDIUM

### 16. No Pagination in Admin
- **Location:** `src/app/dashboard/admin/page.js:223-240`
- **Problem:** Fetches ALL events and ALL users without pagination
- **Impact:** Slow with large datasets
- **Status:** ⚠️ MISSING
- **Severity:** 🟠 HIGH (scales badly)

```javascript
// ❌ No pagination:
fetch(`${API_URL}/events`, { headers })
fetch(`${API_URL}/users`, { headers })

// ✅ Should be:
fetch(`${API_URL}/events?page=1&per_page=20`)
fetch(`${API_URL}/users?page=1&per_page=10`)
```

### 17. No Role Filtering in Admin
- **Location:** `src/app/dashboard/admin/page.js`
- **Problem:** Backend supports `?role=admin|user|organiser` but not used
- **Impact:** Cannot filter users by role
- **Status:** ⚠️ FEATURE NOT USED
- **Severity:** 🟡 MEDIUM

---

## UI/UX ISSUES 🟠

### 18. Missing Event Images
- **Location:** All dashboards
- **Affected Files:**
  - `src/app/dashboard/user/page.js:50` - EventCard gradient
  - `src/app/dashboard/admin/page.js` - No image
  - `src/app/dashboard/organiser/page.js` - Gradient placeholder
- **Problem:** All events show same gradient, no actual images
- **Impact:** Poor visual experience, hard to distinguish events
- **Status:** ❌ NO IMAGE UPLOAD
- **Severity:** 🟠 HIGH (critical for UX)

```javascript
<div className="bg-gradient-to-br from-blue-500 to-blue-600 h-48">
  <CalendarIcon /> {/* ❌ Always same gradient */}
</div>
```

### 19. No Image Upload in Forms
- **Location:** `src/app/dashboard/admin/page.js:596`
- **Problem:** Image field is text input, not file upload
- **Status:** ❌ MISSING FEATURE
- **Severity:** 🟠 HIGH

```javascript
<input
  type="text"                    // ❌ Should be "file"
  placeholder="Image URL"        // ❌ Should be "Upload image"
/>
```

### 20. Missing Event Image Directory
- **Location:** `public/images/` (does not exist)
- **Problem:** No place to store uploaded images
- **Status:** ❌ DIRECTORY MISSING
- **Severity:** 🟠 HIGH (blocks image feature)

---

## STRUCTURAL ISSUES 🟠

### 21. Naming Inconsistency - Organiser vs Organizer
- **Database Model:** `organiser_id` (British spelling)
- **Backend Routes:** `/organiser/events` (British)
- **Frontend Routes:** Both `/organiser/` AND `/organizer/` (mixed)
- **API Endpoints:** Use `/organiser/` (British)
- **Problem:** Spelling mismatch causes confusion
- **Impact:** 🟡 MEDIUM - routing confusion
- **Recommendation:** Standardize on "organiser" (British) throughout

---

## PERFORMANCE ISSUES 🟡

### 22. Mobile Menu Responsive Issues
- **Location:** `src/components/Header.jsx:94-104`
- **Status:** Implemented but not fully polished
- **Severity:** 🔵 LOW

### 23. Search Not Debounced
- **Location:** `src/app/dashboard/user/page.js`
- **Problem:** Each keystroke triggers API call
- **Impact:** Wasted network requests, poor performance
- **Status:** ❌ MISSING DEBOUNCE
- **Severity:** 🟡 MEDIUM

---

## SUMMARY TABLE

| Issue | Type | Severity | Location | Status |
|-------|------|----------|----------|--------|
| Hardcoded user_id | Security | 🔴 CRITICAL | booking/[id]/page.js:43 | ❌ BROKEN |
| Mock events array | Data | 🔴 CRITICAL | organizer/page.js:336 | ❌ HARDCODED |
| Duplicate dashboard | Architecture | 🔴 CRITICAL | organizer/ folder | ❌ DELETE |
| Console handlers | UI | 🔴 CRITICAL | organizer/page.js:361 | ❌ NO-OP |
| Console handlers | UI | 🟠 HIGH | admin/page.js:468 | ❌ NO-OP |
| Resend email | Backend | 🟡 MEDIUM | ticket_routes:303 | ❌ TODO |
| Regenerate QR | Backend | 🟡 MEDIUM | ticket_routes:333 | ❌ TODO |
| Password reset | Backend | 🟡 MEDIUM | admin_routes:224 | ❌ TODO |
| Process refunds | Backend | 🔴 HIGH | transaction_routes:176 | ❌ TODO |
| Retry payment | Backend | 🔴 HIGH | transaction_routes:219 | ❌ TODO |
| Cancel ticket | Backend | 🔴 HIGH | ticket_routes:365 | ❌ TODO |
| Phone field bug | Backend | 🟡 MEDIUM | transaction_routes:95 | ❌ BUG |
| Favorites persist | Frontend | 🟠 HIGH | user/page.js:238 | ⚠️ PARTIAL |
| Duplicate fetches | Frontend | 🟡 MEDIUM | user/page.js:251 | ❌ INEFFICIENT |
| Real-time search | Frontend | 🟡 MEDIUM | user/page.js:267 | ❌ MISSING |
| Pagination | Frontend | 🟠 HIGH | admin/page.js:223 | ❌ MISSING |
| Role filtering | Frontend | 🟡 MEDIUM | admin/page.js | ❌ NOT USED |
| Event images | UI | 🟠 HIGH | All dashboards | ❌ MISSING |
| Image upload | UI | 🟠 HIGH | admin/page.js:596 | ❌ NO FILE INPUT |
| Image directory | Structure | 🟠 HIGH | public/images/ | ❌ MISSING DIR |

---

## CRITICAL FIXES (Next 30 minutes)

```
1. src/app/booking/[id]/page.js (Line 43)
   - Remove: user_id: 1
   - Backend will extract from JWT

2. src/app/dashboard/organizer/page.js
   - DELETE ENTIRE FOLDER

3. src/app/dashboard/organiser/page.js (Line 336)
   - Remove mockEvents array
   - Use loadEvents() API call

TOTAL TIME: ~30 minutes
```

---

Generated by Comprehensive Audit | April 30, 2026
