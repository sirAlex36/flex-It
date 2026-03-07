"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:3002/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setError("Error creating account. Please try again.");
      }
    } catch (err) {
      setError("Error creating account. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center py-12 px-4 sm:px-0">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header Gradient */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-10 text-white text-center">
              <h1 className="text-3xl font-bold">Join Flex-It</h1>
              <p className="text-green-100 mt-2">Create account and discover amazing events</p>
            </div>

            {/* Form Container */}
            <div className="px-8 py-10">
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
                  <p className="text-green-700 font-bold">✓ Account created successfully!</p>
                  <p className="text-green-600 text-sm">Redirecting to login...</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition placeholder-gray-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition placeholder-gray-500"
                    placeholder="you@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition placeholder-gray-500"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition placeholder-gray-500"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                )}

                <div className="pt-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" required className="w-4 h-4 border-2 border-gray-300 rounded text-blue-600 cursor-pointer" />
                    <span className="text-sm text-gray-700">I agree to the <a href="#" className="text-blue-600 font-medium hover:underline">Terms & Conditions</a></span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg hover:shadow-lg transition font-bold text-lg shadow-md mt-6"
                >
                  Create Account
                </button>
              </form>

              {/* Divider */}
              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already registered?</span>
                </div>
              </div>
              
              <p className="text-center text-gray-600 mt-8 font-medium">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 hover:text-blue-700 font-bold underline">
                  Login here
                </a>
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure & encrypted
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}