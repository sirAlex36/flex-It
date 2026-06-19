"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  CheckCircleIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  HomeIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolid,
} from "@heroicons/react/24/solid";
import { format, isAfter, isToday, differenceInDays } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flex-it.onrender.com";

// ========== ANIMATION VARIANTS ==========
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

// ========== COMPONENTS ==========

// Gradient Background
const GradientBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
    <div className="absolute top-0 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
  </div>
);

// Greeting Banner
const GreetingBanner = ({ user, stats }) => {
  const hour = new Date().getHours();
  let greeting = "Good evening";
  let emoji = "🌙";
  if (hour < 12) { greeting = "Good morning"; emoji = "🌅"; }
  else if (hour < 17) { greeting = "Good afternoon"; emoji = "☀️"; }

  const upcomingEvents = stats.upcomingTickets || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-200">
            {greeting} {emoji}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mt-1">
            {user?.name ? `Welcome back, ${user.name.split(' ')[0]}!` : "Welcome to Flex-It!"}
          </h1>
          <p className="text-blue-100 mt-2 max-w-xl">
            {upcomingEvents > 0 
              ? `You have ${upcomingEvents} upcoming ${upcomingEvents === 1 ? 'event' : 'events'} waiting for you!`
              : "Discover amazing events and book your tickets today."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl text-sm font-semibold hover:bg-white/30 transition-all"
          >
            <span className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              Explore Events
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Stats Card
const StatsCard = ({ icon: Icon, label, value, color, subtitle, trend }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    pink: "from-pink-500 to-rose-500",
    green: "from-emerald-500 to-green-600",
    orange: "from-orange-500 to-amber-600",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300" />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-medium mt-2 ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

// Event Card
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
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600"} 
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <button
          onClick={() => onToggleFavorite(event.id)}
          className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 hover:scale-110 z-10"
        >
          {isFavorite ? (
            <HeartSolid className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-700" />
          )}
        </button>

        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 z-10">
          {isThisWeek && isUpcoming && (
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full flex items-center gap-1">
              <FireIcon className="w-3 h-3" />
              {daysUntil === 0 ? "Today" : `${daysUntil}d left`}
            </span>
          )}
          {event.ticket_prices?.[0]?.price < 500 && (
            <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
              Budget
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-24 z-10">
          <h3 className="text-lg font-bold text-white line-clamp-1">{event.name}</h3>
          <p className="text-xs text-white/80 line-clamp-1">{event.venue}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
            <CalendarIcon className="w-3 h-3 text-blue-600" />
            {format(eventDate, "MMM dd")}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
            <ClockIcon className="w-3 h-3 text-blue-600" />
            {format(eventDate, "h:mm a")}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Starting from</p>
            <p className="text-xl font-bold text-gray-900">
              Ksh {event.ticket_prices?.[0]?.price?.toLocaleString() || "0"}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onBook(event)}
            disabled={!isUpcoming}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
              isUpcoming
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isUpcoming ? "Book Now" : "Passed"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Ticket Card
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
        <div className="relative flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{ticket.event?.name || "Event"}</h3>
            <p className="text-sm text-blue-100 mt-1">{ticket.ticket_type}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isPast
                ? "bg-gray-200 text-gray-700"
                : ticket.mpesa_status === "confirmed"
                ? "bg-emerald-500 text-white"
                : "bg-amber-500 text-white"
            }`}
          >
            {isPast ? "Past" : ticket.mpesa_status === "confirmed" ? "✓ Confirmed" : "Pending"}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-3 text-gray-600">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span>
              {format(eventDate, "EEEE, MMMM dd, yyyy")}
              {isToday && <span className="ml-2 text-emerald-600 font-semibold">• Today</span>}
            </span>
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

// Booking Modal
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Book Tickets</h3>
                <p className="text-sm text-gray-500 mt-1">Secure your spot</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition rounded-xl hover:bg-gray-100"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                <p className="text-sm text-gray-600 mb-1">Selected Event</p>
                <p className="font-semibold text-gray-900">{event.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(event.date), "EEEE, MMMM dd, yyyy • h:mm a")}
                </p>
                <p className="text-sm text-gray-500">{event.venue}</p>
              </div>

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

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Number of Tickets
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition text-xl font-bold"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition text-xl font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {!currentUser && (
                <div className="space-y-4">
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
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    Ksh {totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <button className="text-blue-600 hover:underline">terms and conditions</button>
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onClose}
                  className="py-3.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
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
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ========== MAIN COMPONENT ==========

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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      if (session?.user?.accessToken) {
        const ticketsRes = await fetch(`${API_URL}/user/tickets`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.accessToken}`,
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
      }, 300);
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
      if (session?.user?.accessToken) {
        headers.Authorization = `Bearer ${session.user.accessToken}`;
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
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen">
      <GradientBackground />

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled ? "bg-white/80 backdrop-blur-xl shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-lg">F</span>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Flex-It
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Book amazing events</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name || "Guest"}
                </p>
                <p className="text-xs text-gray-500">
                  {session?.user ? "Member" : "Guest explorer"}
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
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
            >
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
              <button onClick={() => setError("")} className="text-red-600 hover:text-red-700">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3"
            >
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-emerald-800 font-medium">{success}</p>
              </div>
              <button onClick={() => setSuccess("")} className="text-emerald-600 hover:text-emerald-700">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <GreetingBanner user={session?.user} stats={stats} />

        {session?.user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
          >
            <StatsCard
              icon={CalendarIcon}
              label="Total Events"
              value={stats.totalEvents}
              color="blue"
            />
            <StatsCard
              icon={TicketIcon}
              label="Upcoming Tickets"
              value={stats.upcomingTickets}
              color="purple"
            />
            <StatsCard
              icon={HeartIcon}
              label="Favorites"
              value={stats.favoritesCount}
              color="pink"
            />
            <StatsCard
              icon={TicketIcon}
              label="Total Tickets"
              value={userTickets.length}
              color="green"
              subtitle="All time"
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("events")}
            className={`px-6 py-3 rounded-2xl font-medium transition-all ${
              activeTab === "events"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center gap-2">
              <HomeIcon className="w-5 h-5" />
              Browse Events
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("tickets")}
            className={`px-6 py-3 rounded-2xl font-medium transition-all ${
              activeTab === "tickets"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center gap-2">
              <TicketIcon className="w-5 h-5" />
              My Tickets
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("favorites")}
            className={`px-6 py-3 rounded-2xl font-medium transition-all ${
              activeTab === "favorites"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center gap-2">
              <HeartIcon className="w-5 h-5" />
              Favorites
            </span>
          </motion.button>
        </motion.div>

        {activeTab === "events" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by name, venue, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white/80 backdrop-blur-sm"
              />
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "events" && (
            <motion.div
              key="events"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-8"
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
                  className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200"
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
              className="mt-8"
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
                    className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200"
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
                  className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200"
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
              className="mt-8"
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
                  className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowQRModal(false);
              setSelectedTicket(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
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
                    className="p-2 text-gray-400 hover:text-gray-600 transition rounded-xl hover:bg-gray-100"
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
                <button
                  onClick={() => {
                    setShowQRModal(false);
                    setSelectedTicket(null);
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}