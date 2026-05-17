"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Calendar, MapPin, Clock, Users, CreditCard, Shield, CheckCircle, ArrowLeft, Ticket, Sparkles } from "lucide-react";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const DEFAULT_CAPACITY_BY_TIER = {
  vip: 50,
  premium: 100,
  general: 200,
  standard: 180,
};

const getTierCapacity = (ticketType) => {
  if (!ticketType) return 150;
  const key = ticketType.toLowerCase();
  if (key.includes("vip")) return 50;
  if (key.includes("premium")) return 100;
  if (key.includes("general")) return 200;
  if (key.includes("standard")) return 180;
  return 150;
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  

  const [event, setEvent] = useState(null);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ticketType: "",
    quantity: 1,
    paymentMethod: "card",
    terms: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [mpesaStatus, setMpesaStatus] = useState("");

  // Fetch event with ticket information
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/events/${id}`);
        const data = await res.json();
        
        // Transform ticket_prices array to tickets object
        const tickets = {};
        if (data.ticket_prices && Array.isArray(data.ticket_prices)) {
          data.ticket_prices.forEach((tp) => {
            tickets[tp.ticket_type] = {
              id: tp.id,
              price: tp.price,
              available: 100, // Default availability
            };
          });
        }
        
        setEvent({ ...data, tickets });
      } catch (err) {
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const handleQuantityChange = (delta) => {
    const newQuantity = formData.quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setFormData({ ...formData, quantity: newQuantity });
    }
  };

  const handleSubmit = async () => {
    // Check if user is logged in
    if (!session) {
      alert("Please login to book tickets");
      await signIn();
      return;
    }

    if (!formData.ticketType) {
      alert("Please select a ticket type");
      return;
    }
    if (!formData.email) {
      alert("Please enter your email");
      return;
    }
    if (!formData.phone) {
      alert("Please enter your phone number");
      return;
    }
    if (!formData.terms) {
      alert("Please accept the terms and conditions");
      return;
    }

    setIsProcessing(true);

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // Add JWT token from session if available
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }

      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          event_id: id,
          ticket_type: formData.ticketType,
          quantity: formData.quantity,
          email: formData.email,
          phone: formData.phone,
          first_name: formData.firstName,
          last_name: formData.lastName,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Booking failed");
      }

      const data = await res.json();

      setBookingConfirmation({
        id: data.id,
        amount: data.price * formData.quantity,
        ticketType: formData.ticketType,
        quantity: formData.quantity,
        eventName: event?.name,
      });

      alert("Booking successful! Proceed to payment.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Booking failed. Please try again.");
    }

    setIsProcessing(false);
  };

  const selected = event?.tickets?.[formData.ticketType];
  const total = selected ? selected.price * formData.quantity : 0;
  const availableTickets = selected ? selected.available : 0;

  // Premium Confirmation Screen
  if (bookingConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
        <div className="relative max-w-md w-full">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl blur-3xl"></div>
          
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-gray-300 mb-6">Your tickets have been reserved</p>
            
            <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Event</span>
                <span className="text-white font-medium">{bookingConfirmation.eventName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Ticket Type</span>
                <span className="text-white font-medium capitalize">{bookingConfirmation.ticketType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Quantity</span>
                <span className="text-white font-medium">{bookingConfirmation.quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Ticket ID</span>
                <span className="text-white font-mono text-xs">#{bookingConfirmation.id}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="text-gray-400">Total Paid</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Ksh {bookingConfirmation.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/event")}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
              >
                Browse More Events
              </button>
              <button
                onClick={() => window.print()}
                className="w-full bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all"
              >
                Download Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !event) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4">Loading event details...</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-20 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-black/70 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - Event Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h1 className="text-4xl font-bold text-white mb-4">{event.name}</h1>
              <div className="flex flex-wrap gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-yellow-400" />
                  <span>March 15, 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span>7:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-yellow-400" />
                  <span>Nairobi, Kenya</span>
                </div>
              </div>
              <p className="text-gray-300 mt-4 leading-relaxed">{event.description}</p>
            </div>

            {/* Ticket Tiers */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-yellow-400" />
                Select Your Ticket
              </h2>
              <div className="space-y-3">
                {event.ticket_prices.map((tier) => {
                  const isSelected = formData.ticketType === tier.ticket_type;
                  const available = availability.perTier[tier.ticket_type]
                    ? availability.perTier[tier.ticket_type].capacity - availability.perTier[tier.ticket_type].sold
                    : 0;
                  const isSoldOut = available === 0;

                  return (
                    <div
                      key={tier.id}
                      onClick={() => !isSoldOut && setFormData({ ...formData, ticketType: tier.ticket_type, quantity: 1 })}
                      className={`relative group cursor-pointer transition-all duration-300 rounded-xl p-4 ${
                        isSelected
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/25"
                          : isSoldOut
                          ? "bg-white/5 opacity-50 cursor-not-allowed"
                          : "bg-white/5 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={`font-bold text-lg ${isSelected ? "text-black" : "text-white"}`}>
                            {tier.ticket_type.toUpperCase()}
                          </h3>
                          <p className={`text-sm ${isSelected ? "text-black/70" : "text-gray-400"}`}>
                            {available} tickets left
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${isSelected ? "text-black" : "text-white"}`}>
                            Ksh {tier.price.toLocaleString()}
                          </p>
                          {isSoldOut && (
                            <span className="text-xs text-red-400">Sold Out</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Checkout */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4">
                <h2 className="text-xl font-bold text-black text-center">Complete Your Booking</h2>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">First Name</label>
                    <input
                      type="text"
                      placeholder="John"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+254 700 000000"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {/* Quantity Selector */}
                {formData.ticketType && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-50"
                        disabled={formData.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold text-white w-12 text-center">
                        {formData.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-50"
                        disabled={formData.quantity >= availableTickets}
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-400 ml-2">
                        {availableTickets} available
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, paymentMethod: "card" })}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        formData.paymentMethod === "card"
                          ? "bg-yellow-400 text-black"
                          : "bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Card
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, paymentMethod: "mpesa" })}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        formData.paymentMethod === "mpesa"
                          ? "bg-yellow-400 text-black"
                          : "bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      M-Pesa
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-yellow-400"
                    checked={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                  />
                  <span className="text-sm text-gray-300">
                    I agree to the <span className="text-yellow-400">Terms & Conditions</span>
                  </span>
                </label>

                {/* Total & Pay Button */}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Amount</span>
                    <span className="text-3xl font-bold text-white">
                      Ksh {total.toLocaleString()}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={isProcessing || !formData.ticketType || !formData.terms}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      "Confirm & Pay"
                    )}
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Shield className="w-3 h-3" />
                    Secure payment encrypted
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}