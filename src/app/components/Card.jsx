"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Card() {
  const params = useParams();
  const eventId = params?.eventId;
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ticketType: "",
    quantity: 1,
    paymentMethod: "",
    requests: "",
    terms: false,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

  useEffect(() => {
    if (!eventId) return;

    fetch(`${API_URL}/events/${Number(eventId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Event not found");
        return res.json();
      })
      .then((data) => setEvent(data))
      .catch((error) => console.error("Error fetching event:", error));
  }, [eventId, API_URL]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!event) {
      alert("Event not loaded yet");
      return;
    }

    const ticketPayload = {
      ...formData,
      event_id: event.id,
      user_id: 1, // placeholder: replace with actual user ID from auth
      ticket_type: formData.ticketType || "General",
      price: 0,
    };

    try {
      const response = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketPayload),
      });

      if (!response.ok) throw new Error("Failed to submit form");

      alert("Ticket order submitted successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        ticketType: "",
        quantity: 1,
        paymentMethod: "",
        requests: "",
        terms: false,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (!event) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <h4 className="text-xl">Loading event details...</h4>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src={(event.image && event.image.trim()) ? event.image : "https://via.placeholder.com/600x400"}
                alt={event.name}
                className="w-full h-80 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3">{event.name}</h3>
                <p className="text-gray-500 mb-1">{event.date}</p>
                <p className="text-gray-600 mb-4">📍 {event.venue}</p>
                <p className="text-gray-700 mb-4">{event.description}</p>
                <button
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  Back to Events
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h4 className="text-xl font-bold mb-4">Book Your Ticket</h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">First Name</label>
                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Ticket Type</label>
                    <select
                      id="ticketType"
                      value={formData.ticketType}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">Select type</option>
                      <option value="General">General Admission</option>
                      <option value="VIP">VIP</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Quantity</label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Payment Method</label>
                  <select
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Special Requests</label>
                  <textarea
                    id="requests"
                    value={formData.requests}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    rows="3"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={formData.terms}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="terms" className="text-sm">I agree to terms and conditions</label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Book Ticket
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
