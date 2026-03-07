"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3002/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setFiltered(data);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  const handleSearch = () => {
    const results = events.filter(
      (event) =>
        event.name.toLowerCase().includes(search.toLowerCase()) ||
        event.location.toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(results);
  };

  return (
    <>
      <Header />
      <main className="bg-gray-50">

        {/* HERO SECTION */}

        <section className="relative h-screen flex items-center justify-center text-center overflow-hidden pt-16">

          <img
            src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"
            className="absolute inset-0 w-full h-full object-cover"
            alt="events"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>

          <div className="relative z-10 text-white max-w-3xl px-4">

            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-400 text-blue-300 rounded-full text-sm font-semibold backdrop-blur-sm">
                ✨ Trending Events Near You
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Discover & Book Amazing Events
            </h1>

          <p className="text-xl md:text-2xl mb-12 text-gray-100 leading-relaxed">
            Experience unforgettable moments. Browse concerts, festivals, conferences, and exclusive events happening around you.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-3">

            <input
              type="text"
              placeholder="🔍 Search events, artists, venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-6 py-4 rounded-lg text-gray-900 w-full md:w-80 font-medium shadow-lg placeholder-gray-500"
            />

            <button
              onClick={handleSearch}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold transition shadow-lg"
            >
              Search
            </button>

          </div>

        </div>

      </section>

      {/* FEATURED EVENTS */}

      <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <h2 className="text-5xl font-bold mb-4">
            Featured Events
          </h2>
          <p className="text-xl text-gray-600">
            Handpicked events that are trending right now
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {filtered.slice(0, 6).map((event) => (

            <div
              key={event.id}
              className="bg-white rounded-xl shadow-md hover:shadow-2xl transition overflow-hidden group"
            >

              <img
                src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"}
                alt={event.name}
                className="h-48 w-full object-cover group-hover:scale-110 transition duration-300"
              />

              <div className="p-5">

                <h3 className="font-semibold text-lg mb-2">
                  {event.name}
                </h3>

                <p className="text-gray-500 text-sm mb-2">
                  📍 {event.location}
                </p>

                <p className="text-gray-500 text-sm mb-4">
                  📅 {event.date}
                </p>

                <Link href={`/event/${event.id}`}>

                  <button className="bg-blue-600 text-white px-4 py-3 rounded-lg w-full hover:bg-blue-700 transition font-semibold shadow-md">
                    View Details →
                  </button>

                </Link>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* WHY CHOOSE FLEX-IT */}

      <section className="py-20 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          

          {/* Additional Benefits */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="flex gap-4 bg-gray-50 p-6 rounded-lg">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold">Real-time Availability</h4>
                <p className="text-gray-600 text-sm mt-1">See exactly which seats are available before you buy</p>
              </div>
            </div>

            <div className="flex gap-4 bg-gray-50 p-6 rounded-lg">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold">24/7 Customer Support</h4>
                <p className="text-gray-600 text-sm mt-1">Our dedicated team is always ready to help you</p>
              </div>
            </div>

            <div className="flex gap-4 bg-gray-50 p-6 rounded-lg">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold">Smart Recommendations</h4>
                <p className="text-gray-600 text-sm mt-1">Personalized event suggestions based on your interests</p>
              </div>
            </div>

            <div className="flex gap-4 bg-gray-50 p-6 rounded-lg">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold">Multiple Payment Options</h4>
                <p className="text-gray-600 text-sm mt-1">Pay your way with credit cards, e-wallets, and more</p>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 text-center">

        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Experience Your Next Adventure?
          </h2>

          <p className="text-xl text-blue-100 mb-10">
            Browse thousands of events, from intimate gatherings to massive festivals. Join millions of happy attendees worldwide.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/event">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg inline-block">
                🔍 Browse All Events
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="bg-blue-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-400 transition border-2 border-white inline-block">
                ✨ Create Account
              </button>
            </Link>
          </div>
        </div>

      </section>

      </main>
      <Footer />
    </>
  );
}