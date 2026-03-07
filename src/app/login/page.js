"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await fetch("http://localhost:3002/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        window.location.href = "/";
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("Error logging in. Please try again.");
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10 text-white text-center">
              <h1 className="text-3xl font-bold">Welcome Back</h1>
              <p className="text-blue-100 mt-2">Sign in to your Flex-It account</p>
            </div>

            {/* Form Container */}
            <div className="px-8 py-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition placeholder-gray-500"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-gray-900">Password</label>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot?</a>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:shadow-lg transition font-bold text-lg shadow-md"
                >
                  Sign In
                </button>
              </form>

              {/* Divider */}
              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">New to Flex-It?</span>
                </div>
              </div>
              
              <p className="text-center text-gray-600 mt-8 font-medium">
                Don't have an account?{" "}
                <a href="/sign-up" className="text-blue-600 hover:text-blue-700 font-bold underline">
                  Create one here
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