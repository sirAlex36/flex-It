"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setFiltered(data);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, [API_URL]);

  useEffect(() => {
    const results = events.filter(
      (event) =>
        event.name.toLowerCase().includes(search.toLowerCase()) ||
        event.venue.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results);
  }, [search, events]);

  const handleVerifyTicket = () => {
    if (!ticketCode.trim()) {
      setVerificationResult({ success: false, message: "Please enter a ticket code" });
      return;
    }

    // For now, simulate verification. Replace with actual API call
    // This is a dummy check - in real app, verify against backend
    const isValid = ticketCode.length >= 6; // Simple validation

    if (isValid) {
      setVerificationResult({ success: true, message: "Ticket verified successfully!" });
    } else {
      setVerificationResult({ success: false, message: "Invalid ticket code" });
    }
  };

  return (
    <>
      <Header />
      <main className="bg-white">

        {/* CLEAN HERO - Search Focused */}
        <section className="relative h-[440px] overflow-hidden rounded-3xl mx-4 md:mx-8 lg:mx-16 mt-8 shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80"
            alt="Event crowd and stage"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45"></div>
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">Discover local events instantly</h1>
            <div className="w-full max-w-2xl">
              <input
                type="text"
                placeholder="Search events, venues, artists..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-6 py-4 rounded-full text-gray-900 text-lg font-medium shadow-2xl placeholder-gray-500 border border-white/30 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* QUICK FEATURES BAR */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Link href="/event" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl">🎪</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Browse Events</span>
              </Link>

              <Link href="/contact" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl">🎯</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Host Events</span>
              </Link>

              <button
                onClick={() => setShowVerifyModal(true)}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl">🎫</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Verify Tickets</span>
              </button>

              <Link href="/vendors" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl">🏪</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Marketplace</span>
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURED EVENTS - Compact */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">Featured Events</h2>
              <p className="text-gray-600">Trending events near you</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {filtered.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <img
                    src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"}
                    alt={event.name}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{event.name}</h3>
                    <p className="text-gray-500 text-sm mb-1">📍 {event.venue}</p>
                    <p className="text-gray-500 text-sm mb-3">📅 {event.date}</p>
                    <Link href={`/event/${event.id}`}>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-700 transition text-sm font-semibold">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/event">
                <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
                  View All Events
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* SIMPLE CTA */}
        <section className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                  Sign Up Free
                </button>
              </Link>
              <Link href="/contact">
                <button className="bg-transparent text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition border-2 border-white">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />

      {/* Verify Ticket Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Verify Ticket</h3>
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setTicketCode("");
                  setVerificationResult(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Ticket Code
              </label>
              <input
                type="text"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                placeholder="e.g., ABC123456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {verificationResult && (
              <div className={`mb-4 p-3 rounded-lg ${
                verificationResult.success
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {verificationResult.message}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleVerifyTicket}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Verify
              </button>
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setTicketCode("");
                  setVerificationResult(null);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition font-medium"
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