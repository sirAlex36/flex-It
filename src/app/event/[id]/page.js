"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const API_URL = "http://localhost:5000";

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetch(`${API_URL}/events/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        if (data.ticket_prices?.length > 0) setSelectedTicketType(data.ticket_prices[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-lg text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Event not found</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-black text-white rounded-lg hover:opacity-90 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const calculateTotal = () => (selectedTicketType ? selectedTicketType.price * quantity : 0);

  const handleProceedToBooking = () => {
    if (!selectedTicketType) return;
    sessionStorage.setItem(
      "bookingData",
      JSON.stringify({
        eventId: event.id,
        eventName: event.name,
        eventDate: event.date,
        eventVenue: event.venue,
        ticketTypeId: selectedTicketType.id,
        ticketType: selectedTicketType.ticket_type,
        pricePerTicket: selectedTicketType.price,
        quantity,
        totalAmount: calculateTotal(),
      })
    );
    setBookingInProgress(true);
    setTimeout(() => router.push(`/booking/${event.id}`), 300);
  };

  const getTicketBenefits = (type) => ({
    General: ["Standard access", "Certificate of attendance"],
    VIP: ["Priority entry", "VIP lounge", "Premium seating", "Refreshments", "Certificate"],
    Premium: ["Early bird entry", "VIP lounge", "Best seats", "Meals & drinks", "Merch pack", "Priority support"],
  }[type] || []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top Hero Section */}
      <div className="relative w-full h-64 sm:h-80 md:h-96">
        <img
          src={event.image || "https://via.placeholder.com/1400x500"}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 sm:p-6 md:p-10">
          <button onClick={() => router.back()} className="text-white mb-2 hover:opacity-80 transition">
            ← Back
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{event.name}</h1>
          <p className="text-white/80 text-sm sm:text-base mt-1">{event.venue} | {event.date}</p>
          <p className="text-green-400 font-semibold mt-2 text-sm sm:text-base">
            From Ksh {Math.min(...event.ticket_prices.map(tp => tp.price)).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Three-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Event Info */}
        <div className="space-y-4 lg:col-span-1">
          <h2 className="text-xl font-semibold">Event Details</h2>
          <p className="text-gray-700 text-sm sm:text-base">{event.description || "No description provided."}</p>
          <div className="mt-4 bg-white p-4 rounded-lg shadow-sm space-y-2">
            <p className="text-gray-600 text-sm"><strong>Venue:</strong> {event.venue}</p>
            <p className="text-gray-600 text-sm"><strong>Date:</strong> {event.date}</p>
          </div>
        </div>

        {/* Center Column: Tickets */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Select Your Ticket</h2>
          {event.ticket_prices.map((ticket, idx) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicketType(ticket)}
              className={`relative cursor-pointer p-4 rounded-lg border transition-shadow duration-200 hover:shadow-lg ${
                selectedTicketType?.id === ticket.id
                  ? "border-black bg-black text-white shadow-xl"
                  : "border-gray-200 bg-white text-gray-900"
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">{ticket.ticket_type}</p>
                <p className="font-bold text-green-600">Ksh {ticket.price.toLocaleString()}</p>
              </div>
              <ul className="mt-2 text-xs sm:text-sm space-y-1">
                {getTicketBenefits(ticket.ticket_type).map((b, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span className="text-green-500">✓</span> {b}
                  </li>
                ))}
              </ul>
              {idx === 1 && (
                <span className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs font-semibold">
                  Most Popular
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Right Column: Booking Form */}
        <div className="lg:col-span-1 sticky top-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-4">
            <h3 className="font-bold text-lg sm:text-xl">Booking Summary</h3>
            {selectedTicketType ? (
              <>
                <p className="text-sm text-gray-500">
                  Ticket: <span className="font-semibold">{selectedTicketType.ticket_type}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Price: <span className="font-semibold">Ksh {selectedTicketType.price.toLocaleString()}</span>
                </p>
                <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2 mt-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 bg-white rounded-lg border hover:bg-gray-50 text-lg font-semibold"
                  >−</button>
                  <span className="font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 bg-white rounded-lg border hover:bg-gray-50 text-lg font-semibold"
                  >+</button>
                </div>
                <div className="flex justify-between font-semibold mt-2">
                  <span>Total</span>
                  <span>Ksh {calculateTotal().toLocaleString()}</span>
                </div>
                <button
                  onClick={handleProceedToBooking}
                  disabled={bookingInProgress}
                  className={`w-full py-2 mt-3 rounded-lg font-bold text-white transition ${
                    bookingInProgress ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:opacity-90"
                  }`}
                >
                  {bookingInProgress ? "Processing..." : "Proceed →"}
                </button>
              </>
            ) : (
              <p className="text-center text-gray-500 py-4 text-sm">Select a ticket type to continue</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}