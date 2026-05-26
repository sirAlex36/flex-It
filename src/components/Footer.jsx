"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white mt-16 border-t border-slate-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">
              Flex-It
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Discover, book, and experience amazing events. Your premier platform for connecting with unforgettable moments and vibrant communities.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5c-.563-.074-2.313-.231-4.401-.231-4.425 0-7.468 2.468-7.468 7.2v1.933z"></path></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"></path></svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-white mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/event" className="text-slate-400 hover:text-blue-400 transition">Discover Events</Link></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition">Browse Categories</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition">How It Works</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition">Pricing</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/contact" className="text-slate-400 hover:text-blue-400 transition">Contact Us</Link></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition">About Us</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition">Blog</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition">Press Kit</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition">Terms of Service</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition">Cookie Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition">Security</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              &copy; {currentYear} Flex-It. All rights reserved.
            </p>
            <p className="text-slate-400 text-sm">
              Crafted with <span className="text-red-500">♥</span> for event enthusiasts
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
