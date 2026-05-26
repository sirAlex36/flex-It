"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  UserCircleIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  ShareIcon,
  CreditCardIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolid,
  StarIcon as StarSolid,
} from "@heroicons/react/24/solid";
import { format, isAfter, isToday, differenceInDays } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const EventCard = ({ event, onBook, isFavorite, onToggleFavorite, index }) => {
  const eventDate = new Date(event.date);
  const isUpcoming = isAfter(eventDate, new Date());
  const daysUntil = differenceInDays(eventDate, new Date());
  const isThisWeek = daysUntil <= 7 && daysUntil >= 0;

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      {/* Gradient border on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl -z-10" />
      
      <div className="relative bg-white rounded-2xl h-full">
        {/* Event Image/Header */}
        <div className="relative h-52 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-700/90 z-10" />
          <div className="absolute inset-0 bg-black/20 z-20" />
          
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-20 z-0">
            <div className="absolute top-0 -right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative z-30 text-white text-center px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-xs uppercase tracking-[0.25em] text-blue-200 mb-3">
                {isThisWeek ? "🔥 This Week" : isUpcoming ? "Upcoming" : "Past Event"}
              </p>
              <h3 className="text-2xl font-bold mb-2 line-clamp-2">{event.name}</h3>
              <p className="text-sm text-blue-100">{event.venue}</p>
            </motion.div>
          </div>

          <button
            onClick={() => onToggleFavorite(event.id)}
            className="absolute top-3 right-3 z-40 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 hover:scale-110"
          >
            {isFavorite ? (
              <HeartSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-700" />
            )}
          </button>

          {isThisWeek && isUpcoming && (
            <div className="absolute top-3 left-3 z-40 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-lg">
              {daysUntil === 0 ? "Today" : `${daysUntil}d left`}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span>{format(eventDate, "MMM dd, yyyy")}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
              <ClockIcon className="w-4 h-4 text-blue-600" />
              <span>{format(eventDate, "h:mm a")}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
              <MapPinIcon className="w-4 h-4 text-blue-600" />
              <span className="truncate max-w-[120px]">{event.venue}</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-6 line-clamp-2">
            {event.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500">Starting from</p>
              <p className="text-xl font-bold text-gray-900">
                Ksh {event.ticket_prices?.[0]?.price?.toLocaleString() || "0"}
              </p>
            </div>
            {event.ticket_prices?.length > 1 && (
              <div className="text-xs text-gray-500">
                +{event.ticket_prices.length - 1} more tiers
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onBook(event)}
            disabled={!isUpcoming}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              isUpcoming
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isUpcoming ? (
              <>
                Book Now
                <ArrowRightIcon className="w-4 h-4" />
              </>
            ) : (
              "Event Passed"
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const BookingModal = ({ isOpen, event, onClose, onSubmit, loading, currentUser }) => {
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState("");
  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState("");
  const [terms, setTerms] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const firstTier = event?.ticket_prices?.[0];
    setTicketType(firstTier?.ticket_type || "");
    setSelectedPrice(firstTier?.price || null);
    setQuantity(1);
    setFullName(currentUser?.name || "");
    setEmail(currentUser?.email || "");
    setPhone("");
    setTerms(false);
  }, [isOpen, event, currentUser]);

  const handleTicketTypeChange = (type, price) => {
    setTicketType(type);
    setSelectedPrice(price);
  };

  const totalPrice = (selectedPrice || 0) * quantity;

  if (!isOpen || !event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Book Tickets</h3>
                <p className="text-sm text-gray-500 mt-1">Secure your spot</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="p-6 space-y-6">
              {/* Event Summary */}
              <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                <p className="text-sm text-gray-600 mb-1">Selected Event</p>
                <p className="font-semibold text-gray-900">{event.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(event.date), "EEEE, MMMM dd, yyyy • h:mm a")}
                </p>
                <p className="text-sm text-gray-500">{event.venue}</p>
              </div>

              {/* Ticket Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Ticket Type
                </label>
                <div className="space-y-3">
                  {event.ticket_prices?.map((tier) => (
                    <motion.label
                      key={tier.id}
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        ticketType === tier.ticket_type
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="ticketType"
                          value={tier.ticket_type}
                          checked={ticketType === tier.ticket_type}
                          onChange={() => handleTicketTypeChange(tier.ticket_type, tier.price)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{tier.ticket_type}</p>
                          <p className="text-sm text-gray-500">Standard admission</p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900">
                        Ksh {tier.price.toLocaleString()}
                      </p>
                    </motion.label>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Number of Tickets
                </label>
                <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-xl w-fit">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                  >
                    −
                  </motion.button>
                  <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                  >
                    +
                  </motion.button>
                </div>
              </div>

              {/* Guest Info */}
              {!currentUser && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 XXX XXX XXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </motion.div>
              )}

              {/* Price Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    Ksh {totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Processing fee</span>
                  <span>Ksh 0</span>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <button className="text-blue-600 hover:underline">
                    terms and conditions
                  </button>
                </span>
              </label>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="py-3.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSubmit(ticketType, quantity, { fullName, email, phone, terms })}
                  disabled={loading || !ticketType || !terms}
                  className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    `Pay Ksh ${totalPrice.toLocaleString()}`
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const TicketCard = ({ ticket, onViewQR }) => {
  const eventDate = new Date(ticket.event?.date || Date.now());
  const isPast = !isAfter(eventDate, new Date());
  const isToday = isToday(eventDate);

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{ticket.event?.name || "Event"}</h3>
              <p className="text-sm text-blue-100 mt-1">{ticket.ticket_type}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isPast
                  ? "bg-gray-200 text-gray-700"
                  : ticket.mpesa_status === "confirmed"
                  ? "bg-green-500 text-white"
                  : "bg-yellow-500 text-white"
              }`}
            >
              {isPast ? "Past" : ticket.mpesa_status === "confirmed" ? "Confirmed" : "Pending"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3 text-sm mb-6">
          <div className="flex items-center gap-3 text-gray-600">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span>
              {format(eventDate, "EEEE, MMMM dd, yyyy")}
              {isToday && <span className="ml-2 text-green-600 font-semibold">• Today</span>}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <ClockIcon className="w-4 h-4 text-blue-600" />
            <span>{format(eventDate, "h:mm a")}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <MapPinIcon className="w-4 h-4 text-blue-600" />
            <span>{ticket.event?.venue || "Venue"}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <CreditCardIcon className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-gray-900">
              Ksh {ticket.price?.toLocaleString() || "0"}
            </span>
          </div>
        </div>

        {ticket.mpesa_status === "confirmed" && ticket.qr_code && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewQR(ticket)}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
          >
            View QR Code
          </motion.button>
        )}
      </div>
    </motion.div>
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
  const [stats, setStats] = useState({ totalEvents: 0, upcomingTickets: 0, favoritesCount: 0 });

  const fetchEvents = async () => {
    try {
      const url = searchTerm
        ? `${API_URL}/events?search=${encodeURIComponent(searchTerm)}`
        : `${API_URL}/events`;
      const eventsRes = await fetch(url);
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setStats(prev => ({ ...prev, totalEvents: eventsData.length }));
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
          const upcoming = ticketsData.filter(t => isAfter(new Date(t.event?.date), new Date()) && t.mpesa_status === "confirmed").length;
          setStats(prev => ({ ...prev, upcomingTickets: upcoming }));
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
        const favs = JSON.parse(storedFavorites);
        setFavorites(favs);
        setStats(prev => ({ ...prev, favoritesCount: favs.length }));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("flexit-favorites", JSON.stringify(favorites));
      setStats(prev => ({ ...prev, favoritesCount: favorites.length }));
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

      setSuccess("🎉 Ticket booked successfully! Proceed to payment to confirm your reservation.");
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
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-gray-600 font-medium"
          >
            Loading your dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Flex-It
                </h1>
                <p className="text-xs text-gray-500">Your premier event booking platform</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 flex items-center justify-end gap-2">
                  <UserCircleIcon className="w-4 h-4 text-blue-600" />
                  {session?.user?.name || "Guest User"}
                </p>
                <p className="text-xs text-gray-500">
                  {session?.user ? `${session.user.email} • Member` : "Guest explorer"}
                </p>
              </div>
              {session?.user ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
                  className="rounded-xl border border-gray-200 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  Sign out
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signIn()}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:shadow-lg transition"
                >
                  Sign in
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
            >
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-600 hover:text-red-700 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-gradient-to-r from-emerald-50 to-green-100 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3"
            >
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-emerald-800 font-medium">{success}</p>
              </div>
              <button
                onClick={() => setSuccess("")}
                className="text-emerald-600 hover:text-emerald-700 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 md:p-12 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -right-20 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-3xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-4"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>Guest friendly experience</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Discover events and book tickets without logging in
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base text-blue-100 max-w-2xl"
            >
              Browse today's events, reserve your seat, and complete payment instantly.
              Create an account later to keep your ticket history.
            </motion.p>
          </div>
        </motion.section>

        {/* Stats Bar */}
        {session?.user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              <p className="text-sm text-gray-500">Total Events</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingTickets}</p>
              <p className="text-sm text-gray-500">Upcoming Tickets</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{stats.favoritesCount}</p>
              <p className="text-sm text-gray-500">Favorite Events</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{userTickets.length}</p>
              <p className="text-sm text-gray-500">Total Tickets</p>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Event Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">
              Explore upcoming shows, register as a guest, or manage your tickets
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["events", "tickets", "favorites"].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tab === "events" && "Browse Events"}
                {tab === "tickets" && "My Tickets"}
                {tab === "favorites" && "Favorites"}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Search Bar - Only for events tab */}
        {activeTab === "events" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by name, venue, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              />
            </div>
          </motion.div>
        )}

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          {activeTab === "events" && (
            <motion.div
              key="events"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event, index) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onBook={handleBook}
                      isFavorite={favorites.includes(event.id)}
                      onToggleFavorite={handleToggleFavorite}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white rounded-3xl border border-gray-200"
                >
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">
                    {searchTerm ? "No events found matching your search." : "No events available right now."}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear search
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "tickets" && (
            <motion.div
              key="tickets"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              {session?.user ? (
                userTickets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userTickets.map((ticket, index) => (
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 bg-white rounded-3xl border border-gray-200"
                  >
                    <TicketIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-4">You haven't booked any tickets yet.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab("events")}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white font-semibold hover:shadow-lg transition"
                    >
                      Browse Events
                      <ArrowRightIcon className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white rounded-3xl border border-gray-200"
                >
                  <TicketIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-4">Sign in to view your ticket history and manage your bookings.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => signIn()}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white font-semibold hover:shadow-lg transition"
                  >
                    Sign In Now
                    <ArrowRightIcon className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "favorites" && (
            <motion.div
              key="favorites"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              {events.filter((e) => favorites.includes(e.id)).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events
                    .filter((e) => favorites.includes(e.id))
                    .map((event, index) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onBook={handleBook}
                        isFavorite={true}
                        onToggleFavorite={handleToggleFavorite}
                        index={index}
                      />
                    ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white rounded-3xl border border-gray-200"
                >
                  <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-4">
                    No favorite events yet. Tap the heart icon on events you love!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab("events")}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white font-semibold hover:shadow-lg transition"
                  >
                    Browse Events
                    <ArrowRightIcon className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
        currentUser={session?.user}
      />

      {/* QR Modal */}
      <AnimatePresence>
        {showQRModal && selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowQRModal(false);
              setSelectedTicket(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
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
              </div>

              <div className="p-6 text-center">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl mb-6">
                  {selectedTicket.qr_code ? (
                    <img src={selectedTicket.qr_code} alt="QR Code" className="mx-auto w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 mx-auto flex items-center justify-center text-gray-400">
                      No QR code available
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-left mb-6">
                  <p className="font-semibold text-gray-900">{selectedTicket.event?.name}</p>
                  <p className="text-sm text-gray-600">Type: {selectedTicket.ticket_type}</p>
                  <p className="text-sm text-gray-600">
                    Date: {format(new Date(selectedTicket.event?.date), "MMMM dd, yyyy • h:mm a")}
                  </p>
                  <p className="text-sm text-gray-600">Venue: {selectedTicket.event?.venue}</p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-xs text-blue-800">
                    This QR code is unique to your ticket. Please present it at the event entrance for scanning.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowQRModal(false);
                    setSelectedTicket(null);
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}