"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Card() {
  const params = useParams();
  const eventId = params?.eventId;
  const router = useRouter();
  const [event, setEvent] = useState(null);
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

  useEffect(() => {
    if (!eventId) return;
    
    fetch(`http://localhost:3002/events/${Number(eventId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Event not found");
        return res.json();
      })
      .then((data) => setEvent(data))
      .catch((error) => console.error("Error fetching event:", error));
  }, [eventId]);

  if (!event) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <h4 className="text-xl">Loading event details...</h4>
        </div>
        <Footer />
      </>
    );
  }

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3002/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit form");

      alert("Ticket order submitted successfully!");
      setFormData({
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
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <main className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-80 object-cover"
                />
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-bold mb-3">{event.name}</h3>
                  <p className="text-gray-500 mb-2">{event.date}</p>
                  <p className="font-semibold mb-3">{event.location}</p>
                  <p className="text-gray-700 mb-3">{event.description}</p>
                  <p className="mb-2">Organiser: <strong>{event.Organiser}</strong></p>
                  <p className="text-gray-600 mb-4">{event.Extras}</p>
                  <h5 className="text-green-600 text-xl font-bold mb-4">{event.price}</h5>

                  <button
                    onClick={() => router.back()}
                    className="px-6 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    Back to Events
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg">
                <h4 className="font-bold text-xl mb-6 text-center text-blue-600">Book Your Ticket</h4>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-semibold mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="Enter first name"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-semibold mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="Enter last name"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="example@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="e.g. +254 712 345 678"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="ticketType" className="block text-sm font-semibold mb-2">
                          Ticket Type
                        </label>
                        <select
                          id="ticketType"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          value={formData.ticketType}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select type...</option>
                          <option value="regular">Regular - Ksh 1000</option>
                          <option value="vip">VIP - Ksh 3000</option>
                          <option value="vvip">VVIP - Ksh 5000</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="quantity" className="block text-sm font-semibold mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          min="1"
                          placeholder="Enter quantity"
                          value={formData.quantity}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="paymentMethod" className="block text-sm font-semibold mb-2">
                        Payment Method
                      </label>
                      <select
                        id="paymentMethod"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Choose payment method...</option>
                        <option value="mpesa">M-Pesa</option>
                        <option value="card">Credit/Debit Card</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="requests" className="block text-sm font-semibold mb-2">
                        Special Requests (optional)
                      </label>
                      <textarea
                        id="requests"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        rows="3"
                        placeholder="Any additional requests or notes..."
                        value={formData.requests}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="terms"
                        className="w-4 h-4 rounded"
                        checked={formData.terms}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="terms" className="ml-2 text-sm">
                        I agree to the <a href="#" className="text-blue-600 hover:underline">terms and conditions</a>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-6 bg-amber-500 text-gray-900 font-bold py-3 rounded-lg hover:bg-amber-600 transition"
                    >
                      Proceed to checkout
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3002/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit form");

      alert("Ticket order submitted successfully!");
      setFormData({
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
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong. Please try again.");
    }
  };



  return (
    <div className="container py-5">
      <div className="row g-4">

        <div className="col-md-6">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <img
              src={event.image}
              alt={event.name}
              className="card-img-top rounded"
              style={{ height: "300px", objectFit: "cover" }}
            />
            <div className="card-body text-center">
              <h3 className="card-title mb-3">{event.name}</h3>
              <p className="text-muted mb-2">{event.date}</p>
              <p className="fw-semibold mb-3">{event.location}</p>
              <p className="card-text mb-3">{event.description}</p>
              <p className="mb-1">Organiser: <strong>{event.Organiser}</strong></p>
              <p className="mb-3 text-secondary">{event.Extras}</p>
              <h5 className="text-success mb-3">{event.price}</h5>

              <div className="d-flex justify-content-center gap-3">
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                  Back to Events
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="bg-white text-dark p-4 rounded shadow">
            <h4 className="fw-bold mb-4 text-primary text-center">Book Your Ticket</h4>

            <form onSubmit={handleSubmit}>
              <div className="row g-3" >

                <div className="col-md-6">
                  <label htmlFor="firstName" className="form-label fw-semibold">First Name</label>
                  <input type="text"
                    id="firstName"
                    className="form-control"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label htmlFor="lastName" className="form-label fw-semibold">Last Name</label>
                  <input type="text"
                    id="lastName"
                    className="form-control"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required />
                </div>


                <div className="col-md-6">
                  <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
                  <input type="email"
                    id="email"
                    className="form-control"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required />
                </div>


                <div className="col-md-6">
                  <label htmlFor="phone" className="form-label fw-semibold">Phone Number</label>
                  <input type="tel" id="phone" className="form-control" placeholder="e.g. +254 712 345 678" value={formData.phone}
                    onChange={handleChange} required />
                </div>


                <div className="col-md-6">
                  <label htmlFor="ticketType" className="form-label fw-semibold">Ticket Type</label>
                  <select id="ticketType" className="form-select" value={formData.ticketType}
                    onChange={handleChange} required>
                    <option value="">Select type...</option>
                    <option value="regular">Regular - Ksh 1000</option>
                    <option value="vip">VIP - Ksh 3000</option>
                    <option value="vvip">VVIP - Ksh 5000</option>
                  </select>
                </div>


                <div className="col-md-6">
                  <label htmlFor="quantity" className="form-label fw-semibold">Quantity</label>
                  <input type="number" id="quantity" className="form-control" min="1" placeholder="Enter quantity" value={formData.quantity}
                    onChange={handleChange} required />
                </div>

                <div className="col-12">
                  <label htmlFor="paymentMethod" className="form-label fw-semibold">Payment Method</label>
                  <select id="paymentMethod" className="form-select" value={formData.paymentMethod}
                    onChange={handleChange} required>
                    <option value="">Choose payment method...</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>


                <div className="col-12">
                  <label htmlFor="requests" className="form-label fw-semibold">Special Requests (optional)</label>
                  <textarea
                    id="requests"
                    className="form-control"
                    rows="3"
                    placeholder="Any additional requests or notes..."
                    value={formData.requests}
                    onChange={handleChange}
                  ></textarea>
                </div>


                <div className="col-12">
                  <div className="form-check">
                    <input type="checkbox" id="terms" className="form-check-input" checked={formData.terms}
                      onChange={handleChange} required />
                    <label htmlFor="terms" className="form-check-label">
                      I agree to the <a href="#" className="text-primary text-decoration-none">terms and conditions</a>.
                    </label>
                  </div>
                </div>


                <div className="text-center mt-4">
                  <button className="btn btn-warning text-dark fw-bold px-4 py-2" type="submit">
                    Proceed to checkout
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>


  );
}

export default Card;