# Flex-It Audit - Executive Summary

## Critical Issues (Fix Immediately)

### 🔴 1. Hardcoded User ID - SECURITY BREACH
- **File:** `src/app/booking/[id]/page.js` (Line 43)
- **Problem:** `user_id: 1` - All bookings assigned to same user
- **Impact:** User history broken, tickets misattributed
- **Fix:** Extract from JWT token instead of hardcoding
- **Time:** 15 minutes

### 🔴 2. Mock Events in Production
- **File:** `src/app/dashboard/organizer/page.js` (Lines 336-343)
- **Problem:** Hardcoded 3 fake events shown instead of real data
- **Impact:** Users see wrong events
- **Fix:** Remove mockEvents array, use API call
- **Time:** 10 minutes

### 🔴 3. Duplicate Dashboard Implementations
- **Files:** 
  - `src/app/dashboard/organiser/page.js` ✅ CORRECT (keep)
  - `src/app/dashboard/organizer/page.js` ❌ BROKEN (delete)
- **Problem:** Two implementations, one with mock data
- **Impact:** Routing confusion, duplicate code
- **Fix:** Delete `/organizer/` folder entirely
- **Time:** 5 minutes

### 🔴 4. Seven TODO Features Not Implemented
- **Email Features (3):**
  - Resend ticket email: `ticket_routes.py:303`
  - Generate QR code: `ticket_routes.py:333`
  - Reset password email: `admin_routes.py:224`

- **M-Pesa Features (2):**
  - Process refunds: `transaction_routes.py:176`
  - Retry payments: `transaction_routes.py:219`

- **Other (2):**
  - Add phone field: `transaction_routes.py:95`
  - Cancel ticket with refund: `ticket_routes.py:365`

| Feature | Location | Status | Impact |
|---------|----------|--------|--------|
| Resend Email | ticket_routes.py:303 | ❌ TODO | Users can't re-get emails |
| Regenerate QR | ticket_routes.py:333 | ❌ TODO | Users can't replace lost QRs |
| Refund Payment | transaction_routes.py:176 | ❌ TODO | Money not returned to users |
| Retry Payment | transaction_routes.py:219 | ❌ TODO | Failed payments stuck |
| Reset Password | admin_routes.py:224 | ❌ TODO | No secure password reset |

**Total Time to Fix:** ~4-6 hours (depends on M-Pesa integration complexity)

---

## High Priority Issues (Fix This Week)

### 🟠 5. Broken Admin Action Handlers
- **File:** `src/app/dashboard/admin/page.js` (Lines 468-470)
- **Problem:** Edit/Delete buttons only call `console.log()`
- **Impact:** Admin cannot manage users/events
- **Fix:** Implement actual modal dialogs and API calls
- **Time:** 2-3 hours

### 🟠 6. No Event Images
- **Affected:** All dashboards
- **Problem:** Only gradient placeholders, no image upload
- **Impact:** Poor UX, no event visualization
- **Fix:** Add file upload, store in `/public/events/`
- **Time:** 2-3 hours

### 🟠 7. No Favorites Persistence
- **File:** `src/app/dashboard/user/page.js`
- **Problem:** Favorites lost on page refresh
- **Impact:** User experience broken
- **Fix:** Add backend endpoint + save to database
- **Time:** 1-2 hours

### 🟠 8. Mock Console Handlers
- **File:** `src/app/dashboard/organizer/page.js` (Lines 361-364)
- **Problem:** Event edit/analytics buttons are no-ops
- **Impact:** Cannot manage events
- **Fix:** Implement actual handlers (after deleting this file, problem goes away)
- **Time:** Resolved by deleting file

---

## Medium Priority Issues (Fix This Month)

### 🟡 9. No Search Debounce
- **File:** `src/app/dashboard/user/page.js`
- **Problem:** Search hammers API on every keystroke
- **Impact:** Poor performance
- **Fix:** Add 500ms debounce
- **Time:** 30 minutes

### 🟡 10. No Pagination in Admin
- **File:** `src/app/dashboard/admin/page.js`
- **Problem:** Fetches ALL events/users at once
- **Impact:** Slow with large datasets
- **Fix:** Use `?page=1&per_page=20` parameters
- **Time:** 45 minutes

### 🟡 11. Wrong Phone Storage
- **File:** `transaction_routes.py:95`
- **Problem:** Phone field stores email instead of phone
- **Impact:** Transaction data has wrong info
- **Fix:** Add phone field to User model + migration
- **Time:** 1 hour

### 🟡 12. Duplicate Event Fetching
- **File:** `src/app/dashboard/user/page.js`
- **Problem:** Events fetched twice unnecessarily
- **Impact:** Slower page load
- **Fix:** Merge into single fetch
- **Time:** 30 minutes

---

