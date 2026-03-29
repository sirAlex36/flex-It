"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);

  // FETCH EVENTS
  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setFiltered(data);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, [API_URL]);

  // SEARCH FILTER
  useEffect(() => {
    const results = events.filter(
      (event) =>
        event.name.toLowerCase().includes(search.toLowerCase()) ||
        event.venue.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results);
  }, [search, events]);

  // VERIFY TICKET (REAL READY)
  const handleVerifyTicket = async () => {
    if (!ticketCode.trim()) {
      setVerificationResult({
        success: false,
        message: "Please enter a ticket code",
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/verify-ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: ticketCode }),
      });

      const data = await res.json();
      setVerificationResult(data);
    } catch (error) {
      setVerificationResult({
        success: false,
        message: "Verification failed. Try again.",
      });
    }
  };

  return (
    <>
      <Header />

      <main className="bg-white">

        {/* HERO */}
        <section className="relative h-[440px] overflow-hidden rounded-3xl mx-4 md:mx-8 lg:mx-16 mt-8 shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1541701494587-cb58502866ab"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Discover events in your city
            </h1>

            <input
              type="text"
              placeholder="Search events, venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-xl px-6 py-4 rounded-full text-lg shadow-xl focus:outline-none"
            />
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="py-10 border-b">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4">

            <Link href="/event" className="text-center hover:bg-gray-50 p-4 rounded-lg">
              🎪
              <p className="text-sm mt-2">Browse Events</p>
            </Link>

            <Link href="/contact" className="text-center hover:bg-gray-50 p-4 rounded-lg">
              🎯
              <p className="text-sm mt-2">Host Events</p>
            </Link>

            <button
              onClick={() => setShowVerifyModal(true)}
              className="text-center hover:bg-gray-50 p-4 rounded-lg"
            >
              🎫
              <p className="text-sm mt-2">Verify Ticket</p>
            </button>

            <Link href="/vendors" className="text-center hover:bg-gray-50 p-4 rounded-lg">
              🏪
              <p className="text-sm mt-2">Marketplace</p>
            </Link>

          </div>
        </section>

        {/* EVENTS */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">

            <h2 className="text-3xl font-bold text-center mb-10">
              Featured Events
            </h2>

            {filtered.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No events found. Try a different search.
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {filtered.slice(0, 6).map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <img
                      src={
                        event.image ||
                        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
                      }
                      className="h-44 w-full object-cover"
                    />

                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">
                          {event.name}
                        </h3>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Trending
                        </span>
                      </div>

                      <p className="text-gray-500 text-sm mt-1">
                        📍 {event.venue}
                      </p>

                      <p className="text-gray-500 text-sm">
                        📅 {event.date}
                      </p>

                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {event.description ||
                          "Experience something amazing"}
                      </p>

                      <div className="flex justify-between items-center mt-4">
                        <span className="font-bold text-blue-600">
                          ksh {event.price || 1000}
                        </span>

                        <Link href={`/event/${event.id}`}>
                          <button className="bg-black text-white px-4 py-2 rounded-lg text-sm">
                            View
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-10">
              <Link href="/event">
                <button className="bg-black text-white px-6 py-3 rounded-lg">
                  View All Events
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-black text-white py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to explore events?
          </h2>

          <Link href="/sign-up">
            <button className="bg-white text-black px-6 py-3 rounded-lg font-bold">
              Get Started
            </button>
          </Link>
        </section>

      </main>

      <Footer />

      {/* VERIFY MODAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">

            <h3 className="text-xl font-bold mb-4">Verify Ticket</h3>

            <input
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value)}
              placeholder="Enter ticket code"
              className="w-full border p-2 rounded mb-4"
            />

            {verificationResult && (
              <div
                className={`p-2 mb-3 rounded ${
                  verificationResult.success
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {verificationResult.message}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleVerifyTicket}
                className="flex-1 bg-blue-600 text-white py-2 rounded"
              >
                Verify
              </button>

              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setTicketCode("");
                  setVerificationResult(null);
                }}
                className="flex-1 bg-gray-300 py-2 rounded"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}