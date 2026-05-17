"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  CalendarIcon,
  TicketIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  BellIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

const EventCard = ({ event, onBook, isFavorite, onToggleFavorite }) => {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 h-48 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative text-center text-white px-6">
          <p className="text-xs uppercase tracking-[0.25em] text-blue-200 mb-3">Featured</p>
          <h3 className="text-2xl font-bold">{event.name}</h3>
          <p className="text-sm text-blue-100 mt-2">{event.venue}</p>
        </div>

        <button
          onClick={() => onToggleFavorite(event.id)}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition"
        >
          {isFavorite ? (
            <HeartSolid className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-blue-600" />
          )}
        </button>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-4">
          <div className="inline-flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            {eventDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="inline-flex items-center gap-2">
            <MapPinIcon className="w-4 h-4" />
            {event.venue}
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-6 line-clamp-3">{event.description}</p>
        <button
          onClick={() => onBook(event)}
          disabled={!isUpcoming}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
            isUpcoming
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isUpcoming ? "Book Now" : "Event Passed"}
        </button>
      </div>
    </div>
  );
};

const BookingModal = ({ isOpen, event, onClose, onSubmit, loading, currentUser }) => {
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState("General");
  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState("");
  const [terms, setTerms] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setQuantity(1);
    setTicketType(event?.ticket_prices?.[0]?.ticket_type || "General");
    setFullName(currentUser?.name || "");
    setEmail(currentUser?.email || "");
    setPhone("");
    setTerms(false);
  }, [isOpen, event, currentUser]);

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Book Tickets</h3>
            <p className="text-sm text-gray-500">Secure your spot for {event.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
            <p className="text-sm text-gray-500 mb-2">Event</p>
            <p className="font-semibold text-gray-900">{event.name}</p>
            <p className="text-sm text-gray-500">{event.venue}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Type</label>
            <select
              value={ticketType}
              onChange={(e) => setTicketType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {event.ticket_prices.map((tier) => (
                <option key={tier.id} value={tier.ticket_type}>
                  {tier.ticket_type} — Ksh {tier.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                −
              </button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {!currentUser && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 700 000 000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              I agree to the <span className="text-blue-600">terms and conditions</span>
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(ticketType, quantity, { fullName, email, phone, terms })}
              disabled={loading}
              className="py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TicketCard = ({ ticket, onViewQR }) => {
  const eventDate = new Date(ticket.event?.date || Date.now());
  const isPast = eventDate < new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{ticket.event?.name || "Event"}</h3>
          <p className="text-sm text-gray-600 mt-1">{ticket.ticket_type}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isPast ? "bg-gray-100 text-gray-600" : ticket.mpesa_status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
        }`}>
          {isPast ? "Past" : ticket.mpesa_status === "confirmed" ? "Confirmed" : "Pending"}
        </span>
      </div>

      <div className="space-y-3 text-sm text-gray-600 mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          {eventDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <div className="flex items-center gap-2">
          <MapPinIcon className="w-4 h-4" />
          {ticket.event?.venue || "Venue"}
        </div>
        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="w-4 h-4" />
          Ksh {ticket.price?.toLocaleString() || "0"}
        </div>
      </div>

      {ticket.mpesa_status === "confirmed" && ticket.qr_code && (
        <button
          onClick={() => onViewQR(ticket)}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          View QR Code
        </button>
      )}
    </div>
  );
};

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("events");
  const [searchTerm, setSearchTerm] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchEvents = async () => {
    try {
      const url = searchTerm
        ? `${API_URL}/events?search=${encodeURIComponent(searchTerm)}`
        : `${API_URL}/events`;
      const eventsRes = await fetch(url);
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Unable to load events.");
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (session?.accessToken) {
        const ticketsRes = await fetch(`${API_URL}/user/tickets`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        if (ticketsRes.ok) {
          const ticketsData = await ticketsRes.json();
          setUserTickets(Array.isArray(ticketsData) ? ticketsData : []);
        } else {
          setUserTickets([]);
        }
      } else {
        setUserTickets([]);
      }
      await fetchEvents();
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load your dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.role === "admin") {
      router.push("/dashboard/admin");
      return;
    }

    if (session?.user?.role === "organizer") {
      router.push("/dashboard/organiser");
      return;
    }

    fetchDashboardData();
  }, [status, session?.user?.id, session?.user?.role]);

  useEffect(() => {
    const storedFavorites = typeof window !== "undefined" ? localStorage.getItem("flexit-favorites") : null;
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("flexit-favorites", JSON.stringify(favorites));
    }
  }, [favorites]);

  useEffect(() => {
    if (status !== "loading") {
      const debounce = setTimeout(() => {
        fetchEvents();
      }, 250);
      return () => clearTimeout(debounce);
    }
  }, [searchTerm, status]);

  const handleBook = (event) => {
    setSelectedEvent(event);
    setShowBookingModal(true);
    setError("");
    setSuccess("");
  };

  const handleBookingSubmit = async (ticketType, quantity, contact) => {
    if (!selectedEvent) return;

    if (!ticketType) {
      setError("Please select a ticket type.");
      return;
    }

    if (!contact?.terms) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    if (!session?.user?.id) {
      if (!contact?.fullName || !contact?.email || !contact?.phone) {
        setError("Full name, email and phone are required for guest booking.");
        return;
      }
    }

    setBookingLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        event_id: selectedEvent.id,
        ticket_type: ticketType,
        quantity,
        payment_method: "mpesa",
      };

      if (!session?.user?.id) {
        payload.first_name = contact.fullName.split(" ")[0] || "Guest";
        payload.last_name = contact.fullName.split(" ").slice(1).join(" ") || "";
        payload.email = contact.email;
        payload.phone = contact.phone;
      }

      const headers = {
        "Content-Type": "application/json",
      };
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }

      const response = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to book ticket.");
      }

      setSuccess("Ticket booked successfully. Proceed to payment to confirm your reservation.");
      setShowBookingModal(false);
      setSelectedEvent(null);
      if (session?.user?.id) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Error booking ticket:", err);
      setError(err.message || "Error booking ticket.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleToggleFavorite = (eventId) => {
    setFavorites((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]
    );
  };

  const filteredEvents = events;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-b-2 border-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 backdrop-blur-xl bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Flex-It</h1>
              <p className="text-xs text-gray-500">Book events, tickets, and guest checkout.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name || "Guest"}
              </p>
              <p className="text-xs text-gray-500">
                {session?.user ? "Member" : "Guest explorer"}
              </p>
            </div>
            {session?.user ? (
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => signIn()}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <ExclamationCircleIcon className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={() => setError("")}
                className="text-sm text-red-600 hover:text-red-700 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="text-emerald-800 font-medium">{success}</p>
              <button
                onClick={() => setSuccess("")}
                className="text-sm text-emerald-600 hover:text-emerald-700 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <section className="mb-10 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white shadow-xl">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200 mb-3">Guest friendly experience</p>
            <h2 className="text-4xl font-bold sm:text-5xl">Discover events and book tickets without logging in.</h2>
            <p className="mt-4 text-base text-blue-100 max-w-2xl">
              Browse today’s events, reserve your seat, and complete payment instantly. Create an account later to keep your ticket history.
            </p>
          </div>
        </section>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your event dashboard</h2>
            <p className="text-sm text-gray-500">Explore upcoming shows, register as a guest, or manage tickets when signed in.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("events")}
              className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                activeTab === "events" ? "bg-white text-blue-700 shadow" : "bg-gray-100 text-gray-700"
              }`}
            >
              Browse events
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                activeTab === "tickets" ? "bg-white text-blue-700 shadow" : "bg-gray-100 text-gray-700"
              }`}
            >
              My tickets
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                activeTab === "favorites" ? "bg-white text-blue-700 shadow" : "bg-gray-100 text-gray-700"
              }`}
            >
              Favorites
            </button>
          </div>
        </div>

        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onBook={handleBook}
                    isFavorite={favorites.includes(event.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-3xl">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">{searchTerm ? "No events found matching your search." : "No events available right now."}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>
                <p className="text-sm text-gray-500">Track your confirmed reservations and view QR codes.</p>
              </div>
              {!session?.user && (
                <button
                  onClick={() => signIn()}
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Sign in to save tickets
                </button>
              )}
            </div>

            {session?.user ? (
              userTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onViewQR={() => {
                        setSelectedTicket(ticket);
                        setShowQRModal(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-3xl">
                  <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">You haven't booked any tickets yet.</p>
                  <button
                    onClick={() => setActiveTab("events")}
                    className="mt-4 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Browse events
                  </button>
                </div>
              )
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-3xl">
                <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Sign in to view your ticket history.</p>
                <button
                  onClick={() => signIn()}
                  className="mt-4 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Sign in now
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Favorite Events</h2>
              <button
                onClick={() => setActiveTab("events")}
                className="rounded-2xl bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
              >
                Browse events
              </button>
            </div>

            {events.filter((e) => favorites.includes(e.id)).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events
                  .filter((e) => favorites.includes(e.id))
                  .map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onBook={handleBook}
                      isFavorite={true}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-3xl">
                <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No favorite events yet. Tap the heart icon while browsing events.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <BookingModal
        isOpen={showBookingModal}
        event={selectedEvent}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleBookingSubmit}
        loading={bookingLoading}
        currentUser={session?.user}
      />

      {showQRModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Your QR Code</h3>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedTicket(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-6 text-center">
              {selectedTicket.qr_code ? (
                <img src={selectedTicket.qr_code} alt="QR Code" className="mx-auto" />
              ) : (
                <p className="text-gray-600">No QR code available yet.</p>
              )}
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p className="font-semibold text-gray-900">{selectedTicket.event?.name}</p>
              <p>{selectedTicket.ticket_type}</p>
            </div>

            <button
              onClick={() => {
                setShowQRModal(false);
                setSelectedTicket(null);
              }}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
