// API utility functions for backend communication

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export async function apiCall(endpoint, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
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
export async function getEvents() {
  return apiCall("/events");
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
