"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UpcomingEvents() {
  const router = useRouter();
  const API_URL = "http://localhost:5000";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-12 text-gray-900">
          Explore Events
        </h1>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 bg-gray-200 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-3xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden relative"
              >
                {/* Optional Ribbon */}
                {event.is_popular && (
                  <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-semibold z-10">
                    Popular
                  </div>
                )}

                {/* Event Image */}
                <div className="overflow-hidden rounded-t-3xl">
                  <img
                    src={event.image || "https://via.placeholder.com/400x250"}
                    alt={event.name}
                    className="w-full h-56 object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>

                {/* Event Info */}
                <div className="p-6 space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {event.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    📍 {event.venue}
                  </p>
                  <p className="text-gray-400 text-sm">
                    📅 {event.date}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {event.description || "No description available."}
                  </p>

                  {/* Price & CTA */}
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-lg text-green-600">
                      From Ksh{" "}
                      {event.ticket_prices && event.ticket_prices.length > 0
                        ? Math.min(...event.ticket_prices.map((tp) => tp.price)).toLocaleString()
                        : "N/A"}
                    </span>

                    <button
                      onClick={() => router.push(`/event/${event.id}`)}
                      className="bg-black text-white px-4 py-2 rounded-xl text-sm hover:opacity-90 shadow hover:shadow-lg transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}