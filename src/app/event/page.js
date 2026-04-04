"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UpcomingEvents() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/events`);
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [API_URL]);

  return (
    <main className="min-h-screen bg-black text-white">

      {/* 🔥 HERO SECTION */}
      <section className="px-6 pt-16 pb-12 max-w-7xl mx-auto">
        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
          Discover <span className="text-yellow-400">Experiences</span>
        </h1>
        <p className="text-gray-400 mt-4 text-lg max-w-xl">
          Find events that match your vibe. Book instantly. Live the moment.
        </p>
      </section>

      {/* 🔄 LOADING */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 max-w-7xl mx-auto pb-16">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-80 bg-gray-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* 🎯 EVENTS GRID */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-6 max-w-7xl mx-auto pb-20">
          {events.map((event) => {
            const minPrice =
              event.ticket_prices?.length > 0
                ? Math.min(...event.ticket_prices.map((tp) => tp.price))
                : null;

            return (
              <div
                key={event.id}
                className="group relative rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => router.push(`/event/${event.id}`)}
              >
                {/* IMAGE */}
                <img
                  src={event.image || "https://via.placeholder.com/400x250"}
                  alt={event.name}
                  className="w-full h-[350px] object-cover group-hover:scale-110 transition duration-700"
                />

                {/* DARK OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                {/* CONTENT */}
                <div className="absolute bottom-0 p-6 w-full">
                  <h3 className="text-2xl font-bold">
                    {event.name}
                  </h3>

                  <p className="text-gray-300 text-sm mt-1">
                    📍 {event.venue}
                  </p>

                  <p className="text-gray-400 text-sm">
                    📅 {event.date}
                  </p>

                  {/* PRICE + CTA */}
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-yellow-400 font-semibold text-lg">
                      {minPrice
                        ? `Ksh ${minPrice.toLocaleString()}`
                        : "Free"}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/event/${event.id}`);
                      }}
                      className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-yellow-300 transition"
                    >
                      Book Now
                    </button>
                  </div>
                </div>

                {/* POPULAR TAG */}
                {event.is_popular && (
                  <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 text-xs font-bold rounded-full shadow">
                    🔥 Popular
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}