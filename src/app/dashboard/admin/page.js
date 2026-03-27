"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  CalendarDaysIcon,
  TicketIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    id: null,
    name: "",
    date: "",
    venue: "",
    description: "",
    image: "",
  });
  const [errorText, setErrorText] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.sub?.role !== "admin") {
        router.push("/login");
        return;
      }
      setUser(decoded);
    } catch (err) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, ticketsRes] = await Promise.all([
        fetch(`${API_URL}/events`),
        fetch(`${API_URL}/tickets`),
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData || []);
      }

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setErrorText("");

    if (!eventForm.name || !eventForm.date || !eventForm.venue) {
      setErrorText("Name, date, and venue are required.");
      return;
    }

    try {
      const method = eventForm.id ? "PUT" : "POST";
      const endpoint = eventForm.id ? `${API_URL}/events/${eventForm.id}` : `${API_URL}/events`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save event.");
      }

      setShowEventModal(false);
      setEventForm({ id: null, name: "", date: "", venue: "", description: "", image: "" });
      await fetchData();
    } catch (err) {
      setErrorText(err.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Delete failed.");
      }
      await fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete event.");
    }
  };

  const openEditModal = (event) => {
    setEventForm({
      id: event.id,
      name: event.name,
      date: event.date,
      venue: event.venue,
      description: event.description || "",
      image: event.image || "",
    });
    setShowEventModal(true);
  };

  const upcomingEvents = events.filter((event) => new Date(event.date) >= new Date());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">You are logged in as {user?.sub?.name || "Admin"}.</p>
            </div>
            <button
              onClick={() => { setShowEventModal(true); setEventForm({ id: null, name: "", date: "", venue: "", description: "", image: "" }); setErrorText(""); }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" /> Add Event
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase">Total Events</p>
              <p className="text-3xl font-bold text-gray-900">{events.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase">Upcoming Events</p>
              <p className="text-3xl font-bold text-gray-900">{upcomingEvents.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase">Total Tickets</p>
              <p className="text-3xl font-bold text-gray-900">{tickets.length}</p>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3">
            {['overview', 'events', 'tickets'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
                <div className="mt-4 space-y-3">
                  {events.slice(0, 3).map((event) => (
                    <article key={event.id} className="flex items-start gap-3">
                      <img
                        src={event.image || 'https://via.placeholder.com/80x80?text=Poster'}
                        alt={event.name}
                        className="h-16 w-16 object-cover rounded-md"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80x80?text=Poster'; }}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.name}</h3>
                        <p className="text-sm text-gray-600">{event.date} • {event.venue}</p>
                      </div>
                    </article>
                  ))}
                  {events.length === 0 && <p className="text-sm text-gray-500">No event has been created yet.</p>}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
                <div className="mt-4 space-y-2 text-gray-700">
                  {tickets.slice(-5).reverse().map((ticket) => (
                    <div key={ticket.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="text-sm font-medium">Ticket #{ticket.id}</p>
                        <p className="text-xs text-gray-500">Event {ticket.event_id} • User {ticket.user_id}</p>
                      </div>
                      <p className="text-sm font-bold text-green-600">${ticket.price}</p>
                    </div>
                  ))}
                  {tickets.length === 0 && <p className="text-sm text-gray-500">No tickets sold yet.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.length === 0 ? (
                <div className="col-span-full p-10 border border-dashed border-gray-300 rounded-xl text-center text-gray-500">No events available. Create one using Add Event.</div>
              ) : events.map((event) => (
                <article key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <img
                    src={event.image || 'https://via.placeholder.com/420x220?text=Poster+Queued'}
                    alt={event.name}
                    className="h-44 w-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/420x220?text=Poster+Queued'; }}
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{event.date} • {event.venue}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{event.description || 'No description provided yet.'}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <button onClick={() => openEditModal(event)} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50">
                        <EyeIcon className="h-4 w-4" /> Edit
                      </button>
                      <button onClick={() => handleDeleteEvent(event.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50">
                        <TrashIcon className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No tickets found.</td>
                    </tr>
                  )}
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="px-6 py-3 text-sm text-gray-700">{ticket.id}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{ticket.type}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">${ticket.price}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{ticket.user_id}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{ticket.event_id}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{new Date(ticket.created_at || Date.now()).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showEventModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-xl rounded-xl shadow-xl overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">{eventForm.id ? 'Edit Event' : 'Add New Event'}</h2>
                  <button onClick={() => { setShowEventModal(false); setEventForm({ id: null, name: '', date: '', venue: '', description: '', image: '' }); setErrorText(''); }} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <form onSubmit={handleEventSave} className="p-5 space-y-4">
                  {errorText && <p className="text-sm text-red-600">{errorText}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Venue</label>
                    <input value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input type="url" value={eventForm.image} onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Event</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
