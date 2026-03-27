"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  CalendarDaysIcon,
  TicketIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ShoppingCartIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
  BellIcon,
  HeartIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import {
  CalendarDaysIcon as CalendarDaysSolid,
  TicketIcon as TicketSolid,
  UserIcon as UserSolid,
  HeartIcon as HeartSolid
} from "@heroicons/react/24/solid";

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.sub.role !== "user") {
        router.push("/login");
        return;
      }
      setUser(decoded);
    } catch (err) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

    try {
      const [eventsRes, ticketsRes] = await Promise.all([
        fetch(`${API_URL}/events`),
        fetch(`${API_URL}/user/tickets?user_id=${user?.sub?.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      }

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setUserTickets(ticketsData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingEvents = events.filter(event => new Date(event.date) > new Date());
  const recentTickets = userTickets.slice(0, 3);

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handlePurchaseTicket = (event) => {
    // Navigate to event page or open purchase modal
    router.push(`/event/${event.id}`);
  };

  const toggleFavorite = (eventId) => {
    setFavorites(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.sub?.name || "User"}! 👋
                </h1>
                <p className="text-gray-600 text-lg">Discover amazing events and manage your tickets</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
                </button>
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.sub?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border">
              {[
                { id: "dashboard", label: "Dashboard", icon: CalendarDaysSolid },
                { id: "events", label: "Events", icon: CalendarDaysIcon },
                { id: "tickets", label: "My Tickets", icon: TicketSolid },
                { id: "profile", label: "Profile", icon: UserSolid },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-md font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                      <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <TicketIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">My Tickets</p>
                      <p className="text-2xl font-bold text-gray-900">{userTickets.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <HeartSolid className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Favorites</p>
                      <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <StarIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${userTickets.reduce((sum, ticket) => sum + ticket.price, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Upcoming Events */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Tickets */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Recent Tickets
                    </h3>
                  </div>
                  <div className="p-6">
                    {recentTickets.length > 0 ? (
                      <div className="space-y-4">
                        {recentTickets.map((ticket) => {
                          const event = events.find(e => e.id === ticket.event_id);
                          return (
                            <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <TicketIcon className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{event?.name || "Event"}</p>
                                  <p className="text-sm text-gray-600">{ticket.type} • ${ticket.price}</p>
                                </div>
                              </div>
                              <button className="text-blue-600 hover:text-blue-800 p-2">
                                <QrCodeIcon className="h-5 w-5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <TicketIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No tickets purchased yet</p>
                        <button
                          onClick={() => setActiveTab("events")}
                          className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Browse Events →
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Upcoming Events
                    </h3>
                  </div>
                  <div className="p-6">
                    {upcomingEvents.slice(0, 3).length > 0 ? (
                      <div className="space-y-4">
                        {upcomingEvents.slice(0, 3).map((event) => (
                          <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{event.name}</h4>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {event.venue}
                              </div>
                              <p className="text-sm text-gray-600">{event.date}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewEvent(event)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => toggleFavorite(event.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  favorites.includes(event.id)
                                    ? "text-red-600 bg-red-50"
                                    : "text-gray-400 hover:bg-gray-50"
                                }`}
                              >
                                <HeartIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No upcoming events</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <FunnelIcon className="h-5 w-5 mr-2 text-gray-600" />
                    Filter
                  </button>
                </div>
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.name}</h3>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {event.venue}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <CalendarDaysIcon className="h-4 w-4 mr-1" />
                            {event.date}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleFavorite(event.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            favorites.includes(event.id)
                              ? "text-red-600 bg-red-50"
                              : "text-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          <HeartIcon className="h-5 w-5" />
                        </button>
                      </div>

                      {event.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                      )}

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewEvent(event)}
                          className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View Details
                        </button>
                        <button
                          onClick={() => handlePurchaseTicket(event)}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ShoppingCartIcon className="h-4 w-4 mr-2" />
                          Get Tickets
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === "tickets" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">My Tickets ({userTickets.length})</h3>
                </div>
                <div className="p-6">
                  {userTickets.length > 0 ? (
                    <div className="space-y-4">
                      {userTickets.map((ticket) => {
                        const event = events.find(e => e.id === ticket.event_id);
                        return (
                          <div key={ticket.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">{event?.name || "Event"}</h4>
                                <p className="text-gray-600">{event?.date} • {event?.venue}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">${ticket.price}</p>
                                <p className="text-sm text-gray-600">{ticket.type}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                                <span className="text-sm text-gray-600">
                                  Purchased on {new Date(ticket.created_at || Date.now()).toLocaleDateString()}
                                </span>
                              </div>

                              <div className="flex space-x-2">
                                <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                  <QrCodeIcon className="h-4 w-4 mr-2" />
                                  View QR
                                </button>
                                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                  <EyeIcon className="h-4 w-4 mr-2" />
                                  View Event
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TicketIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
                      <p className="text-gray-600 mb-4">Start exploring events to purchase your first ticket</p>
                      <button
                        onClick={() => setActiveTab("events")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Browse Events
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                      {user?.sub?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{user?.sub?.name}</h4>
                      <p className="text-gray-600">{user?.sub?.email}</p>
                      <p className="text-sm text-gray-500">Member since {new Date().getFullYear()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user?.sub?.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={user?.sub?.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.name}</h2>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    {selectedEvent.venue}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CalendarDaysIcon className="h-5 w-5 mr-2" />
                    {selectedEvent.date}
                  </div>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  ✕
                </button>
              </div>

              {selectedEvent.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About this event</h3>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => handlePurchaseTicket(selectedEvent)}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Get Tickets
                </button>
                <button
                  onClick={() => toggleFavorite(selectedEvent.id)}
                  className={`px-6 py-3 border rounded-lg transition-colors ${
                    favorites.includes(selectedEvent.id)
                      ? "border-red-300 text-red-600 bg-red-50"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <HeartIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}