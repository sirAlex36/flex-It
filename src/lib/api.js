// API utility functions for backend communication

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export async function apiCall(endpoint, options = {}, token = null) {
  // Try to get token from options.headers.Authorization first, then from parameter, then from localStorage
  let authToken = token;
  if (options.headers?.Authorization) {
    authToken = options.headers.Authorization.replace("Bearer ", "");
  }
  if (!authToken && typeof window !== "undefined") {
    authToken = localStorage.getItem("token");
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return await response.json();
}

// Events
export async function getEvents(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.search) params.append("search", filters.search);
  if (filters.venue) params.append("venue", filters.venue);
  if (filters.minPrice) params.append("minPrice", filters.minPrice);
  if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  
  const endpoint = `/events${params.toString() ? "?" + params.toString() : ""}`;
  return apiCall(endpoint);
}

export async function getEvent(id) {
  return apiCall(`/events/${id}`);
}

export async function createEvent(data) {
  return apiCall("/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEvent(id, data) {
  return apiCall(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id) {
  return apiCall(`/events/${id}`, {
    method: "DELETE",
  });
}

// Tickets
export async function getTickets() {
  return apiCall("/tickets");
}

export async function getTicket(id) {
  return apiCall(`/tickets/${id}`);
}

export async function getUserTickets() {
  return apiCall("/user/tickets");
}

export async function getEventAvailability(eventId) {
  return apiCall(`/events/${eventId}/availability`);
}

// Transactions & Payments
export async function getTransactions(ticketId) {
  return apiCall(`/transactions/${ticketId}`);
}

export async function initiatePayment(data) {
  return apiCall("/mpesa/stk-push", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Users
export async function getUsers() {
  return apiCall("/users");
}

export async function register(data) {
  return apiCall("/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(email, password) {
  return apiCall("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ============ ADMIN USER MANAGEMENT ============

export async function getAllUsers(page = 1, perPage = 10, roleFilter = null) {
  let url = `/admin/users?page=${page}&per_page=${perPage}`;
  if (roleFilter) url += `&role=${roleFilter}`;
  return apiCall(url);
}

export async function getUserProfile(userId) {
  return apiCall(`/admin/users/${userId}`);
}

export async function changeUserRole(userId, role) {
  return apiCall(`/admin/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}

export async function suspendUser(userId, suspend = true) {
  return apiCall(`/admin/users/${userId}/suspend`, {
    method: "PUT",
    body: JSON.stringify({ suspend }),
  });
}

export async function deleteUser(userId) {
  return apiCall(`/admin/users/${userId}`, {
    method: "DELETE",
  });
}

export async function resetUserPassword(userId) {
  return apiCall(`/admin/users/${userId}/reset-password`, {
    method: "POST",
  });
}

export async function getAuditLogs(page = 1, perPage = 20, entityType = null) {
  let url = `/admin/audit-logs?page=${page}&per_page=${perPage}`;
  if (entityType) url += `&entity_type=${entityType}`;
  return apiCall(url);
}

export async function getLoginHistory(page = 1, perPage = 20, userId = null) {
  let url = `/admin/login-history?page=${page}&per_page=${perPage}`;
  if (userId) url += `&user_id=${userId}`;
  return apiCall(url);
}

// ============ TRANSACTION MANAGEMENT ============

export async function getAllTransactions(page = 1, perPage = 20, status = null, method = null) {
  let url = `/transactions?page=${page}&per_page=${perPage}`;
  if (status) url += `&status=${status}`;
  if (method) url += `&payment_method=${method}`;
  return apiCall(url);
}

export async function getTransactionDetails(transactionId) {
  return apiCall(`/transactions/${transactionId}`);
}

export async function confirmPayment(transactionId, mpesaReceipt = null) {
  return apiCall(`/transactions/${transactionId}/confirm`, {
    method: "POST",
    body: JSON.stringify({ mpesa_receipt: mpesaReceipt }),
  });
}

export async function refundPayment(transactionId, amount = null) {
  return apiCall(`/transactions/${transactionId}/refund`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function retryFailedPayment(ticketId) {
  return apiCall(`/tickets/${ticketId}/retry-payment`, {
    method: "POST",
  });
}

export async function getTransactionStats() {
  return apiCall("/transactions/stats");
}

// ============ TICKET MANAGEMENT ============

export async function resendTicketEmail(ticketId) {
  return apiCall(`/tickets/${ticketId}/resend-email`, {
    method: "POST",
  });
}

export async function regenerateTicketQR(ticketId) {
  return apiCall(`/tickets/${ticketId}/regenerate-qr`, {
    method: "POST",
  });
}

export async function cancelTicket(ticketId) {
  return apiCall(`/tickets/${ticketId}/cancel`, {
    method: "POST",
  });
}

export async function checkInTicket(ticketId) {
  return apiCall(`/tickets/${ticketId}/check-in`, {
    method: "POST",
  });
}

export async function getAllTickets(page = 1, perPage = 20, eventId = null, userId = null, status = null) {
  let url = `/admin/tickets?page=${page}&per_page=${perPage}`;
  if (eventId) url += `&event_id=${eventId}`;
  if (userId) url += `&user_id=${userId}`;
  if (status) url += `&status=${status}`;
  return apiCall(url);
}

// ============ ANALYTICS ============

export async function getDashboardAnalytics() {
  return apiCall("/analytics/dashboard");
}

export async function getEventPerformance(eventId) {
  return apiCall(`/analytics/events/${eventId}/performance`);
}

export async function getRevenueTrends(days = 30) {
  return apiCall(`/analytics/revenue-trends?days=${days}`);
}

export async function getUserMetrics(days = 30) {
  return apiCall(`/analytics/user-metrics?days=${days}`);
}

// ============ ORGANISER MANAGEMENT ============

export async function createOrganizerEvent(data) {
  return apiCall("/organiser/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getOrganizerEvents(page = 1, perPage = 10) {
  return apiCall(`/organiser/events?page=${page}&per_page=${perPage}`);
}

export async function getOrganizerEvent(eventId) {
  return apiCall(`/organiser/events/${eventId}`);
}

export async function updateOrganizerEvent(eventId, data) {
  return apiCall(`/organiser/events/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteOrganizerEvent(eventId) {
  return apiCall(`/organiser/events/${eventId}`, {
    method: "DELETE",
  });
}

export async function getEventTickets(eventId, page = 1, perPage = 20, status = null) {
  let url = `/organiser/events/${eventId}/tickets?page=${page}&per_page=${perPage}`;
  if (status) url += `&status=${status}`;
  return apiCall(url);
}

export async function getOrganizerDashboardAnalytics() {
  return apiCall("/organiser/dashboard-analytics");
}

export async function getOrganizerEventPerformance(eventId) {
  return apiCall(`/organiser/event-performance/${eventId}`);
}

export async function getOrganizerProfile() {
  return apiCall("/organiser/profile");
}
