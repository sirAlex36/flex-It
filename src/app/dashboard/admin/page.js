"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  TicketIcon,
  CreditCardIcon,
  BellIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  EnvelopeIcon,
  QrCodeIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ChatBubbleLeftIcon,
  GiftIcon,
  ArchiveBoxIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, change, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };

  return (
    <div className={`${colorClasses[color]} border rounded-2xl p-6 backdrop-blur-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${change > 0 ? "text-green-600" : "text-red-600"}`}>
              {change > 0 ? "+" : ""}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]} bg-opacity-20`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

// Data Table Component
const DataTable = ({ columns, data, actions }) => {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-2xl">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col}
                className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
              >
                {col}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-100 hover:bg-gray-50 transition"
            >
              {columns.map((col) => (
                <td key={col} className="px-6 py-4 text-sm text-gray-700">
                  {row[col]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-3">
                    {actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => action.onClick(row)}
                        className="text-gray-600 hover:text-gray-900 transition"
                        title={action.label}
                      >
                        <action.icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, title, children, onClose, onSubmit, submitLabel = "Save" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-6 max-h-96 overflow-y-auto">{children}</div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Alert Component
const Alert = ({ type, message, onClose }) => {
  const bgColor = type === "success" ? "bg-green-50" : "bg-red-50";
  const borderColor = type === "success" ? "border-green-200" : "border-red-200";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const Icon = type === "success" ? CheckCircleIcon : ExclamationCircleIcon;

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4 flex items-start gap-3`}>
      <Icon className={`w-5 h-5 mt-0.5 ${type === "success" ? "text-green-600" : "text-red-600"}`} />
      <p className={`text-sm ${textColor}`}>{message}</p>
    </div>
  );
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({ 
    name: "", 
    date: "", 
    venue: "", 
    description: "",
    ticket_prices: [
      { ticket_type: "General", price: 1000 },
      { ticket_type: "VIP", price: 2500 },
    ]
  });

  // Handle ticket price changes
  const updateTicketPrice = (index, field, value) => {
    const updatedPrices = [...eventForm.ticket_prices];
    updatedPrices[index][field] = field === 'price' ? parseInt(value) || 0 : value;
    setEventForm({ ...eventForm, ticket_prices: updatedPrices });
  };

  const addTicketPrice = () => {
    setEventForm({
      ...eventForm,
      ticket_prices: [...eventForm.ticket_prices, { ticket_type: "", price: 0 }]
    });
  };

  const removeTicketPrice = (index) => {
    setEventForm({
      ...eventForm,
      ticket_prices: eventForm.ticket_prices.filter((_, i) => i !== index)
    });
  };

  // Define fetchDashboardData before hooks
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`,
      };

      const [eventsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/events`, { headers }),
        fetch(`${API_URL}/users`, { headers }),
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };

  // Protection - redirect if not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard/user");
    }
  }, [status, session, router]);

  // Fetch data from backend
  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 border-b-2 border-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return null; // Redirect happens in useEffect
  }

  const handleCreateEvent = async () => {
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(eventForm),
      });

      if (response.ok) {
        setSuccess("Event created successfully!");
        setShowEventModal(false);
        setEventForm({ 
          name: "", 
          date: "", 
          venue: "", 
          description: "",
          ticket_prices: [
            { ticket_type: "General", price: 1000 },
            { ticket_type: "VIP", price: 2500 },
          ]
        });
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create event");
      }
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Error creating event");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Calculate stats
  const totalRevenue = 0; // Transactions endpoint not available
  const totalUsers = users.length;
  const totalEvents = events.length;
  const successfulTransactions = 0; // Transactions endpoint not available

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 backdrop-blur-xl bg-opacity-80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Flex-It Admin</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="h-10 w-px bg-gray-200"></div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name || "Admin"}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Alerts */}
        {error && <Alert type="error" message={error} onClose={() => setError("")} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess("")} />}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: ChartBarIcon },
            { id: "events", label: "Events", icon: CalendarIcon },
            { id: "users", label: "Users", icon: UsersIcon },
            { id: "transactions", label: "Transactions", icon: CreditCardIcon },
            { id: "tickets", label: "Tickets", icon: TicketIcon },
            { id: "analytics", label: "Analytics", icon: ChartBarIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={CalendarIcon} label="Total Events" value={totalEvents} color="blue" />
              <StatCard icon={UsersIcon} label="Total Users" value={totalUsers} color="green" />
              <StatCard
                icon={CreditCardIcon}
                label="Total Revenue"
                value={`$${(totalRevenue / 100).toFixed(2)}`}
                color="purple"
              />
              <StatCard
                icon={CheckCircleIcon}
                label="Transactions"
                value={successfulTransactions}
                color="orange"
              />
            </div>

            {/* Quick Actions */}
            <button
              onClick={() => setShowEventModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition"
            >
              <PlusIcon className="w-5 h-5" />
              Create Event
            </button>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Events</h2>
              <button
                onClick={() => setShowEventModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                <PlusIcon className="w-5 h-5" />
                New Event
              </button>
            </div>

            {events.length > 0 ? (
              <DataTable
                columns={["id", "name", "date", "venue"]}
                data={events.map((e) => ({
                  id: e.id,
                  name: e.name,
                  date: new Date(e.date).toLocaleDateString(),
                  venue: e.venue,
                }))}
                actions={[
                  { label: "View", icon: EyeIcon, onClick: (row) => console.log(row) },
                  { label: "Edit", icon: PencilIcon, onClick: (row) => console.log(row) },
                  { label: "Delete", icon: TrashIcon, onClick: (row) => console.log(row) },
                ]}
              />
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No events yet. Create your first event!</p>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Users</h2>
            {users.length > 0 ? (
              <DataTable
                columns={["id", "name", "email", "role"]}
                data={users.map((u) => ({
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  role: u.role || "user",
                }))}
              />
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No users yet</p>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Transaction tracking is currently unavailable</p>
              <p className="text-sm text-gray-500 mt-2">Please check back soon for detailed transaction reports</p>
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === "tickets" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Tickets Management</h2>
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Ticket management coming soon</p>
              <p className="text-sm text-gray-500 mt-2">View, resend, regenerate QR codes, and manage customer tickets</p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Revenue</h3>
                <p className="text-3xl font-bold text-blue-600">KES 0</p>
                <p className="text-xs text-gray-500 mt-2">Total revenue collected</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Tickets Sold</h3>
                <p className="text-3xl font-bold text-green-600">0</p>
                <p className="text-xs text-gray-500 mt-2">All time</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Payment Success Rate</h3>
                <p className="text-3xl font-bold text-purple-600">0%</p>
                <p className="text-xs text-gray-500 mt-2">Successful transactions</p>
              </div>
            </div>
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Detailed analytics coming soon</p>
            </div>
          </div>
        )}
      </main>

      {/* Create Event Modal */}
      <Modal
        isOpen={showEventModal}
        title="Create New Event"
        onClose={() => setShowEventModal(false)}
        onSubmit={handleCreateEvent}
        submitLabel="Create Event"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Event name"
            value={eventForm.name}
            onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={eventForm.date}
            onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Venue"
            value={eventForm.venue}
            onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Description"
            value={eventForm.description}
            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>
      </Modal>
    </div>
  );
}
