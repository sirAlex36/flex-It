// /src/app/event/EventList.js
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flex-it.onrender.com";

export default function EventList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || "");

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      
      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div 
              key={event.id} 
              onClick={() => router.push(`/event/${event.id}`)}
              className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold">{event.name}</h2>
              <p className="text-gray-600 mt-2">{event.date}</p>
              <p className="text-gray-500">{event.venue}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}