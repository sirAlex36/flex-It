"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Calendar, MapPin, Clock, Ticket, CreditCard, CheckCircle, ArrowLeft, Sparkles } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return date;
  }
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [event, setEvent] = useState(null);
  const [availability, setAvailability] = useState({ by_tier: {} });
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ticketType: "",
    quantity: 1,
    paymentMethod: "mpesa",
    terms: false,
  });

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const [eventRes, availabilityRes] = await Promise.all([
          fetch(`${API_URL}/events/${id}`),
          fetch(`${API_URL}/events/${id}/availability`),
        ]);

        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setEvent(eventData);

          const nameParts = session?.user?.name?.split(" ") || [];
          setFormData((prev) => ({
            ...prev,
            ticketType: eventData.ticket_prices?.[0]?.ticket_type || "",
            firstName: prev.firstName || nameParts[0] || "",
            lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
            email: prev.email || session?.user?.email || "",
          }));
        }

        if (availabilityRes.ok) {
          const availabilityData = await availabilityRes.json();
          setAvailability({ by_tier: availabilityData.by_tier || {} });
        }
      } catch (err) {
        console.error("Error loading event details:", err);
        setError("Unable to load event details at this time.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, session]);

  const handleQuantityChange = (delta) => {
    setFormData((prev) => ({
      ...prev,
      quantity: Math.max(1, Math.min(10, prev.quantity + delta)),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.ticketType) {
      setError("Please select a ticket tier.");
      return;
    }

    if (!formData.email || !formData.phone || !formData.firstName || !formData.lastName) {
      setError("Please complete your contact details.");
      return;
    }

    if (!formData.terms) {
      setError("You must accept the terms and conditions.");
      return;
    }

    setError("");
    setIsProcessing(true);

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }

      const response = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          event_id: id,
          ticket_type: formData.ticketType,
          quantity: formData.quantity,
          payment_method: formData.paymentMethod,
          email: formData.email,
          phone: formData.phone,
          first_name: formData.firstName,
          last_name: formData.lastName,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Booking failed. Please try again.");
      }

      const data = await response.json();
      setBookingConfirmation({
        id: data.id,
        ticketType: data.ticket_type,
        quantity: data.quantity,
        amount: data.price * formData.quantity,
        eventName: event?.name,
      });

      // Initiate M-Pesa STK Push for payment
      try {
        const payResp = await fetch(`${API_URL}/mpesa/stk-push`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            phone: formData.phone,
            amount: data.price * formData.quantity,
            ticket_id: data.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
          }),
        });

        if (payResp.ok) {
          const payData = await payResp.json().catch(() => ({}));
          setBookingConfirmation((prev) => ({ ...prev, stkRequest: payData.request_id, phone: payData.phone }));
        } else {
          console.warn("Failed to initiate STK push");
        }
      } catch (err) {
        console.warn("STK push error:", err);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Booking failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedTier = event?.ticket_prices?.find((tier) => tier.ticket_type === formData.ticketType);
  const selectedAvailability = availability.by_tier?.[formData.ticketType] || {};
  const availableTickets = selectedAvailability.remaining ?? selectedAvailability.capacity ?? 0;
  const total = selectedTier ? selectedTier.price * formData.quantity : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="h-14 w-14 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white">Loading event info…</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white/10 border border-white/10 rounded-3xl p-8 backdrop-blur-xl text-white">
          <p className="text-lg font-semibold">Event not found.</p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-5 py-3 rounded-full bg-yellow-500 text-black font-semibold"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (bookingConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 py-12">
        <div className="relative max-w-lg w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-gray-300 mb-6">Your tickets are reserved and awaiting payment confirmation.</p>
            <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-3 text-left">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Event</span>
                <span className="text-white font-medium">{bookingConfirmation.eventName}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-300">
                <span>Ticket Type</span>
                <span className="text-white font-medium">{bookingConfirmation.ticketType}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-300">
                <span>Quantity</span>
                <span className="text-white font-medium">{bookingConfirmation.quantity}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-300">
                <span>Ticket ID</span>
                <span className="text-white font-mono text-xs">#{bookingConfirmation.id}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="text-gray-300">Estimated total</span>
                <span className="text-2xl font-bold text-white">Ksh {total.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/dashboard/user")}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
              >
                Browse More Events
              </button>
              <button
                onClick={() => window.print()}
                className="w-full bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all"
              >
                Print Booking Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
        <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-20 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-black/70 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">
        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h1 className="text-4xl font-bold text-white mb-4">{event.name}</h1>
              <div className="flex flex-wrap gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-yellow-400" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-yellow-400" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span>Instant guest checkout</span>
                </div>
              </div>
              <p className="text-gray-300 mt-4 leading-relaxed">{event.description}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-yellow-400" />
                Pick your ticket
              </h2>
              <div className="space-y-3">
                {event.ticket_prices.map((tier) => {
                  const isSelected = formData.ticketType === tier.ticket_type;
                  const tierAvailability = availability.by_tier?.[tier.ticket_type] || {};
                  const available = tierAvailability.remaining ?? tierAvailability.capacity ?? 0;
                  const isSoldOut = available === 0;

                  return (
                    <button
                      type="button"
                      key={tier.id}
                      onClick={() => !isSoldOut && setFormData((prev) => ({ ...prev, ticketType: tier.ticket_type, quantity: 1 }))}
                      className={`relative w-full text-left group transition-all duration-300 rounded-xl p-4 ${
                        isSelected
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/25"
                          : isSoldOut
                          ? "bg-white/5 opacity-50 cursor-not-allowed"
                          : "bg-white/5 hover:bg-white/10 border border-white/10"
                      }`}
                      disabled={isSoldOut}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={`font-bold text-lg ${isSelected ? "text-black" : "text-white"}`}>
                            {tier.ticket_type}
                          </h3>
                          <p className={`text-sm ${isSelected ? "text-black/70" : "text-gray-400"}`}>
                            {available} tickets remaining
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${isSelected ? "text-black" : "text-white"}`}>
                            Ksh {tier.price.toLocaleString()}
                          </p>
                          {isSoldOut && <span className="text-xs text-red-400">Sold Out</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4">
                <h2 className="text-xl font-bold text-black text-center">Complete Your Booking</h2>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">First Name</label>
                    <input
                      type="text"
                      placeholder="John"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                      value={formData.firstName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+254 700 000000"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

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
                      <span className="text-2xl font-bold text-white w-12 text-center">{formData.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-50"
                        disabled={formData.quantity >= availableTickets}
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-400 ml-2">{availableTickets} available</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: "card" }))}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                        formData.paymentMethod === "card"
                          ? "bg-yellow-400 text-black"
                          : "bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Card
                    </button>
                    <button
                      onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: "mpesa" }))}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
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

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-yellow-400"
                    checked={formData.terms}
                    onChange={(e) => setFormData((prev) => ({ ...prev, terms: e.target.checked }))}
                  />
                  <span className="text-sm text-gray-300">
                    I agree to the <span className="text-yellow-400">Terms & Conditions</span>
                  </span>
                </label>

                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Amount</span>
                    <span className="text-3xl font-bold text-white">Ksh {total.toLocaleString()}</span>
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
                    <span className="font-medium">Secure payment encrypted</span>
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