## Low Priority Issues (Polish Later)

### 🔵 13. Naming Inconsistency
- **Issue:** Mixed "organiser" (British) and "organizer" (American) spelling
- **Fix:** Standardize on "organiser" throughout
- **Time:** 1-2 hours

### 🔵 14. Mobile Menu Not Styled
- **File:** `src/components/Header.jsx`
- **Impact:** Minor UX issue
- **Time:** 30 minutes

### 🔵 15. Rate Limiting Missing
- **Impact:** Security improvement
- **Time:** 1-2 hours

---

## Quick Action Items

### TODAY - 30 Minutes
```
1. Delete src/app/dashboard/organizer/        (5 min)
2. Fix hardcoded user_id in booking           (10 min)
3. Remove mockEvents from organiser           (10 min)
4. Test that both issues resolved             (5 min)
```

### THIS WEEK - 1-2 Days
```
1. Implement email features (3 endpoints)     (3-4 hours)
2. Add image upload functionality             (2-3 hours)
3. Fix admin action handlers                  (2-3 hours)
4. Add favorites persistence                  (1-2 hours)
```

### NEXT WEEK - 1-2 Days
```
1. Implement M-Pesa refund/retry              (2-4 hours)
2. Add pagination to admin dashboard          (1 hour)
3. Add search debounce                        (30 min)
4. Fix phone field issue                      (1 hour)
```

---

## Files Affected Summary

### Frontend Files Needing Fixes
| File | Issue | Fix Time |
|------|-------|----------|
| `src/app/booking/[id]/page.js` | Hardcoded user_id | 15 min |
| `src/app/dashboard/organizer/page.js` | DELETE ENTIRE FILE | 5 min |
| `src/app/dashboard/organiser/page.js` | Remove mockEvents | 10 min |
| `src/app/dashboard/admin/page.js` | Broken handlers + pagination | 3 hours |
| `src/app/dashboard/user/page.js` | Favorites, search, fetch | 2 hours |

### Backend Files Needing Fixes
| File | Issues | Fix Time |
|------|--------|----------|
| `ticket_routes.py` | 3 TODOs (email, QR, cancel) | 2-3 hours |
| `transaction_routes.py` | 3 TODOs (refund, retry, phone) | 2-3 hours |
| `admin_routes.py` | Password reset email | 1 hour |
| `models.py` | Add image field to Event | 30 min |

### Total Estimated Effort
- **Critical Fixes:** 8-10 hours
- **High Priority:** 8-10 hours
- **Medium Priority:** 4-5 hours
- **Low Priority:** 3-4 hours
- **Total:** 23-29 hours (~3-4 days for one developer)

---

## Verification Checklist

After fixes, verify:

```
CRITICAL FIXES:
☐ Bookings go to correct user (not hardcoded 1)
☐ organizer/page.js deleted, no broken links
☐ organiser/page.js shows real events (not mockEvents)
☐ Mock console handlers in organiser/page.js gone (if not deleted)

FUNCTIONALITY FIXES:
☐ Admin can edit/delete users and events
☐ Users can resend emails
☐ Users can regenerate QR codes
☐ Refunds process through M-Pesa
☐ Failed payments can be retried
☐ Password reset sends email

UX FIXES:
☐ Event images display correctly
☐ Favorites persist on page refresh
☐ Search doesn't lag
☐ Admin dashboard loads with pagination
☐ Mobile menu works properly

PERFORMANCE:
☐ No duplicate API calls
☐ Search is debounced
☐ Admin dashboard loads fast with pagination
☐ No console warnings or errors
```

---

## Test User Scenarios

### Scenario 1: User Booking Flow
1. User A logs in
2. User A books tickets → should be assigned to User A, NOT user 1
3. Refresh page → tickets still show for User A
4. Verify in admin dashboard → bookings attributed to User A

### Scenario 2: Event Management
1. Organizer logs in to `/organiser/` dashboard ✅
2. Check `/organizer/` dashboard → 404 or redirect ✅
3. Organizer creates event → shows in real events list, not mockEvents
4. Edit event → modal opens and updates
5. Delete event → removed from list

### Scenario 3: Admin Panel
1. Admin opens dashboard
2. Click edit on user → modal opens
3. Click edit on event → modal opens
4. Click delete → confirmation, then deletion

### Scenario 4: Email Features
1. User receives ticket confirmation email ✅
2. User clicks "Resend Email" → new email sent ✅
3. User can regenerate QR code → new QR sent via email ✅
4. Admin resets user password → user receives email with temp password ✅

### Scenario 5: Payment Management
1. User payment fails initially
2. User clicks "Retry Payment" → new M-Pesa prompt
3. Admin refunds transaction → money goes back to user's M-Pesa

---

Generated: April 30, 2026 | Project: flex-It
