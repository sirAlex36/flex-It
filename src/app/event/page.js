"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function UpcomingEvents() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // ✅ FIXED: booking form state (this was missing)
  const [bookingForm, setBookingForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ticketType: "General",
    quantity: 1,
    paymentMethod: "card",
    requests: "",
    terms: false,
  });

  const ticketPrices = {
    General: 1000,
    VIP: 3000,
    Premium: 5000,
  };

  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });
  }, [API_URL]);

  const handleBooking = (event) => {
    setSelectedEvent(event);
    setShowBookingModal(true);
  };

  // ✅ SAFE HANDLER (no event bugs)
  const handleFormChange = (name, value, type = "text", checked = false) => {
    setBookingForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEvent) {
      alert("No event selected.");
      return;
    }

    if (!bookingForm.terms) {
      alert("Please accept terms.");
      return;
    }

    const totalPrice =
      ticketPrices[bookingForm.ticketType] *
      Number(bookingForm.quantity);

    const ticketData = {
      ticket_type: bookingForm.ticketType,
      price: totalPrice,
      event_id: selectedEvent.id,
      user_id: 1, // replace with auth later
    };

    try {
      const response = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) throw new Error("Booking failed");

      const result = await response.json();

      alert(`Booking successful! Ticket ID: ${result.id}`);

      setShowBookingModal(false);

      router.push(`/ticket/${result.id}`);

      // reset form
      setBookingForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        ticketType: "General",
        quantity: 1,
        paymentMethod: "card",
        requests: "",
        terms: false,
      });

    } catch (error) {
      console.error(error);
      alert("Error booking ticket");
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold mb-4">Upcoming Events</h1>

          {loading ? (
            <p>Loading...</p>
          ) : events.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold text-lg">{event.name}</h3>
                  <p>{event.venue}</p>
                  <p>{event.date}</p>

                  <button
                    onClick={() => handleBooking(event)}
                    className="bg-blue-600 text-white px-4 py-2 mt-2 rounded"
                  >
                    Buy Ticket
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No events found</p>
          )}
        </div>
      </main>

      <Footer />

      {/* ✅ MODAL */}
      {showBookingModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {selectedEvent.name}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-3">

              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={bookingForm.firstName}
                onChange={(e) =>
                  handleFormChange(e.target.name, e.target.value)
                }
                className="w-full border p-2"
                required
              />

              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={bookingForm.lastName}
                onChange={(e) =>
                  handleFormChange(e.target.name, e.target.value)
                }
                className="w-full border p-2"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={bookingForm.email}
                onChange={(e) =>
                  handleFormChange(e.target.name, e.target.value)
                }
                className="w-full border p-2"
                required
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={bookingForm.phone}
                onChange={(e) =>
                  handleFormChange(e.target.name, e.target.value)
                }
                className="w-full border p-2"
                required
              />

              <select
                name="ticketType"
                value={bookingForm.ticketType}
                onChange={(e) =>
                  handleFormChange(e.target.name, e.target.value)
                }
                className="w-full border p-2"
              >
                <option value="General">
                  General - Ksh {ticketPrices.General}
                </option>
                <option value="VIP">
                  VIP - Ksh {ticketPrices.VIP}
                </option>
                <option value="Premium">
                  Premium - Ksh {ticketPrices.Premium}
                </option>
              </select>

              <input
                type="number"
                name="quantity"
                value={bookingForm.quantity}
                onChange={(e) =>
                  handleFormChange(e.target.name, e.target.value)
                }
                className="w-full border p-2"
                min="1"
              />

              <div className="bg-gray-100 p-3 rounded">
                <p className="font-bold">
                  Total: Ksh{" "}
                  {ticketPrices[bookingForm.ticketType] *
                    Number(bookingForm.quantity)}
                </p>
              </div>

              <textarea
                name="requests"
                placeholder="Special requests"
                value={bookingForm.requests}
                onChange={(e) =>
                  handleFormChange(e.target.name, e.target.value)
                }
                className="w-full border p-2"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="terms"
                  checked={bookingForm.terms}
                  onChange={(e) =>
                    handleFormChange(
                      e.target.name,
                      e.target.value,
                      "checkbox",
                      e.target.checked
                    )
                  }
                />
                Accept Terms
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="bg-gray-400 px-4 py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Confirm
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}