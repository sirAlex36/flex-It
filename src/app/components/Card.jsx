"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EventBookingPage() {
  const params = useParams();
  const eventId = params?.eventId;
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flex-it.onrender.com";

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketPrices, setTicketPrices] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ticketType: "General",
    quantity: 1,
    paymentMethod: "card",
    terms: false,
  });

  useEffect(() => {
    if (!eventId) return;

    fetch(`${API_URL}/events/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        
        // Build ticket prices object from API data
        const prices = {};
        if (data.ticket_prices && Array.isArray(data.ticket_prices)) {
          data.ticket_prices.forEach((tp) => {
            prices[tp.ticket_type] = tp.price;
          });
        }
        setTicketPrices(prices);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [eventId]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const total =
    ticketPrices[formData.ticketType] * Number(formData.quantity);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.terms) return alert("Accept terms first");

    const payload = {
      event_id: event.id,
      ticket_type: formData.ticketType,
      quantity: formData.quantity,
      price: total,
      user_id: 1,
    };

    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      router.push(`/ticket/${data.id}`);
    } catch {
      alert("Booking failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading event...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-8">

        {/* LEFT: EVENT DETAILS */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow overflow-hidden">
          <img
            src={event.image || "https://via.placeholder.com/800x400"}
            className="w-full h-72 object-cover"
          />

          <div className="p-6 space-y-3">
            <h1 className="text-3xl font-bold">{event.name}</h1>

            <p className="text-gray-500">📍 {event.venue}</p>
            <p className="text-gray-400">📅 {event.date}</p>

            <p className="text-gray-700 leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>

        {/* RIGHT: BOOKING PANEL */}
        <div className="bg-white p-6 rounded-2xl shadow sticky top-10 h-fit">
          <h2 className="text-xl font-bold mb-4">Book Tickets</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <input
                id="firstName"
                placeholder="First Name"
                onChange={handleChange}
                className="border p-2 rounded-xl"
                required
              />
              <input
                id="lastName"
                placeholder="Last Name"
                onChange={handleChange}
                className="border p-2 rounded-xl"
                required
              />
            </div>

            <input
              id="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              className="w-full border p-2 rounded-xl"
              required
            />

            <input
              id="phone"
              placeholder="Phone"
              onChange={handleChange}
              className="w-full border p-2 rounded-xl"
              required
            />

            <select
              id="ticketType"
              onChange={handleChange}
              className="w-full border p-2 rounded-xl"
            >
              {Object.entries(ticketPrices).map(([type, price]) => (
                <option key={type} value={type}>
                  {type} - Ksh {price}
                </option>
              ))}
            </select>

            <input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full border p-2 rounded-xl"
            />

            {/* TOTAL */}
            <div className="bg-gray-100 p-3 rounded-xl flex justify-between">
              <span>Total</span>
              <span className="font-bold">Ksh {total}</span>
            </div>

            <select
              id="paymentMethod"
              onChange={handleChange}
              className="w-full border p-2 rounded-xl"
            >
              <option value="mpesa">M-Pesa</option>
            </select>

            <label className="flex gap-2 text-sm">
              <input type="checkbox" id="terms" onChange={handleChange} />
              Accept terms
            </label>

            <button className="w-full bg-black text-white py-3 rounded-xl">
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
