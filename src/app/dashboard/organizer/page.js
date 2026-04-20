"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  CalendarIcon,
  TicketIcon,
  UsersIcon,
  CreditCardIcon,
  SparklesIcon,
  ChartBarIcon,
  GiftIcon,
  CogIcon,
  BellIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  QrCodeIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  LockClosedIcon,
  LockOpenIcon,
  CheckIcon,
  XMarkIcon as XIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

// ============== PREMIUM STAT CARD ==============
const PremiumStatCard = ({ icon: Icon, label, value, change, color = "blue", trend = "up" }) => {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 text-blue-600 border-blue-200",
    indigo: "from-indigo-50 to-indigo-100 text-indigo-600 border-indigo-200",
    purple: "from-purple-50 to-purple-100 text-purple-600 border-purple-200",
    green: "from-green-50 to-green-100 text-green-600 border-green-200",
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-2xl p-6 backdrop-blur-sm hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
          <p className="text-4xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-3">
              {trend === "up" ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
              )}
              <p className={`text-sm font-semibold ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {Math.abs(change)}% {trend === "up" ? "increase" : "decrease"}
              </p>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl bg-white bg-opacity-50`}>
          <Icon className="w-8 h-8 text-current" />
        </div>
      </div>
    </div>
  );
};

// ============== EVENT STATUS BADGE ==============
const EventStatusBadge = ({ status }) => {
  const badges = {
    live: "bg-green-100 text-green-800 border border-green-300",
    draft: "bg-gray-100 text-gray-800 border border-gray-300",
    "sold-out": "bg-red-100 text-red-800 border border-red-300",
    cancelled: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    upcoming: "bg-blue-100 text-blue-800 border border-blue-300",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badges[status] || badges.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ============== PREMIUM EVENT CARD ==============
const PremiumEventCard = ({ event, onEdit, onAnalytics, onAttendees, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
      {/* Event Image Header */}
      <div className="h-40 bg-gradient-to-br from-indigo-500 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <CalendarIcon className="w-32 h-32 text-white opacity-30 absolute -right-10 -top-10" />
        </div>
        <div className="absolute top-3 right-3">
          <EventStatusBadge status={event.status || "draft"} />
        </div>
      </div>

      {/* Event Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{event.name}</h3>
        
        <div className="space-y-3 mb-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 flex-shrink-0 text-indigo-600" />
            <span>{new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 flex-shrink-0 text-indigo-600" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Event Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">24</p>
            <p className="text-xs text-gray-500">Tickets Sold</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">₹24K</p>
            <p className="text-xs text-gray-500">Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">80%</p>
            <p className="text-xs text-gray-500">Sold</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(event)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-medium text-sm"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onAnalytics(event)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
          >
            <ChartBarIcon className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => onAttendees(event)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-medium text-sm"
          >
            <UsersIcon className="w-4 h-4" />
            Attendees
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== SIDEBAR NAVIGATION ==============
const Sidebar = ({ activeTab, setActiveTab, isMobile, setIsMobile }) => {
  const navigationItems = [
    { id: "overview", label: "Overview", icon: ChartBarIcon },
    { id: "events", label: "Events", icon: CalendarIcon },
    { id: "tickets", label: "Tickets & Sales", icon: TicketIcon },
    { id: "attendees", label: "Attendees", icon: UsersIcon },
    { id: "analytics", label: "Analytics", icon: SparklesIcon },
    { id: "payouts", label: "Revenue & Payouts", icon: CreditCardIcon },
    { id: "promotions", label: "Promotions", icon: GiftIcon },
    { id: "settings", label: "Settings", icon: CogIcon },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-indigo-900 via-indigo-800 to-blue-900 text-white transform transition-transform duration-300 ${isMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
      {/* Close button for mobile */}
      <button
        onClick={() => setIsMobile(false)}
        className="lg:hidden absolute top-6 right-6 p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {/* Logo */}
      <div className="p-6 border-b border-white border-opacity-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">
          FlexIt Pro
        </h1>
        <p className="text-xs text-indigo-200 mt-1">Event Organizer Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              setIsMobile(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === id
                ? "bg-white bg-opacity-20 text-white shadow-lg"
                : "text-indigo-100 hover:bg-white hover:bg-opacity-10"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white border-opacity-10">
        <button className="w-full flex items-center gap-2 px-4 py-3 text-indigo-100 hover:bg-white hover:bg-opacity-10 rounded-lg transition font-medium text-sm">
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

// ============== OVERVIEW TAB ==============
const OverviewTab = () => {
  const stats = [
    { label: "Total Events", value: "12", change: 8, color: "blue", icon: CalendarIcon },
    { label: "Tickets Sold", value: "528", change: 15, color: "indigo", icon: TicketIcon },
    { label: "Total Revenue", value: "₹5,28,000", change: 22, color: "green", icon: CreditCardIcon },
    { label: "Pending Payouts", value: "₹1,58,000", change: -5, color: "purple", icon: SparklesIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <PremiumStatCard
            key={idx}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            color={stat.color}
            trend={stat.change > 0 ? "up" : "down"}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Ticket Sales */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Ticket Sales</h3>
          <div className="space-y-4">
            {[
              { event: "Tech Summit 2024", tickets: 5, amount: "₹50,000", time: "2 hours ago" },
              { event: "Music Festival", tickets: 12, amount: "₹1,20,000", time: "5 hours ago" },
              { event: "Workshop Series", tickets: 3, amount: "₹30,000", time: "1 day ago" },
            ].map((sale, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <TicketIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{sale.event}</p>
                    <p className="text-sm text-gray-600">{sale.tickets} tickets sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">{sale.amount}</p>
                  <p className="text-xs text-gray-500">{sale.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Events</h3>
          <div className="space-y-3">
            {[
              { name: "Tech Summit", date: "Apr 25" },
              { name: "Music Fest", date: "May 10" },
              { name: "Workshop", date: "May 15" },
            ].map((evt, idx) => (
              <div key={idx} className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                <p className="font-semibold text-gray-900 text-sm">{evt.name}</p>
                <p className="text-xs text-gray-600 mt-1">{evt.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Performance */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performing Events</h3>
        <div className="space-y-4">
          {[
            { name: "Tech Summit", sold: 92, revenue: "₹4,60,000" },
            { name: "Music Festival", sold: 78, revenue: "₹3,12,000" },
            { name: "Workshop Series", sold: 56, revenue: "₹2,80,000" },
          ].map((event, idx) => (
            <div key={idx} className="pb-4 border-b border-gray-100 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-900">{event.name}</p>
                <p className="text-indigo-600 font-bold">{event.revenue}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 h-2 rounded-full" style={{ width: `${event.sold}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{event.sold}% Capacity</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============== EVENTS TAB ==============
const EventsTab = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const mockEvents = [
    { id: 1, name: "Tech Summit 2024", date: "2024-04-25", venue: "Convention Center", status: "live" },
    { id: 2, name: "Music Festival", date: "2024-05-10", venue: "Central Park", status: "live" },
    { id: 3, name: "Workshop Series", date: "2024-05-15", venue: "Tech Hub", status: "draft" },
  ];

  return (
    <div className="space-y-6">
      {/* Create Event Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          Create New Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEvents.map((event) => (
          <PremiumEventCard
            key={event.id}
            event={event}
            onEdit={() => console.log("Edit:", event)}
            onAnalytics={() => console.log("Analytics:", event)}
            onAttendees={() => console.log("Attendees:", event)}
            onDelete={() => console.log("Delete:", event)}
          />
        ))}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-96 overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Event Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <input
                type="text"
                placeholder="Venue"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <textarea
                placeholder="Description"
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              ></textarea>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============== ATTENDEES TAB ==============
const AttendeesTab = () => {
  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search attendees..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
        <button className="px-6 py-3 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition">
          <DocumentArrowDownIcon className="w-5 h-5 inline mr-2" />
          Export CSV
        </button>
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Event</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Ticket Type</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 1, name: "John Doe", email: "john@example.com", event: "Tech Summit", ticket: "VIP", status: "checked-in" },
              { id: 2, name: "Jane Smith", email: "jane@example.com", event: "Tech Summit", ticket: "Regular", status: "pending" },
              { id: 3, name: "Bob Wilson", email: "bob@example.com", event: "Music Festival", ticket: "VIP", status: "checked-in" },
            ].map((attendee) => (
              <tr key={attendee.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-semibold text-gray-900">{attendee.name}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{attendee.email}</td>
                <td className="px-6 py-4 text-gray-600">{attendee.event}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                    {attendee.ticket}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    attendee.status === "checked-in"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {attendee.status === "checked-in" ? "✓ Checked In" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                    Resend Ticket
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============== ANALYTICS TAB ==============
const AnalyticsTab = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Sales Trend (Last 7 Days)</h3>
          <div className="flex items-end gap-2 h-64">
            {[12, 19, 8, 15, 22, 18, 25].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gradient-to-t from-indigo-600 to-blue-600 rounded-t-lg" style={{ height: `${val * 8}px` }}></div>
                <p className="text-xs text-gray-600">Day {idx + 1}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue by Event</h3>
          <div className="space-y-4">
            {[
              { name: "Tech Summit", value: 45 },
              { name: "Music Festival", value: 35 },
              { name: "Workshop", value: 20 },
            ].map((event, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <p className="font-semibold text-gray-900">{event.name}</p>
                  <p className="text-indigo-600 font-bold">{event.value}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-600 h-3 rounded-full" style={{ width: `${event.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ticket Performance */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Ticket Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { type: "VIP", sold: 120, total: 150, color: "indigo" },
            { type: "Regular", sold: 280, total: 350, color: "blue" },
            { type: "Early Bird", sold: 128, total: 200, color: "green" },
          ].map((ticket, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
              <p className="font-bold text-gray-900 mb-4">{ticket.type}</p>
              <p className="text-3xl font-bold text-indigo-600 mb-2">{ticket.sold}</p>
              <p className="text-sm text-gray-600 mb-4">of {ticket.total} available</p>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div className={`h-2 rounded-full bg-gradient-to-r from-${ticket.color}-600 to-${ticket.color}-400`} style={{ width: `${(ticket.sold / ticket.total) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============== PAYOUTS TAB ==============
const PayoutsTab = () => {
  return (
    <div className="space-y-6">
      {/* Payout Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PremiumStatCard
          icon={CreditCardIcon}
          label="Total Earnings"
          value="₹5,28,000"
          color="green"
        />
        <PremiumStatCard
          icon={SparklesIcon}
          label="Platform Fees"
          value="₹52,800"
          color="blue"
        />
        <PremiumStatCard
          icon={CreditCardIcon}
          label="Net Revenue"
          value="₹4,75,200"
          color="indigo"
        />
      </div>

      {/* Payout Requests */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Payout History</h3>
        <div className="space-y-4">
          {[
            { date: "Apr 15, 2024", amount: "₹1,50,000", status: "completed", method: "Bank Transfer" },
            { date: "Apr 01, 2024", amount: "₹2,00,000", status: "completed", method: "Bank Transfer" },
            { date: "Mar 15, 2024", amount: "₹1,75,000", status: "pending", method: "Bank Transfer" },
          ].map((payout, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="font-semibold text-gray-900">{payout.date}</p>
                <p className="text-sm text-gray-600">{payout.method}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-2xl font-bold text-indigo-600">{payout.amount}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  payout.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Payout Button */}
      <button className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
        <DocumentArrowDownIcon className="w-5 h-5 inline mr-2" />
        Request Payout
      </button>
    </div>
  );
};

// ============== PROMOTIONS TAB ==============
const PromotionsTab = () => {
  return (
    <div className="space-y-6">
      {/* Create Promo Button */}
      <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
        <PlusIcon className="w-5 h-5" />
        Create Discount Code
      </button>

      {/* Active Promotions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Active Promotions</h3>
        <div className="space-y-4">
          {[
            { code: "SUMMER20", discount: "20%", used: 45, event: "Tech Summit", expires: "May 31" },
            { code: "EARLY15", discount: "15%", used: 78, event: "Music Festival", expires: "Apr 30" },
            { code: "VIP30", discount: "30%", used: 12, event: "Workshop", expires: "Jun 15" },
          ].map((promo, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{promo.code}</p>
                  <p className="text-sm text-gray-600">Event: {promo.event}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-indigo-600">{promo.discount}</p>
                  <p className="text-xs text-gray-500">{promo.used} used • Expires {promo.expires}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Sharing */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Social Sharing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["Facebook", "Twitter", "Instagram", "WhatsApp"].map((platform, idx) => (
            <button
              key={idx}
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition font-semibold text-gray-700"
            >
              <ShareIcon className="w-5 h-5 inline mr-2" />
              Share on {platform}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============== SETTINGS TAB ==============
const SettingsTab = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Organizer Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <input
            type="text"
            placeholder="Bank Account"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <button className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== MAIN ORGANIZER DASHBOARD ==============
export default function OrganizerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-blue-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobileSidebarOpen} setIsMobile={setIsMobileSidebarOpen} />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Bars3Icon className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "events" && "Event Management"}
                {activeTab === "tickets" && "Tickets & Sales"}
                {activeTab === "attendees" && "Attendees"}
                {activeTab === "analytics" && "Analytics"}
                {activeTab === "payouts" && "Revenue & Payouts"}
                {activeTab === "promotions" && "Promotions"}
                {activeTab === "settings" && "Settings"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                <BellIcon className="w-6 h-6 text-gray-700" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{session?.user?.name || "Organizer"}</p>
                  <p className="text-xs text-gray-600">Event Manager</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {(session?.user?.name || "O")[0]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "events" && <EventsTab />}
          {activeTab === "tickets" && <AnalyticsTab />}
          {activeTab === "attendees" && <AttendeesTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "payouts" && <PayoutsTab />}
          {activeTab === "promotions" && <PromotionsTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}
