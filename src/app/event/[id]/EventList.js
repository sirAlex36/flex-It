// /src/app/event/EventList.js
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Calendar, MapPin, Search, Sparkles, ArrowRight, Ticket, Users } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flex-it.onrender.com";

const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return date;
  }
};

export default function EventList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || "");
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const url = searchTerm 
          ? `${API_URL}/events?search=${encodeURIComponent(searchTerm)}`
          : `${API_URL}/events`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchTerm]);

  // Auto-rotate featured events
  useEffect(() => {
    if (events.length === 0) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % Math.min(events.length, 5));
    }, 5000);
    return () => clearInterval(interval);
  }, [events.length]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const params = new URLSearchParams(window.location.search);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    router.push(`/event?${params.toString()}`);
  };

  const featuredEvents = events.slice(0, 5);
  const regularEvents = events.slice(5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-14 w-14 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white/70">Loading amazing events…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-yellow-500/20">
            <Sparkles className="w-4 h-4" />
            Discover Amazing Events
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Events</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Find and book tickets for the best events in your area. From concerts to conferences, we've got you covered.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1 flex items-center focus-within:border-yellow-400/50 transition-all duration-300">
              <Search className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search events by name, venue, or date..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch("")}
                  className="mr-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Featured Events Carousel */}
        {featuredEvents.length > 0 && !searchTerm && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Featured Events
            </h2>
            <div className="relative overflow-hidden rounded-3xl">
              <div 
                className="transition-transform duration-1000 ease-in-out flex"
                style={{ transform: `translateX(-${featuredIndex * 100}%)` }}
              >
                {featuredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="min-w-full cursor-pointer group"
                    onClick={() => router.push(`/event/${event.id}`)}
                  >
                    <div className="relative h-[400px] rounded-3xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
                      <img 
                        src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200"} 
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                        <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.date)}
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                          {event.name}
                        </h3>
                        <div className="flex items-center gap-4 text-gray-300">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.venue}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.ticket_prices?.length || 0} ticket tiers
                          </span>
                        </div>
                        <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-full font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          View Event
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carousel Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {featuredEvents.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setFeaturedIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === featuredIndex 
                        ? "w-8 bg-yellow-400" 
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => setFeaturedIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/70 transition-all disabled:opacity-50"
                disabled={featuredEvents.length <= 1}
              >
                ←
              </button>
              <button
                onClick={() => setFeaturedIndex((prev) => (prev + 1) % featuredEvents.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/70 transition-all disabled:opacity-50"
                disabled={featuredEvents.length <= 1}
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* All Events Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-yellow-400" />
            {searchTerm ? `Results for "${searchTerm}"` : "All Events"}
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({regularEvents.length + featuredEvents.length} events)
            </span>
          </h2>

          {events.length === 0 ? (
            <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10">
              <div className="text-6xl mb-4">🎭</div>
              <p className="text-gray-400 text-lg">No events found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or check back later</p>
              <button
                onClick={() => handleSearch("")}
                className="mt-6 px-6 py-3 bg-yellow-500 text-black font-semibold rounded-full hover:bg-yellow-400 transition-all"
              >
                View all events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => router.push(`/event/${event.id}`)}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-500/10"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600"} 
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                      {formatDate(event.date)}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors mb-2">
                      {event.name}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-yellow-400" />
                        {event.venue}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-yellow-400" />
                        {formatDate(event.date)}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-yellow-400 font-semibold">
                        From Ksh {event.ticket_prices?.[0]?.price?.toLocaleString() || 0}
                      </span>
                      <span className="text-xs text-gray-500">
                        {event.ticket_prices?.length || 0} tiers
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {Math.floor(Math.random() * 50) + 10} tickets left
                      </span>
                      <button className="text-yellow-400 font-medium text-sm hover:text-yellow-300 transition-colors">
                        Book Now →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {events.length > 0 && (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-bold text-white">{events.length}</p>
              <p className="text-sm text-gray-400">Total Events</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-bold text-yellow-400">🎟️</p>
              <p className="text-sm text-gray-400">Book Now</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-bold text-green-400">✅</p>
              <p className="text-sm text-gray-400">Instant Confirmation</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-bold text-purple-400">🔒</p>
              <p className="text-sm text-gray-400">Secure Payments</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}