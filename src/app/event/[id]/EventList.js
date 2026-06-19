// /src/app/event/EventList.js
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Search,
  Sparkles,
  ArrowRight,
  Ticket,
  Users,
  X,
  Star,
  Clock,
  Filter,
} from "lucide-react";

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

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(price);
};

// Skeleton Loader
const EventSkeleton = () => (
  <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5 animate-pulse">
    <div className="h-48 bg-white/5"></div>
    <div className="p-5 space-y-3">
      <div className="h-6 bg-white/10 rounded w-3/4"></div>
      <div className="h-4 bg-white/10 rounded w-1/2"></div>
      <div className="h-4 bg-white/10 rounded w-2/3"></div>
      <div className="flex justify-between pt-3 border-t border-white/10">
        <div className="h-6 bg-white/10 rounded w-1/3"></div>
        <div className="h-6 bg-white/10 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <div className="h-8 w-48 bg-white/10 rounded animate-pulse mx-auto"></div>
            <div className="h-12 w-96 bg-white/10 rounded animate-pulse mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <EventSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-yellow-500/20">
            <Sparkles className="w-4 h-4" />
            Discover Amazing Events
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Events</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Find and book tickets for the best events in your area
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-10"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1 flex items-center focus-within:border-yellow-400/50 transition-all duration-300">
              <Search className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search events by name, venue, or date..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm md:text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch("")}
                  className="mr-2 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Featured Events Carousel */}
        {featuredEvents.length > 0 && !searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Featured Events
            </h2>
            <div className="relative overflow-hidden rounded-2xl">
              <div 
                className="transition-transform duration-700 ease-in-out flex"
                style={{ transform: `translateX(-${featuredIndex * 100}%)` }}
              >
                {featuredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="min-w-full cursor-pointer group"
                    onClick={() => router.push(`/event/${event.id}`)}
                  >
                    <div className="relative h-[280px] md:h-[340px] rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
                      <img 
                        src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200"} 
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
                        <div className="flex items-center gap-2 text-yellow-400 text-xs md:text-sm font-medium mb-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.date)}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">
                          {event.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-gray-300 text-sm">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.venue}
                          </span>
                          <span className="flex items-center gap-1">
                            <Ticket className="w-4 h-4" />
                            {event.ticket_prices?.length || 0} tiers
                          </span>
                        </div>
                        <div className="mt-3 inline-flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-full font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          View Event
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carousel Dots */}
              {featuredEvents.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                  {featuredEvents.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setFeaturedIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === featuredIndex 
                          ? "w-6 bg-yellow-400" 
                          : "w-1.5 bg-white/40 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Navigation Arrows */}
              {featuredEvents.length > 1 && (
                <>
                  <button
                    onClick={() => setFeaturedIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/70 transition-all"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setFeaturedIndex((prev) => (prev + 1) % featuredEvents.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/70 transition-all"
                  >
                    →
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* All Events Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-yellow-400" />
              {searchTerm ? `Results for "${searchTerm}"` : "All Events"}
            </h2>
            <span className="text-sm text-gray-400">
              {events.length} {events.length === 1 ? "event" : "events"}
            </span>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-5xl mb-4">🎭</div>
              <p className="text-gray-400 text-lg">No events found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your search</p>
              {searchTerm && (
                <button
                  onClick={() => handleSearch("")}
                  className="mt-4 px-6 py-2.5 bg-yellow-500 text-black font-semibold rounded-xl hover:bg-yellow-400 transition-all text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {regularEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push(`/event/${event.id}`)}
                  className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:border-yellow-500/30"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600"} 
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                      {formatDate(event.date)}
                    </div>
                    {event.ticket_prices?.[0]?.price < 500 && (
                      <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                        Budget
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-white group-hover:text-yellow-400 transition-colors line-clamp-1">
                      {event.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-400 mt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                        <span className="text-xs line-clamp-1">{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                        <span className="text-xs">{formatDate(event.date)}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/10">
                      <div>
                        <p className="text-xs text-gray-500">From</p>
                        <p className="text-sm font-bold text-yellow-400">
                          {formatPrice(event.ticket_prices?.[0]?.price || 0)}
                        </p>
                      </div>
                      <button className="text-xs text-yellow-400 font-medium hover:text-yellow-300 transition-colors flex items-center gap-1">
                        Book
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        
      </div>
    </main>
  );
}