"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Flex-It
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
              Home
            </Link>
            <Link href="/event" className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
              Events
            </Link>
            <Link href="/contact" className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex gap-3 items-center">
            <Link href="/login" className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 transition">
              Login
            </Link>
            <Link href="/sign-up" className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md">
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition">
              Home
            </Link>
            <Link href="/event" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition">
              Events
            </Link>
            <Link href="/contact" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition">
              Contact
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t">
              <Link href="/login" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition text-center">
                Login
              </Link>
              <Link href="/sign-up" className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-medium">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
