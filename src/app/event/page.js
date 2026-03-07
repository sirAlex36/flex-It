"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3002/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4">Upcoming Events</h1>
            <p className="text-xl text-gray-600">Explore thousands of amazing events happening near you</p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading events...</p>
              </div>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition group border border-gray-100">
                  <div className="relative overflow-hidden h-48 bg-gray-200">
                    <img 
                      src={event.image || "https://via.placeholder.com/300x200"} 
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      LIVE
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 text-gray-900">{event.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                      <span>📍</span> {event.location}
                    </p>
                    <p className="text-gray-500 text-sm mb-4 flex items-center gap-2">
                      <span>📅</span> {event.date}
                    </p>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-md">
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎪</div>
              <p className="text-gray-600 text-lg font-medium">No events found at the moment.</p>
              <p className="text-gray-500 mt-2">Check back soon for amazing events!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
