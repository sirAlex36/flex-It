"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TicketDetails() {
  const params = useParams();
  const ticketId = params?.id;
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flex-it.onrender.com";

  useEffect(() => {
    if (!ticketId) return;

    // Fetch ticket details
    fetch(`${API_URL}/tickets/${ticketId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ticket not found");
        return res.json();
      })
      .then((ticketData) => {
        setTicket(ticketData);
        // Fetch event details using event_id from ticket
        return fetch(`${API_URL}/events/${ticketData.event_id}`);
      })
      .then((res) => res.json())
      .then((eventData) => {
        setEvent(eventData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [ticketId, API_URL]);

  const handlePayment = () => {
    // Simulate payment
    alert("Payment successful! Ticket confirmed.");
    router.push("/");
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <h4 className="text-xl">Loading ticket details...</h4>
        </div>
        <Footer />
      </>
    );
  }

  if (!ticket || !event) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <h4 className="text-xl">Ticket not found</h4>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Ticket Details</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Event Information</h2>
                <div className="space-y-2">
                  <p><strong>Event:</strong> {event.name}</p>
                  <p><strong>Venue:</strong> {event.venue}</p>
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Description:</strong> {event.description}</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">Ticket Information</h2>
                <div className="space-y-2">
                  <p><strong>Ticket ID:</strong> {ticket.id}</p>
                  <p><strong>Type:</strong> {ticket.ticket_type}</p>
                  <p><strong>Quantity:</strong> {ticket.quantity}</p>
                  <p><strong>Price per ticket:</strong> Ksh {ticket.price / ticket.quantity}</p>
                  <p><strong>Total Price:</strong> Ksh {ticket.price}</p>
                  <p><strong>Booking Date:</strong> {new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handlePayment}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition"
              >
                Proceed to Pay - Ksh {ticket.price}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}