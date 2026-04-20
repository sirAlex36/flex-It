"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchFilter from "@/components/SearchFilter";

export default function UpcomingEvents() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(searchParams);
      const url = `${API_URL}/events${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
      setFilteredEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchParams, API_URL]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* HERO SECTION */}
      <section className="px-6 pt-16 pb-8 max-w-7xl mx-auto">
        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight text-gray-900">
          Discover <span className="text-blue-600">Experiences</span>
        </h1>
        <p className="text-gray-600 mt-4 text-lg max-w-xl">
          Find events that match your vibe. Book instantly. Live the moment.
        </p>
      </section>

      {/* SEARCH AND FILTERS */}
      <div className="max-w-7xl mx-auto px-6">
        <SearchFilter onFiltersChange={fetchEvents} />
      </div>

      {/* EVENTS GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-gray-300 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const minPrice =
                event.ticket_prices?.length > 0
                  ? Math.min(...event.ticket_prices.map((tp) => tp.price))
                  : null;

              return (
                <div
                  key={event.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() => router.push(`/event/${event.id}`)}
                >
                  {/* IMAGE */}
                  <div className="relative h-64 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
                    <img
                      src={event.image || "https://via.placeholder.com/400x250"}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />
                  </div>

                  {/* CONTENT */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {event.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-1">
                      📍 {event.venue}
                    </p>

                    <p className="text-gray-500 text-sm mb-4">
                      📅 {new Date(event.date).toLocaleDateString()}
                    </p>

                    {event.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* PRICE + CTA */}
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-bold text-lg">
                        {minPrice
                          ? `Ksh ${minPrice.toLocaleString()}`
                          : "Free"}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/event/${event.id}`);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No events found matching your criteria</p>
            <button
              onClick={() => router.push("/event")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}