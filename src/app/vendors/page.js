"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, using dummy data. Replace with actual API call when backend is ready
    const dummyVendors = [
      {
        id: 1,
        name: "EventTech Solutions",
        description: "Professional event management and ticketing services",
        category: "Event Management",
        location: "Nairobi, Kenya",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1556761175-b413da4baf72"
      },
      {
        id: 2,
        name: "SoundMasters Audio",
        description: "High-quality sound equipment and DJ services",
        category: "Audio Services",
        location: "Mombasa, Kenya",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f"
      },
      {
        id: 3,
        name: "Catering Delights",
        description: "Exquisite catering services for all event types",
        category: "Catering",
        location: "Kisumu, Kenya",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0"
      },
      {
        id: 4,
        name: "DecorMasters",
        description: "Creative event decoration and setup services",
        category: "Decorations",
        location: "Nakuru, Kenya",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3"
      },
      {
        id: 5,
        name: "PhotoPro Studios",
        description: "Professional photography and videography",
        category: "Photography",
        location: "Eldoret, Kenya",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a"
      },
      {
        id: 6,
        name: "Transport Solutions",
        description: "Reliable transportation and logistics for events",
        category: "Transportation",
        location: "Nairobi, Kenya",
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000"
      }
    ];

    setVendors(dummyVendors);
    setLoading(false);
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4">Event Vendors</h1>
            <p className="text-xl text-gray-600">Find the perfect vendors for your next event</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading vendors...</p>
              </div>
            </div>
          ) : vendors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition group border border-gray-100">
                  <div className="relative overflow-hidden h-48 bg-gray-200">
                    <img
                      src={vendor.image}
                      alt={vendor.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {vendor.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 text-gray-900">{vendor.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                      <span>📍</span> {vendor.location}
                    </p>
                    <p className="text-gray-500 text-sm mb-4">{vendor.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm font-medium">{vendor.rating}</span>
                      </div>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-md">
                      Contact Vendor →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏪</div>
              <p className="text-gray-600 text-lg font-medium">No vendors found at the moment.</p>
              <p className="text-gray-500 mt-2">Check back soon for amazing vendors!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}