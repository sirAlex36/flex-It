"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchFilter({ onFiltersChange }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    venue: searchParams.get("venue") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    router.push(`/event${queryString ? "?" + queryString : ""}`);
    onFiltersChange?.(filters);
  };

  const handleReset = () => {
    setFilters({
      search: "",
      venue: "",
      minPrice: "",
      maxPrice: "",
      startDate: "",
      endDate: "",
    });
    router.push("/event");
    onFiltersChange?.({});
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Filter Events</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden text-blue-600 hover:text-blue-700 font-medium"
        >
          {showFilters ? "Hide" : "Show"} Filters
        </button>
      </div>

      {/* Filters Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 ${!showFilters && "hidden md:grid"}`}>
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Name
          </label>
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Venue */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Venue
          </label>
          <input
            type="text"
            placeholder="Location..."
            value={filters.venue}
            onChange={(e) => handleFilterChange("venue", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Price (Ksh)
          </label>
          <input
            type="number"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Price (Ksh)
          </label>
          <input
            type="number"
            placeholder="10000"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className={`flex gap-3 mt-4 ${!showFilters && "hidden md:flex"}`}>
        <button
          onClick={handleApplyFilters}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
