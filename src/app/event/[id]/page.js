"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const DEFAULT_CAPACITY_BY_TIER = {
  vip: 50,
  premium: 100,
  general: 200,
  standard: 180,
};

const getTierCapacity = (ticketType) => {
  if (!ticketType) return 150;
  const key = ticketType.trim().toLowerCase();
  if (key.includes("vip")) return DEFAULT_CAPACITY_BY_TIER.vip;
  if (key.includes("premium")) return DEFAULT_CAPACITY_BY_TIER.premium;
  if (key.includes("general")) return DEFAULT_CAPACITY_BY_TIER.general;
  if (key.includes("standard")) return DEFAULT_CAPACITY_BY_TIER.standard;
  return 150;
};

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [availability, setAvailability] = useState({
    total: 0,
    sold: 0,
    remaining: 0,
    perTier: {},
    soldPercentage: 0,
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ticketType: "",
    quantity: 1,
    paymentMethod: "",
    requests: "",
    terms: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [mpesaStatus, setMpesaStatus] = useState("");
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  // Get user from JWT token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser({
          id: decoded.sub,  // Fixed: use 'sub' which is the user ID
          role: decoded.role
        });
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`${API_URL}/events/${params.id}`);
      if (!res.ok) throw new Error("Event fetch failed");
      const data = await res.json();
      setEvent(data);
    } catch (error) {
      console.error(error);
      setEvent(null);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/tickets`);
      if (!res.ok) throw new Error("Tickets fetch failed");
      const allTickets = await res.json();
      const eventTickets = allTickets.filter((t) => Number(t.event_id || t.eventId || t.event_id) === Number(params.id));
      setTickets(eventTickets);
    } catch (error) {
      console.error(error);
      setTickets([]);
    }
  };

  useEffect(() => {
    if (!params.id) return;
    fetchEvent();
    fetchTickets();
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    const interval = setInterval(() => {
      fetchEvent();
      fetchTickets();
    }, 9000);

    return () => clearInterval(interval);
  }, [params.id]);

  useEffect(() => {
    if (!event) return;

    const tierStats = {};
    event.ticket_prices?.forEach((tier) => {
      tierStats[tier.ticket_type] = {
        sold: 0,
        capacity: getTierCapacity(tier.ticket_type),
      };
    });

    let totalPurchased = 0;
    tickets.forEach((ticket) => {
      const type = ticket.ticket_type || ticket.type;
      if (!tierStats[type]) {
        tierStats[type] = {
          sold: 0,
          capacity: getTierCapacity(type),
        };
      }
      tierStats[type].sold += 1;
      totalPurchased += 1;
    });

    const totalCapacity = Object.values(tierStats).reduce((sum, tier) => sum + tier.capacity, 0);
    const remaining = Math.max(0, totalCapacity - totalPurchased);

    setAvailability({
      total: totalCapacity,
      sold: totalPurchased,
      remaining,
      perTier: tierStats,
      soldPercentage: totalCapacity ? Math.round((totalPurchased / totalCapacity) * 100) : 0,
    });
  }, [event, tickets]);

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading event details...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (id === "ticketType") {
      setFormData((prev) => ({ ...prev, ticketType: value, quantity: 1 }));
      setMpesaStatus("");
      return;
    }
    if (id === "quantity") {
      setFormData({ ...formData, [id]: Math.max(1, parseInt(value) || 1) });
      return;
    }
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const handleTicketCardClick = (ticketType) => {
    setFormData({
      ...formData,
      ticketType,
      quantity: 1,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const chosenTier = event.ticket_prices?.find((tier) => tier.ticket_type === formData.ticketType);
    if (!chosenTier) {
      return alert("Please pick a ticket tier before checkout.");
    }

    const perTier = availability.perTier[formData.ticketType] || { sold: 0, capacity: getTierCapacity(formData.ticketType) };
    const remaining = perTier.capacity - perTier.sold;
    if (formData.quantity > remaining) {
      return alert(`Only ${remaining} tickets remain for ${formData.ticketType}. Please reduce quantity.`);
    }

    setIsProcessing(true);
    setMpesaStatus("Processing...");

    const payload = {
      event_id: Number(params.id),
      ticket_type: chosenTier.ticket_type,
      payment_method: formData.paymentMethod,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      requests: formData.requests,
      quantity: formData.quantity,
    };

    try {
      // Get token for authentication
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Step 1: Create the ticket
      const ticketRes = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!ticketRes.ok) throw new Error("Ticket creation failed");
      const ticketData = await ticketRes.json();
      const ticketId = ticketData.id;
      const actualPrice = ticketData.price;
      const totalAmount = actualPrice * formData.quantity;

      // Step 2: Trigger M-Pesa STK Push if selected
      if (formData.paymentMethod === "mpesa") {
        setMpesaStatus("Sending M-Pesa prompt...");
        const mpesaRes = await fetch(`${API_URL}/mpesa/stk-push`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: formData.phone,
            amount: totalAmount,
            ticket_id: ticketId,
            first_name: formData.firstName,
            last_name: formData.lastName,
          }),
        });

        if (mpesaRes.ok) {
          const mpesaData = await mpesaRes.json();
          setMpesaStatus(`STK Push sent! Check phone (ref: ${mpesaData.request_id || "pending"})`);
        } else {
          setMpesaStatus("STK Push initiated (demo mode)");
        }
      }

      // Step 3: Generate QR code
      setMpesaStatus("Generating QR code...");
      const qrRes = await fetch(`${API_URL}/tickets/${ticketId}/qr-code`, {
        method: "GET",
      });
      let qrCode = null;
      if (qrRes.ok) {
        const qrData = await qrRes.json();
        qrCode = qrData.qr_code;
      }

      // Step 4: Send email confirmation
      setMpesaStatus("Sending confirmation email...");
      const emailRes = await fetch(`${API_URL}/tickets/${ticketId}/send-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          qr_code: qrCode,
        }),
      });

      if (emailRes.ok) {
        setMpesaStatus("Email sent!");
      }

      // Set booking confirmation
      setBookingConfirmation({
        ticketId,
        qrCode,
        totalAmount: totalAmount,
        ticketType: chosenTier.ticket_type,
      });

      setMpesaStatus("✅ Booking complete!");
      fetchTickets();
    } catch (err) {
      console.error(err);
      setMpesaStatus(`❌ Error: ${err.message}`);
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedTierObj = event.ticket_prices?.find((tier) => tier.ticket_type === formData.ticketType);
  const selectedTierRemaining = selectedTierObj
    ? Math.max((getTierCapacity(selectedTierObj.ticket_type) || 0) - (availability.perTier[selectedTierObj.ticket_type]?.sold || 0), 0)
    : 0;
  
  // Calculate live total
  const totalAmount = selectedTierObj ? selectedTierObj.price * formData.quantity : 0;

  // Show booking confirmation modal
  if (bookingConfirmation) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">Your tickets have been secured and confirmation sent to your email.</p>
          
          {bookingConfirmation.qrCode && (
            <>
              <div className="bg-gray-100 p-4 rounded-lg mb-6 inline-block">
                <img src={bookingConfirmation.qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-sm text-gray-500 mb-4">Scan at event entry</p>
            </>
          )}
          
          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-gray-600"><strong>Ticket Type:</strong> {bookingConfirmation.ticketType}</p>
            <p className="text-sm text-gray-600"><strong>Total:</strong> Ksh {bookingConfirmation.totalAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-600"><strong>Ticket ID:</strong> #{bookingConfirmation.ticketId}</p>
          </div>
          
          <button
            onClick={() => {
              setBookingConfirmation(null);
              router.push("/event");
            }}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            Back to Events
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">

        {/* LEFT: EVENT + TICKETS */}
        <section className="lg:col-span-3 space-y-6">

          {/* Event Card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <img
              src={event.image || "https://via.placeholder.com/900x400"}
              className="w-full h-64 object-cover"
            />

            <div className="p-6 space-y-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {event.name}
              </h1>

              <p className="text-gray-500 text-sm">
                📍 {event.venue} • 📅 {event.date}
              </p>

              <p className="text-gray-600 text-sm leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>

          {/* Ticket Selection */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              Select Ticket
            </h2>

            <div className="space-y-3">
              {event.ticket_prices?.map((tier) => {
                const sold = availability.perTier[tier.ticket_type]?.sold || 0;
                const capacity = getTierCapacity(tier.ticket_type);
                const remainingTier = Math.max(capacity - sold, 0);
                const isSelected = formData.ticketType === tier.ticket_type;
                const isSoldOut = remainingTier === 0;

                return (
                  <button
                    key={tier.id}
                    onClick={() => handleTicketCardClick(tier.ticket_type)}
                    disabled={isSoldOut}
                    className={`w-full flex justify-between items-center p-4 rounded-xl border transition ${
                      isSoldOut 
                        ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                        : isSelected
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-black"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">
                        {tier.ticket_type}
                      </p>
                      <p className="text-xs opacity-70">
                        {isSoldOut ? "Sold out" : `${remainingTier} left`}
                      </p>
                    </div>

                    <p className="text-lg font-bold">
                      Ksh {tier.price.toLocaleString()}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT: CHECKOUT */}
        <section className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-10 space-y-6">

            <h2 className="text-xl font-semibold">
              Checkout
            </h2>

            {/* Quantity */}
            <div>
              <label className="text-sm text-gray-600">Quantity</label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full mt-1 border rounded-lg px-3 py-2"
              />
            </div>

            {/* User Info */}
            <div className="grid grid-cols-2 gap-3">
              <input
                id="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
              <input
                id="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <input
              id="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              id="phone"
              placeholder="Phone (+254...)"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />

            {/* Payment */}
            <select
              id="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Payment method</option>
              <option value="mpesa">M-Pesa</option>
              <option value="card">Card</option>
            </select>

            {/* Terms */}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                id="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="w-4 h-4 rounded"
              />
              <span>I agree to terms and conditions</span>
            </label>

            {/* Total - Live Update */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold mb-2">
                <span>Subtotal</span>
                <span className="text-emerald-600">Ksh {((selectedTierObj?.price || 0) * formData.quantity).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>{selectedTierObj?.ticket_type || "No tier"} × {formData.quantity}</span>
              </div>
            </div>

            {/* M-Pesa Status */}
            {mpesaStatus && (
              <div className={`p-3 rounded-lg text-sm font-medium ${
                mpesaStatus.includes("✅") ? "bg-green-100 text-green-800" :
                mpesaStatus.includes("❌") ? "bg-red-100 text-red-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {mpesaStatus}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !formData.ticketType || !formData.terms}
              className={`w-full py-3 rounded-xl font-semibold transition ${
                isProcessing 
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-black text-white hover:opacity-90"
              }`}
            >
              {isProcessing ? "Processing..." : "Pay Now →"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
