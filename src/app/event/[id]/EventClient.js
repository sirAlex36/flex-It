// /src/app/event/[id]/EventClient.js
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Users,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  User,
  Shield,
  ChevronRight,
  XCircle,
  Heart,
  Share2,
  Star,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flex-it.onrender.com";

// Utility functions
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

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(price);
};

const validatePhone = (phone) => {
  // Kenyan phone number validation
  const cleaned = phone.replace(/\s/g, "");
  return /^(?:\+254|0)?[17]\d{8}$/.test(cleaned);
};

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Custom hook for booking state management
const useBooking = (initialState = {}) => {
  const [state, setState] = useState({
    step: "details", // details, payment, confirmation
    isLoading: false,
    error: null,
    success: null,
    ...initialState,
  });

  const setStep = (step) => setState((prev) => ({ ...prev, step }));
  const setLoading = (isLoading) => setState((prev) => ({ ...prev, isLoading }));
  const setError = (error) => setState((prev) => ({ ...prev, error }));
  const setSuccess = (success) => setState((prev) => ({ ...prev, success }));
  const reset = () => setState({ step: "details", isLoading: false, error: null, success: null });

  return { state, setStep, setLoading, setError, setSuccess, reset };
};

export default function EventClient({ id }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [event, setEvent] = useState(null);
  const [availability, setAvailability] = useState({ by_tier: {} });
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Booking state machine
  const { state: bookingState, setStep, setLoading: setBookingLoading, setError: setBookingError, setSuccess: setBookingSuccess, reset: resetBooking } = useBooking();

  // Fetch event data
  const fetchEvent = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const headers = session?.user?.accessToken
        ? { Authorization: `Bearer ${session.user.accessToken}` }
        : {};

      const [eventRes, availabilityRes] = await Promise.all([
        fetch(`${API_URL}/events/${id}`, { headers }),
        fetch(`${API_URL}/events/${id}/availability`, { headers }),
      ]);

      if (!eventRes.ok) throw new Error("Event not found");
      const eventData = await eventRes.json();
      setEvent(eventData);

      if (availabilityRes.ok) {
        const availabilityData = await availabilityRes.json();
        setAvailability({ by_tier: availabilityData.by_tier || {} });
      }

      // Pre-fill form with user data
      const nameParts = session?.user?.name?.split(" ") || [];
      setFormData((prev) => ({
        ...prev,
        ticketType: eventData.ticket_prices?.[0]?.ticket_type || "",
        firstName: prev.firstName || nameParts[0] || "",
        lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
        email: prev.email || session?.user?.email || "",
      }));
    } catch (err) {
      console.error("Error loading event:", err);
      setBookingError("Unable to load event details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id, session]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  // Validate form
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!validateEmail(formData.email)) errors.email = "Please enter a valid email";
    if (!formData.phone) errors.phone = "Phone number is required";
    else if (!validatePhone(formData.phone)) errors.phone = "Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678)";
    if (!formData.ticketType) errors.ticketType = "Please select a ticket type";
    if (!formData.terms) errors.terms = "You must accept the terms and conditions";
    
    return errors;
  }, [formData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    // Clear field error when user types
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleQuantityChange = (delta) => {
    const selectedTier = event?.ticket_prices?.find((t) => t.ticket_type === formData.ticketType);
    const availabilityData = availability.by_tier?.[formData.ticketType] || {};
    const maxAvailable = availabilityData.remaining ?? availabilityData.capacity ?? 10;
    
    setFormData((prev) => ({
      ...prev,
      quantity: Math.max(1, Math.min(maxAvailable, prev.quantity + delta)),
    }));
  };

  // Process booking
  const handleBooking = async () => {
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(`field-${firstErrorField}`);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setBookingLoading(true);
    setBookingError(null);
    setStep("payment");

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (session?.user?.accessToken) {
        headers.Authorization = `Bearer ${session.user.accessToken}`;
      }

      // Step 1: Create ticket
      const ticketResponse = await fetch(`${API_URL}/tickets`, {
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

      if (!ticketResponse.ok) {
        const error = await ticketResponse.json().catch(() => ({}));
        throw new Error(error.error || error.message || "Booking failed");
      }

      const ticketData = await ticketResponse.json();
      setBookingData(ticketData);

      // Step 2: Process payment
      if (formData.paymentMethod === "mpesa") {
        const payResponse = await fetch(`${API_URL}/mpesa/stk-push`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            phone: formData.phone,
            amount: ticketData.price * formData.quantity,
            ticket_id: ticketData.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
          }),
        });

        if (!payResponse.ok) {
          throw new Error("Payment initiation failed. Please try again or contact support.");
        }

        const payData = await payResponse.json();
        setBookingData((prev) => ({
          ...prev,
          stkRequest: payData.request_id,
          stkPhone: payData.phone,
        }));

        // Show success with payment instructions
        setStep("confirmation");
        setBookingSuccess({
          title: "Payment Request Sent!",
          message: `Check your phone ${formData.phone} for the M-Pesa prompt and enter your PIN to complete the payment.`,
        });
      } else {
        // Card payment flow
        // ... implement card payment logic
        setStep("confirmation");
        setBookingSuccess({
          title: "Booking Confirmed!",
          message: "Your booking has been confirmed. Check your email for the ticket details.",
        });
      }
    } catch (err) {
      console.error("Booking error:", err);
      setBookingError(err.message || "Booking failed. Please try again.");
      setStep("details");
    } finally {
      setBookingLoading(false);
    }
  };

  // Check payment status
  const checkPaymentStatus = useCallback(async () => {
    if (!bookingData?.id) return;

    try {
      const headers = session?.user?.accessToken
        ? { Authorization: `Bearer ${session.user.accessToken}` }
        : {};

      const response = await fetch(`${API_URL}/tickets/${bookingData.id}/status`, { headers });
      if (response.ok) {
        const data = await response.json();
        if (data.status === "paid") {
          setBookingSuccess({
            title: "Payment Confirmed! 🎉",
            message: "Your tickets have been confirmed. Check your email for the details.",
          });
        }
      }
    } catch (err) {
      console.error("Status check error:", err);
    }
  }, [bookingData, session]);

  // Poll payment status
  useEffect(() => {
    if (bookingState.step === "confirmation" && bookingData?.id) {
      const interval = setInterval(checkPaymentStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [bookingState.step, bookingData, checkPaymentStatus]);

  // Memoized values
  const selectedTier = useMemo(() => 
    event?.ticket_prices?.find((t) => t.ticket_type === formData.ticketType),
    [event, formData.ticketType]
  );

  const selectedAvailability = useMemo(() => 
    availability.by_tier?.[formData.ticketType] || {},
    [availability, formData.ticketType]
  );

  const availableTickets = useMemo(() => 
    selectedAvailability.remaining ?? selectedAvailability.capacity ?? 0,
    [selectedAvailability]
  );

  const total = useMemo(() => 
    selectedTier ? selectedTier.price * formData.quantity : 0,
    [selectedTier, formData.quantity]
  );

  const isSoldOut = useMemo(() => 
    availableTickets === 0,
    [availableTickets]
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-14 w-14 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white/70 animate-pulse">Loading event details…</p>
        </div>
      </div>
    );
  }

  // Event not found
  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
          <p className="text-gray-400 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push("/event")}
            className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-xl hover:bg-yellow-400 transition-all"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  // Booking confirmation
  if (bookingState.step === "confirmation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 py-12">
        <div className="relative max-w-lg w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl blur-3xl animate-pulse"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center animate-bounce">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{bookingState.success?.title || "Booking Confirmed!"}</h1>
            <p className="text-gray-300 mb-6">{bookingState.success?.message || "Your tickets are confirmed and awaiting payment."}</p>
            
            <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-3 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Event</span>
                <span className="text-white font-medium">{bookingData?.eventName || event.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Ticket Type</span>
                <span className="text-white font-medium">{bookingData?.ticketType || formData.ticketType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Quantity</span>
                <span className="text-white font-medium">{bookingData?.quantity || formData.quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Reference</span>
                <span className="text-white font-mono text-xs">#{bookingData?.id || "PENDING"}</span>
              </div>
              {bookingData?.stkRequest && (
                <div className="flex justify-between text-sm bg-yellow-500/10 p-2 rounded-lg">
                  <span className="text-yellow-400">M-Pesa Request</span>
                  <span className="text-yellow-400 font-mono text-xs">{bookingData.stkRequest}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="text-gray-400">Total</span>
                <span className="text-2xl font-bold text-white">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="space-y-3">
              {bookingData?.stkRequest && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-200">
                  <p>📱 Check your phone for the M-Pesa prompt</p>
                  <p className="text-xs text-yellow-300/70 mt-1">Enter your PIN to complete the payment</p>
                </div>
              )}
              <button
                onClick={() => router.push("/dashboard/user")}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
              >
                View My Tickets
              </button>
              <button
                onClick={() => window.print()}
                className="w-full bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all"
              >
                Print Confirmation
              </button>
              <button
                onClick={() => router.push("/event")}
                className="w-full text-gray-400 hover:text-white transition-colors text-sm"
              >
                Browse More Events →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
        <img
          src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200"}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        
        {/* Action Buttons */}
        <div className="absolute top-6 left-6 right-6 z-20 flex justify-between">
          <button
            onClick={() => router.back()}
            className="bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-black/70 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/70 transition-all"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
            </button>
            <button
              onClick={() => navigator.share?.({ title: event.name, text: event.description, url: window.location.href })}
              className="bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/70 transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Event Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-8 bg-gradient-to-t from-black via-black/70 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1 rounded-full border border-yellow-500/30">
                {availability.total_remaining > 0 ? "Tickets Available" : "Limited Tickets"}
              </span>
              {event.rating && (
                <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {event.rating}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">{event.name}</h1>
            <div className="flex flex-wrap gap-4 text-gray-300 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-400" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-yellow-400" />
                <span>{event.venue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-yellow-400" />
                <span>{availability.total_remaining || 0} tickets left</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">
        {/* Error Alert */}
        {bookingState.error && (
          <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 text-sm">{bookingState.error}</p>
              <button
                onClick={() => setBookingError(null)}
                className="text-red-400/70 hover:text-red-400 text-xs mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">About This Event</h2>
              <p className="text-gray-300 leading-relaxed">{event.description}</p>
              
              {event.organizer && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Organized by</p>
                    <p className="text-white font-medium">{event.organizer}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Ticket Selection */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-yellow-400" />
                Select Ticket Type
              </h2>
              
              {isSoldOut && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  This event is sold out
                </div>
              )}

              <div className="space-y-3">
                {event.ticket_prices?.map((tier) => {
                  const isSelected = formData.ticketType === tier.ticket_type;
                  const tierAvailability = availability.by_tier?.[tier.ticket_type] || {};
                  const available = tierAvailability.remaining ?? tierAvailability.capacity ?? 0;
                  const isTierSoldOut = available === 0;

                  return (
                    <button
                      type="button"
                      key={tier.id || tier.ticket_type}
                      onClick={() => !isTierSoldOut && handleFieldChange("ticketType", tier.ticket_type)}
                      className={`relative w-full text-left group transition-all duration-300 rounded-xl p-4 ${
                        isSelected
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/25"
                          : isTierSoldOut
                          ? "bg-white/5 opacity-50 cursor-not-allowed"
                          : "bg-white/5 hover:bg-white/10 border border-white/10"
                      }`}
                      disabled={isTierSoldOut}
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
                            {formatPrice(tier.price)}
                          </p>
                          {isTierSoldOut && <span className="text-xs text-red-400">Sold Out</span>}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                          Selected
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4">
                <h2 className="text-xl font-bold text-black text-center">Book Your Tickets</h2>
              </div>

              <div className="p-6 space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div id="field-firstName">
                    <label className="block text-sm text-gray-300 mb-1">
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="John"
                        className={`w-full bg-white/5 border ${
                          formErrors.firstName && touchedFields.firstName
                            ? "border-red-400"
                            : "border-white/10 focus:border-yellow-400"
                        } rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none transition-colors`}
                        value={formData.firstName}
                        onChange={(e) => handleFieldChange("firstName", e.target.value)}
                        onBlur={() => setTouchedFields((prev) => ({ ...prev, firstName: true }))}
                      />
                    </div>
                    {formErrors.firstName && touchedFields.firstName && (
                      <p className="text-red-400 text-xs mt-1">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div id="field-lastName">
                    <label className="block text-sm text-gray-300 mb-1">
                      Last Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Doe"
                        className={`w-full bg-white/5 border ${
                          formErrors.lastName && touchedFields.lastName
                            ? "border-red-400"
                            : "border-white/10 focus:border-yellow-400"
                        } rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none transition-colors`}
                        value={formData.lastName}
                        onChange={(e) => handleFieldChange("lastName", e.target.value)}
                        onBlur={() => setTouchedFields((prev) => ({ ...prev, lastName: true }))}
                      />
                    </div>
                    {formErrors.lastName && touchedFields.lastName && (
                      <p className="text-red-400 text-xs mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div id="field-email">
                  <label className="block text-sm text-gray-300 mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className={`w-full bg-white/5 border ${
                        formErrors.email && touchedFields.email
                          ? "border-red-400"
                          : "border-white/10 focus:border-yellow-400"
                      } rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none transition-colors`}
                      value={formData.email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      onBlur={() => setTouchedFields((prev) => ({ ...prev, email: true }))}
                    />
                  </div>
                  {formErrors.email && touchedFields.email && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div id="field-phone">
                  <label className="block text-sm text-gray-300 mb-1">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      placeholder="0712345678"
                      className={`w-full bg-white/5 border ${
                        formErrors.phone && touchedFields.phone
                          ? "border-red-400"
                          : "border-white/10 focus:border-yellow-400"
                      } rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none transition-colors`}
                      value={formData.phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      onBlur={() => setTouchedFields((prev) => ({ ...prev, phone: true }))}
                    />
                  </div>
                  {formErrors.phone && touchedFields.phone && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {/* Quantity */}
                {formData.ticketType && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={formData.quantity <= 1 || isSoldOut}
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold text-white w-12 text-center">{formData.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={formData.quantity >= availableTickets || isSoldOut}
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
                      type="button"
                      onClick={() => handleFieldChange("paymentMethod", "mpesa")}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition ${
                        formData.paymentMethod === "mpesa"
                          ? "bg-yellow-400 text-black"
                          : "bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      M-Pesa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange("paymentMethod", "card")}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition ${
                        formData.paymentMethod === "card"
                          ? "bg-yellow-400 text-black"
                          : "bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Card
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/5 checked:bg-yellow-400 checked:border-yellow-400"
                    checked={formData.terms}
                    onChange={(e) => handleFieldChange("terms", e.target.checked)}
                  />
                  <span className="text-sm text-gray-300">
                    I agree to the <span className="text-yellow-400 hover:underline cursor-pointer">Terms & Conditions</span> and 
                    {" "}<span className="text-yellow-400 hover:underline cursor-pointer">Privacy Policy</span>
                  </span>
                </label>
                {formErrors.terms && (
                  <p className="text-red-400 text-xs">{formErrors.terms}</p>
                )}

                {/* Total and Submit */}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Amount</span>
                    <span className="text-3xl font-bold text-white">{formatPrice(total)}</span>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={bookingState.isLoading || isSoldOut || !formData.ticketType}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {bookingState.isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : isSoldOut ? (
                      "Sold Out"
                    ) : (
                      <>
                        Confirm & Pay
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Shield className="w-3 h-3" />
                    <span>Secure payment encrypted</span>
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