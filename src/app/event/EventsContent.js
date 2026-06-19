"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Search,
  Sparkles,
  Ticket,
  Users,
  Star,
  Filter,
  X,
  ChevronDown,
  ArrowRight,
  Clock,
  TrendingUp,
  Award,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flex-it.onrender.com";

// Utility functions
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

// Skeleton loader component
const EventSkeleton = () => (
  <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 animate-pulse">
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

// Filter modal component
const FilterModal = ({ isOpen, onClose, onApply, filters }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[80vh] overflow-y-auto border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Filters</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Min"
                className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                value={filters.minPrice || ""}
                onChange={(e) => onApply({ ...filters, minPrice: e.target.value })}
              />
              <input
                type="number"
                placeholder="Max"
                className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                value={filters.maxPrice || ""}
                onChange={(e) => onApply({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
            <input
              type="date"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
              value={filters.date || ""}
              onChange={(e) => onApply({ ...filters, date: e.target.value })}
            />
          </div>

          <button
            onClick={onClose}
            className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl hover:bg-yellow-400 transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    date: "",
  });
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [sortBy, setSortBy] = useState("date"); // date | price | popularity

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        let url = `${API_URL}/events`;
        const params = new URLSearchParams();
        
        if (searchTerm) params.append("search", searchTerm);
        if (filters.minPrice) params.append("minPrice", filters.minPrice);
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
        if (filters.date) params.append("date", filters.date);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
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
  }, [searchTerm, filters]);

  // Sort events
  const sortedEvents = useMemo(() => {
    const sorted = [...events];
    switch (sortBy) {
      case "price":
        return sorted.sort((a, b) => (a.ticket_prices?.[0]?.price || 0) - (b.ticket_prices?.[0]?.price || 0));
      case "popularity":
        return sorted.sort((a, b) => (b.ticket_prices?.length || 0) - (a.ticket_prices?.length || 0));
      default: // date
        return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  }, [events, sortBy]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    const params = new URLSearchParams(searchParams?.toString());
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    router.push(`/event?${params.toString()}`);
  }, [router, searchParams]);

  const clearFilters = () => {
    setFilters({ minPrice: "", maxPrice: "", date: "" });
  };

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.date;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-10 w-48 bg-white/10 rounded animate-pulse mb-4"></div>
          <div className="h-12 bg-white/10 rounded animate-pulse mb-8"></div>
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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Events</span>
            </h1>
          </div>
          <p className="text-gray-400">Find and book tickets for the best events in your area</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl"></div>
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
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsFilterOpen(true)}
              className={`px-4 py-3 rounded-2xl border transition-all flex items-center gap-2 ${
                hasActiveFilters
                  ? "bg-yellow-500 text-black border-yellow-500"
                  : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-black rounded-full"></span>
              )}
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-10 text-gray-300 hover:bg-white/10 transition-all focus:outline-none focus:border-yellow-400/50"
              >
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
                <option value="popularity">Sort by Popularity</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="hidden sm:flex border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-3 transition ${
                  viewMode === "grid"
                    ? "bg-yellow-500 text-black"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <span className="text-sm">⊞</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-3 transition ${
                  viewMode === "list"
                    ? "bg-yellow-500 text-black"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <span className="text-sm">☰</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.minPrice && (
              <span className="bg-white/10 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                Min: {formatPrice(filters.minPrice)}
                <button onClick={() => setFilters({ ...filters, minPrice: "" })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.maxPrice && (
              <span className="bg-white/10 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                Max: {formatPrice(filters.maxPrice)}
                <button onClick={() => setFilters({ ...filters, maxPrice: "" })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.date && (
              <span className="bg-white/10 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                Date: {formatDate(filters.date)}
                <button onClick={() => setFilters({ ...filters, date: "" })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-gray-400 hover:text-white text-sm px-3 py-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-400">
            {sortedEvents.length} {sortedEvents.length === 1 ? "event" : "events"} found
          </p>
          {searchTerm && (
            <button
              onClick={() => handleSearch("")}
              className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Events Grid */}
        {sortedEvents.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {searchTerm 
                ? `No results found for "${searchTerm}". Try adjusting your search or filters.`
                : "There are no events available at the moment. Check back later!"}
            </p>
            {(searchTerm || hasActiveFilters) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  clearFilters();
                  router.push("/event");
                }}
                className="mt-6 px-6 py-3 bg-yellow-500 text-black font-semibold rounded-xl hover:bg-yellow-400 transition-all"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className={`grid ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          } gap-6`}>
            {sortedEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => router.push(`/event/${event.id}`)}
                className={`group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10 ${
                  viewMode === "list" ? "flex flex-col sm:flex-row" : ""
                }`}
              >
                {/* Event Image */}
                <div className={`relative overflow-hidden ${
                  viewMode === "list" ? "sm:w-64 sm:flex-shrink-0" : ""
                }`}>
                  <img
                    src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600"}
                    alt={event.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badge */}
                  {event.ticket_prices?.[0]?.price < 500 && (
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Budget Friendly
                    </span>
                  )}
                  {event.ticket_prices?.length > 2 && (
                    <span className="absolute top-3 right-3 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Popular
                    </span>
                  )}
                </div>

                {/* Event Info */}
                <div className="p-5 flex-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors mb-2 line-clamp-1">
                    {event.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                    {event.ticket_prices?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <span>
                          {event.ticket_prices.length} tier
                          {event.ticket_prices.length > 1 ? "s" : ""} • 
                          From {formatPrice(event.ticket_prices[0].price)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {Math.floor(Math.random() * 50) + 10} left
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(event.date) - new Date() < 7 * 24 * 60 * 60 * 1000 ? "Soon" : "Available"}
                      </span>
                    </div>
                    <button className="text-yellow-400 font-medium text-sm hover:text-yellow-300 transition-colors flex items-center gap-1">
                      Book Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {sortedEvents.length > 0 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-bold text-white">{sortedEvents.length}</p>
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

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
      />
    </main>
  );
}