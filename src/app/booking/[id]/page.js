"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flex-it.onrender.com";

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    paymentMethod: "card",
    terms: false,
  });

  useEffect(() => {
    // Retrieve booking data from sessionStorage
    const stored = sessionStorage.getItem("bookingData");
    if (stored) {
      try {
        setBookingData(JSON.parse(stored));
        setLoading(false);
      } catch {
        setError("Invalid booking data");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    const { firstName, lastName, email, phone, terms } = formData;

    if (!firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Valid email is required");
      return false;
    }
    if (!phone.trim() || phone.length < 7) {
      setError("Valid phone number is required");
      return false;
    }
    if (!terms) {
      setError("You must accept the terms and conditions");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || !bookingData) return;

    // Ensure user is authenticated
    if (!session?.user?.id) {
      setError("You must be logged in to complete a booking");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Step 1: Get JWT token from session
      const token = session?.user?.token;
      if (!token) {
        throw new Error("Authentication token not available");
      }

      // Step 2: Create ticket
      const ticketPayload = {
        event_id: bookingData.eventId,
        ticket_type: bookingData.ticketType,
        quantity: bookingData.quantity,
        price: bookingData.totalAmount,
        user_id: session.user.id,
      };

      const ticketRes = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(ticketPayload),
      });

      if (!ticketRes.ok) {
        const errorData = await ticketRes.json();
        throw new Error(errorData.message || "Booking failed");
      }

      const ticketData = await ticketRes.json();
      const ticketId = ticketData.id;

      // Step 3: If M-Pesa, initiate STK push
      if (formData.paymentMethod === "mpesa") {
        try {
          const stkPayload = {
            phone: formData.phone.replace(/\D/g, ""), // Remove non-digits
            amount: bookingData.totalAmount,
            ticket_id: ticketId,
          };

          const stkRes = await fetch(`${API_URL}/mpesa/stk-push`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(stkPayload),
          });

          if (!stkRes.ok) {
            const errorData = await stkRes.json();
            throw new Error(errorData.message || "Failed to initiate payment");
          }

          const stkData = await stkRes.json();

          // Store payment data for confirmation page
          sessionStorage.setItem(
            "paymentPending",
            JSON.stringify({
              ticketId: ticketId,
              requestId: stkData.request_id,
              amount: bookingData.totalAmount,
              phone: formData.phone,
              status: "awaiting_payment",
            })
          );
        } catch (stkError) {
          // STK push failed, but ticket was created
          setError(`Ticket created but payment failed: ${stkError.message}`);
          setSubmitting(false);
          return;
        }
      }

      // Store confirmation data
      sessionStorage.setItem(
        "bookingConfirmation",
        JSON.stringify({
          ticketId: ticketId,
          userName: `${formData.firstName} ${formData.lastName}`,
          userEmail: formData.email,
          userPhone: formData.phone,
          paymentMethod: formData.paymentMethod,
          status: formData.paymentMethod === "mpesa" ? "awaiting_payment" : "pending",
          ...bookingData,
        })
      );

      // Clear booking data
      sessionStorage.removeItem("bookingData");

      // Redirect to confirmation/payment page
      router.push(`/booking-confirmation/${ticketId}`);
    } catch (err) {
      setError(err.message || "Booking failed. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading booking form...</p>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md">
          <p className="text-lg text-gray-600 mb-4">No booking data found</p>
          <p className="text-gray-500 mb-6">
            Please select tickets from an event first
          </p>
          <button
            onClick={() => router.push("/event")}
            className="px-6 py-3 bg-black text-white rounded-xl hover:opacity-90 transition"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition mb-6"
          >
            <span className="text-xl">←</span>
            <span>Back</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Complete Your Booking
          </h1>
          <p className="text-gray-500 mt-2">
            Enter your details to finalize your ticket purchase
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Details
                </h2>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {/* Name Fields */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+254 123 456 789"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label
                    htmlFor="paymentMethod"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Payment Method *
                  </label>
                  <select
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition bg-white"
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                  {formData.paymentMethod === "mpesa" && (
                    <p className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                      💬 You'll receive an M-Pesa prompt on your phone to enter your PIN and complete payment.
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={formData.terms}
                      onChange={handleChange}
                      className="w-5 h-5 border border-gray-300 rounded mt-0.5 focus:ring-2 focus:ring-black accent-black"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the terms and conditions and understand that
                      all ticket purchases are non-refundable. *
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                    submitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-black hover:opacity-90 active:scale-95"
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {formData.paymentMethod === "mpesa"
                        ? "Initiating M-Pesa..."
                        : "Processing..."}
                    </>
                  ) : (
                    <>
                      Confirm & Pay
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Booking Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 sticky top-6 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Order Summary
              </h3>

              {/* Event Info */}
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Event</p>
                  <p className="font-semibold text-gray-900">
                    {bookingData.eventName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold text-gray-900">
                    {bookingData.eventDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Venue</p>
                  <p className="font-semibold text-gray-900">
                    {bookingData.eventVenue}
                  </p>
                </div>
              </div>

              {/* Ticket Info */}
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Ticket Type</p>
                  <p className="font-semibold text-gray-900">
                    {bookingData.ticketType}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Quantity</p>
                  <p className="font-semibold text-gray-900">
                    {bookingData.quantity}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Ksh {bookingData.pricePerTicket.toLocaleString()} × {bookingData.quantity}
                  </span>
                  <span>
                    Ksh{" "}
                    {(bookingData.pricePerTicket * bookingData.quantity).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    Ksh {bookingData.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 rounded-xl text-sm text-gray-700 space-y-2">
                <p className="font-semibold text-gray-900">Important:</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ Confirmation will be sent to your email</li>
                  <li>✓ Your tickets are digital and will be emailed</li>
                  <li>✓ Non-refundable after purchase</li>
                  <li>✓ Arrive 30 minutes before event</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
