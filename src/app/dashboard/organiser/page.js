"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  Users,
  Ticket,
  TrendingUp,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import {
  getOrganizerDashboardAnalytics,
  getOrganizerEvents,
  createOrganizerEvent,
  updateOrganizerEvent,
  deleteOrganizerEvent,
  getEventTickets,
} from "@/lib/api";

const OrganizerDashboard = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    total_events: 0,
    total_tickets_sold: 0,
    total_revenue: 0,
    upcoming_events: 0,
    pending_payouts: 0,
  });

  const [events, setEvents] = useState([]);
  const [ticketsForEvent, setTicketsForEvent] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    venue: "",
    description: "",
    image: "",
    ticket_prices: [{ ticket_type: "General", price: 1000 }],
  });

  // 🔐 PROTECT ORGANISER ROUTE
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "organiser") {
      router.push(`/dashboard/${session?.user?.role}`);
    }
  }, [status, session, router]);

  // Load dashboard data
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "organiser") {
      loadDashboardData();
    }
  }, [status, session]);

  // Load events when events tab is opened
  useEffect(() => {
    if (activeTab === "events" && events.length === 0) {
      loadEvents();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getOrganizerDashboardAnalytics();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await getOrganizerEvents(1, 20);
      setEvents(response.events || []);
      setError(null);
    } catch (err) {
      console.error("Error loading events:", err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const loadEventTickets = async (eventId) => {
    try {
      setLoading(true);
      const response = await getEventTickets(eventId, 1, 50);
      setTicketsForEvent(response.tickets || []);
      setSelectedEventId(eventId);
      setError(null);
    } catch (err) {
      console.error("Error loading tickets:", err);
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createOrganizerEvent(formData);
      setSuccess("Event created successfully!");
      setFormData({
        name: "",
        date: "",
        venue: "",
        description: "",
        image: "",
        ticket_prices: [{ ticket_type: "General", price: 1000 }],
      });
      setShowEventForm(false);
      loadEvents();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (eventId, updatedData) => {
    try {
      setLoading(true);
      await updateOrganizerEvent(eventId, updatedData);
      setSuccess("Event updated successfully!");
      loadEvents();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      setLoading(true);
      await deleteOrganizerEvent(eventId);
      setSuccess("Event deleted successfully!");
      loadEvents();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="h-12 w-12 border-b-2 border-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading organiser dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "organiser") {
    return null;
  }

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      id: "events",
      label: "Events",
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      id: "tickets",
      label: "Tickets",
      icon: Ticket,
      color: "text-pink-600",
    },
    {
      id: "attendees",
      label: "Attendees",
      icon: Users,
      color: "text-green-600",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      color: "text-indigo-600",
    },
    {
      id: "payouts",
      label: "Payouts",
      icon: DollarSign,
      color: "text-emerald-600",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      color: "text-gray-600",
    },
  ];

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    bgColor,
    iconColor,
  }) => (
    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          {trend > 0 ? (
            <>
              <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-semibold">{trend}%</span>
              <span className="text-gray-600 ml-1">from last month</span>
            </>
          ) : (
            <>
              <ArrowDownLeft className="w-4 h-4 text-red-600 mr-1" />
              <span className="text-red-600 font-semibold">{Math.abs(trend)}%</span>
              <span className="text-gray-600 ml-1">from last month</span>
            </>
          )}
        </div>
      )}
    </div>
  );

  const EventCard = ({ event }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 group">
      {/* Event Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-400 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" />
        <div className="absolute top-3 right-3 flex gap-2">
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            LIVE
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h4 className="font-bold text-gray-900 line-clamp-1">{event.name}</h4>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.venue}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-blue-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Tickets Sold</p>
            <p className="font-bold text-gray-900">{event.ticketsSold}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Revenue</p>
            <p className="font-bold text-gray-900">KES {event.revenue}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Edit2 size={16} />
            Edit
          </button>
          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Eye size={16} />
            View
          </button>
        </div>
      </div>
    </div>
  );

  const RecentActivityItem = ({ activity }) => (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 flex-1">
        <div className={`p-2 rounded-lg ${activity.bgColor}`}>
          {activity.icon}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
          <p className="text-xs text-gray-600">{activity.description}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500">{activity.time}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* SIDEBAR */}
      <div
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <Link href="/" className="font-bold text-xl text-blue-600">
              Flex-It
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={20} className={isActive ? item.color : ""} />
                {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4 border-t border-gray-200 pt-4">
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all ${
              !sidebarOpen && "justify-center"
            }`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* TOP BAR */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {navItems.find((item) => item.id === activeTab)?.label}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-600">Organiser</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                <StatCard
                  title="Total Events"
                  value={dashboardData.total_events}
                  icon={Calendar}
                  bgColor="bg-blue-100"
                  iconColor="text-blue-600"
                />
                <StatCard
                  title="Tickets Sold"
                  value={dashboardData.total_tickets_sold.toLocaleString()}
                  icon={Ticket}
                  bgColor="bg-pink-100"
                  iconColor="text-pink-600"
                />
                <StatCard
                  title="Total Revenue"
                  value={`KES ${dashboardData.total_revenue.toLocaleString()}`}
                  icon={DollarSign}
                  bgColor="bg-green-100"
                  iconColor="text-green-600"
                />
                <StatCard
                  title="Upcoming Events"
                  value={dashboardData.upcoming_events}
                  subtitle="In next 30 days"
                  icon={Clock}
                  bgColor="bg-orange-100"
                  iconColor="text-orange-600"
                />
                <StatCard
                  title="Pending Payouts"
                  value={`KES ${dashboardData.pending_payouts.toLocaleString()}`}
                  icon={DollarSign}
                  bgColor="bg-indigo-100"
                  iconColor="text-indigo-600"
                />
              </div>

              {/* BOTTOM SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* RECENT EVENTS */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Your Events</h2>
                    <button
                      onClick={() => setShowEventForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                    >
                      <Plus size={18} />
                      Create Event
                    </button>
                  </div>
                  {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {events.slice(0, 2).map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                      <Calendar size={40} className="mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600">No events yet. Create your first event!</p>
                    </div>
                  )}
                </div>

                {/* RECENT ACTIVITY */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 h-fit">
                  <h3 className="font-bold text-gray-900 mb-4">Recent Events</h3>
                  {events.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 border-l-4 border-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition"
                        >
                          <p className="font-medium text-sm text-gray-900 line-clamp-1">{event.name}</p>
                          <p className="text-xs text-gray-600">{event.date}</p>
                          <p className="text-xs font-semibold text-blue-600 mt-1">
                            {event.tickets_sold} tickets sold
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No events created yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <Plus size={18} />
                  Create New Event
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100"
                    >
                      <div className="h-40 bg-gradient-to-br from-indigo-400 to-blue-500 relative">
                        {event.image && (
                          <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 line-clamp-2">{event.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{event.venue}</p>
                        <p className="text-xs text-gray-500 mt-1">{event.date}</p>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="bg-blue-50 rounded-lg p-2">
                            <p className="text-xs text-gray-600">Sold</p>
                            <p className="font-bold text-gray-900">{event.tickets_sold}</p>
                          </div>
                          <div className="bg-indigo-50 rounded-lg p-2">
                            <p className="text-xs text-gray-600">Revenue</p>
                            <p className="font-bold text-gray-900">KES {event.total_revenue.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => loadEventTickets(event.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <Eye size={16} />
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold py-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} className="mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                  <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-600">No events yet</p>
                  <p className="text-sm text-gray-500 mt-2">Create your first event to get started</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "tickets" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Tickets & Attendees</h2>
              
              {events.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                  <Ticket size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-600">No events yet</p>
                  <p className="text-sm text-gray-500 mt-2">Create an event to manage tickets</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
                    {events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => loadEventTickets(event.id)}
                        className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
                          selectedEventId === event.id
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {event.name}
                      </button>
                    ))}
                  </div>

                  {ticketsForEvent.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ticket Type</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ticketsForEvent.map((ticket) => (
                            <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">{ticket.user_name}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{ticket.user_email}</td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{ticket.ticket_type}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">KES {ticket.price}</td>
                              <td className="px-6 py-4 text-sm">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    ticket.confirmed
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {ticket.confirmed ? "Confirmed" : "Pending"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                      <Ticket size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No tickets for this event yet</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "attendees" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Attendees</h2>
              
              {events.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                  <Users size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-600">No events yet</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
                    {events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => loadEventTickets(event.id)}
                        className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
                          selectedEventId === event.id
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {event.name}
                      </button>
                    ))}
                  </div>

                  {ticketsForEvent.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Check-in Status</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Registered</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ticketsForEvent.filter(t => t.confirmed).map((ticket) => (
                            <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">{ticket.user_name}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{ticket.user_email}</td>
                              <td className="px-6 py-4 text-sm">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    ticket.used
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {ticket.used ? "Checked In" : "Pending"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{ticket.created_at}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                      <Users size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No confirmed attendees for this event yet</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
              
              {events.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                  <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-600">No events yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map((event) => (
                    <div key={event.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
                      <h3 className="font-bold text-gray-900 mb-4">{event.name}</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Revenue</p>
                          <p className="text-2xl font-bold text-gray-900">KES {event.total_revenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tickets Sold</p>
                          <p className="text-2xl font-bold text-gray-900">{event.tickets_sold}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Ticket Tiers</p>
                          <div className="mt-2 space-y-1">
                            {event.ticket_prices.map((tp) => (
                              <div key={tp.id} className="flex justify-between text-sm">
                                <span className="text-gray-600">{tp.ticket_type}</span>
                                <span className="font-medium text-gray-900">KES {tp.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "payouts" && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <DollarSign size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-600">Payout management coming soon</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <Settings size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-600">Settings coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
