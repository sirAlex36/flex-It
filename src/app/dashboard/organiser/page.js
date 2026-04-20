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
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

const OrgamiserDashboard = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalEvents: 12,
    totalTicketsSold: 2849,
    totalRevenue: 142450,
    upcomingEvents: 4,
    pendingPayouts: 25000,
  });

  // 🔐 PROTECT ORGANISER ROUTE
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "organiser") {
      router.push(`/dashboard/${session?.user?.role}`);
    }
  }, [status, session, router]);

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
                  value={dashboardData.totalEvents}
                  icon={Calendar}
                  bgColor="bg-blue-100"
                  iconColor="text-blue-600"
                  trend={12}
                />
                <StatCard
                  title="Tickets Sold"
                  value={dashboardData.totalTicketsSold.toLocaleString()}
                  icon={Ticket}
                  bgColor="bg-pink-100"
                  iconColor="text-pink-600"
                  trend={25}
                />
                <StatCard
                  title="Total Revenue"
                  value={`KES ${dashboardData.totalRevenue.toLocaleString()}`}
                  icon={DollarSign}
                  bgColor="bg-green-100"
                  iconColor="text-green-600"
                  trend={18}
                />
                <StatCard
                  title="Upcoming Events"
                  value={dashboardData.upcomingEvents}
                  subtitle="In next 30 days"
                  icon={Clock}
                  bgColor="bg-orange-100"
                  iconColor="text-orange-600"
                  trend={5}
                />
                <StatCard
                  title="Pending Payouts"
                  value={`KES ${dashboardData.pendingPayouts.toLocaleString()}`}
                  icon={DollarSign}
                  bgColor="bg-indigo-100"
                  iconColor="text-indigo-600"
                  trend={-8}
                />
              </div>

              {/* BOTTOM SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* RECENT EVENTS */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Your Events</h2>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors">
                      <Plus size={18} />
                      Create Event
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      {
                        name: "Annual Tech Conference 2024",
                        venue: "Safari Park Hotel, Nairobi",
                        ticketsSold: 324,
                        revenue: "1.2K",
                      },
                      {
                        name: "Summer Music Festival",
                        venue: "Uhuru Park, Nairobi",
                        ticketsSold: 589,
                        revenue: "2.4K",
                      },
                    ].map((event, idx) => (
                      <EventCard key={idx} event={event} />
                    ))}
                  </div>
                </div>

                {/* RECENT ACTIVITY */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 h-fit">
                  <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-2">
                    {[
                      {
                        title: "Ticket Sold",
                        description: "3 tickets sold to Tech Conference",
                        time: "2 mins ago",
                        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
                        bgColor: "bg-green-50",
                      },
                      {
                        title: "Event Published",
                        description: "Music Festival went live",
                        time: "1 hour ago",
                        icon: <AlertCircle className="w-5 h-5 text-blue-600" />,
                        bgColor: "bg-blue-50",
                      },
                      {
                        title: "Payout Processed",
                        description: "KES 15,000 transferred",
                        time: "3 hours ago",
                        icon: <ArrowDownLeft className="w-5 h-5 text-emerald-600" />,
                        bgColor: "bg-emerald-50",
                      },
                    ].map((activity, idx) => (
                      <RecentActivityItem key={idx} activity={activity} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div className="text-center py-12 text-gray-600">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Events management coming soon</p>
            </div>
          )}

          {activeTab === "tickets" && (
            <div className="text-center py-12 text-gray-600">
              <Ticket size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Ticket analytics coming soon</p>
            </div>
          )}

          {activeTab === "attendees" && (
            <div className="text-center py-12 text-gray-600">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Attendee management coming soon</p>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="text-center py-12 text-gray-600">
              <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Advanced analytics coming soon</p>
            </div>
          )}

          {activeTab === "payouts" && (
            <div className="text-center py-12 text-gray-600">
              <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Payout management coming soon</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="text-center py-12 text-gray-600">
              <Settings size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Settings coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgamiserDashboard;
