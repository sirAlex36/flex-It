"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Redirect organizers to their dashboard
const OrganizerRedirect = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.role === "organizer") {
      router.push("/dashboard/organizer");
    }
  }, [session?.user?.role, router]);

  return null;
};
import {
  CalendarIcon,
  TicketIcon,
  UserIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  StarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  QrCodeIcon,
  ThumbUpIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

// EventCard Component
const EventCard = ({ event, onBook, isFavorite, onToggleFavorite }) => {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Event Image Placeholder */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 h-48 flex items-center justify-center relative">
        <CalendarIcon className="w-16 h-16 text-white opacity-50" />
        <button
          onClick={() => onToggleFavorite(event.id)}
          className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-gray-100 transition"
        >
          {isFavorite ? (
            <HeartSolid className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Event Details */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{event.name}</h3>
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
            {event.venue}
          </div>
        </div>
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

// BookingModal Component
const BookingModal = ({ isOpen, event, onClose, onSubmit, loading }) => {
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState("General");

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Book Tickets</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="font-semibold text-gray-900 mb-2">{event.name}</p>
            <p className="text-sm text-gray-600">{event.venue}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticket Type
            </label>
            <select
              value={ticketType}
              onChange={(e) => setTicketType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>General</option>
              <option>VIP</option>
              <option>Premium</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
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
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(ticketType, quantity)}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Booking..." : "Book Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

// TicketCard Component
const TicketCard = ({ ticket, onViewQR }) => {
  const eventDate = new Date(ticket.event?.date || new Date());
  const isPast = eventDate < new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{ticket.event?.name || "Event"}</h3>
          <p className="text-sm text-gray-600 mt-1">{ticket.ticket_type}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isPast ? "bg-gray-100 text-gray-600" :
          ticket.mpesa_status === "confirmed" ? "bg-green-100 text-green-700" :
          "bg-yellow-100 text-yellow-700"
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
          {ticket.price ? `$${(ticket.price / 100).toFixed(2)}` : "Free"}
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

  // Define async functions before hooks
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`,
      };

      const [ticketsRes] = await Promise.all([
        fetch(`${API_URL}/user/tickets`, { headers }),
      ]);

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setUserTickets(Array.isArray(ticketsData) ? ticketsData : []);
      }

      // Fetch events separately
      await fetchEvents();

      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load data");
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`,
      };

      const url = searchTerm 
        ? `${API_URL}/events?search=${encodeURIComponent(searchTerm)}`
        : `${API_URL}/events`;
      
      const eventsRes = await fetch(url, { headers });
      
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  // Protection - redirect if not user
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role === "admin") {
      router.push("/dashboard/admin");
    }
  }, [status, session, router]);

  // Fetch dashboard data on mount
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchDashboardData();
    }
  }, [status, session?.user?.id]);

  // Refetch events when search changes
  useEffect(() => {
    if (session?.user?.id) {
      const debounceTimer = setTimeout(() => {
        fetchEvents();
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 border-b-2 border-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return null; // Redirect happens in useEffect
  }

  const handleBook = (event) => {
    setSelectedEvent(event);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (ticketType, quantity) => {
    try {
      setBookingLoading(true);
      const response = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          event_id: selectedEvent.id,
          ticket_type: ticketType,
          quantity,
          payment_method: "mpesa",
        }),
      });

      if (response.ok) {
        setSuccess("Ticket booked successfully! Proceed to payment.");
        setShowBookingModal(false);
        fetchDashboardData();
      } else {
        setError("Failed to book ticket");
      }
    } catch (err) {
      console.error("Error booking ticket:", err);
      setError("Error booking ticket");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleToggleFavorite = (eventId) => {
    if (favorites.includes(eventId)) {
      setFavorites(favorites.filter((id) => id !== eventId));
    } else {
      setFavorites([...favorites, eventId]);
    }
  };

  const filteredEvents = events;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 backdrop-blur-xl bg-opacity-80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Flex-It</h1>
              <p className="text-xs text-gray-500">Event Ticketing</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="h-10 w-px bg-gray-200"></div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name || "User"}</p>
                <p className="text-xs text-gray-500">Member</p>
              </div>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Alerts */}
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
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium">{success}</p>
              <button
                onClick={() => setSuccess("")}
                className="text-sm text-green-600 hover:text-green-700 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {[
            { id: "events", label: "Browse Events", icon: CalendarIcon },
            { id: "tickets", label: "My Tickets", icon: TicketIcon },
            { id: "favorites", label: "Favorites", icon: HeartIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Browse Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Events Grid */}
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
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  {searchTerm ? "No events found matching your search" : "No events available"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === "tickets" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>
            {userTickets.length > 0 ? (
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
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">You haven't booked any tickets yet</p>
                <button
                  onClick={() => setActiveTab("events")}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Browse Events
                </button>
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === "favorites" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Favorite Events</h2>
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
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No favorite events yet</p>
                <button
                  onClick={() => setActiveTab("events")}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Browse Events
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        event={selectedEvent}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleBookingSubmit}
        loading={bookingLoading}
      />

      {/* QR Code Modal */}
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

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              {selectedTicket.qr_code && (
                <img
                  src={selectedTicket.qr_code}
                  alt="QR Code"
                  className="w-full"
                />
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
