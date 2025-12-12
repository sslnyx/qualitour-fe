'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { WPTourDestination, WPTourActivity } from '@/lib/wordpress';

interface TourFilterProps {
  destinations: WPTourDestination[];
  activities: WPTourActivity[];
  currentQuery?: string;
  currentDestination?: string;
  currentActivity?: string;
  currentPage?: number;
  lang: string;
}

export function TourFilter({
  destinations,
  activities,
  currentQuery = '',
  currentDestination = '',
  currentActivity = '',
  currentPage = 1,
  lang,
}: TourFilterProps) {
  const [query, setQuery] = useState(currentQuery);
  const [selectedDestination, setSelectedDestination] = useState(currentDestination);
  const [selectedActivity, setSelectedActivity] = useState(currentActivity);
  const [isOpen, setIsOpen] = useState(false);

  const localePrefix = lang === 'en' ? '' : `/${lang}`;

  // Build search URL with current filters
  const buildSearchUrl = (q?: string, dest?: string, act?: string) => {
    const params = new URLSearchParams();
    
    if (q || query) params.append('search', q || query);
    if (dest || selectedDestination) params.append('destination', dest || selectedDestination);
    if (act || selectedActivity) params.append('activity', act || selectedActivity);
    
    const queryString = params.toString();
    return `${localePrefix}/tours${queryString ? '?' + queryString : ''}`;
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Redirect to search results
    window.location.href = buildSearchUrl();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setQuery('');
    setSelectedDestination('');
    setSelectedActivity('');
    window.location.href = `${localePrefix}/tours`;
  };

  const hasActiveFilters = query || selectedDestination || selectedActivity;

  return (
    <div className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Toggle Button (Mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden mb-4 w-full px-4 py-2 flex items-center justify-between bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          <span className="font-semibold text-gray-900">Filters</span>
          <svg
            className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        {/* Filter Form */}
        <form
          onSubmit={handleSearch}
          className={`grid grid-cols-1 lg:grid-cols-4 gap-4 ${!isOpen && 'hidden lg:grid'}`}
        >
          {/* Search Input */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Tours</label>
            <input
              type="text"
              placeholder="Enter tour name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f7941e]"
            />
          </div>

          {/* Destination Filter */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f7941e]"
            >
              <option value="">All Destinations</option>
              {destinations.map((dest) => (
                <option key={dest.id} value={dest.slug}>
                  {dest.name}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Filter */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Activity</label>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f7941e]"
            >
              <option value="">All Activities</option>
              {activities.map((act) => (
                <option key={act.id} value={act.slug}>
                  {act.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-1 flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#f7941e] text-white font-semibold rounded-lg hover:bg-[#d67a1a] transition-colors"
            >
              Search
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {query && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#f7941e]/10 text-[#f7941e] rounded-full text-sm">
                  Search: {query}
                  <button
                    onClick={() => setQuery('')}
                    className="hover:text-[#d67a1a]"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedDestination && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Destination: {destinations.find(d => d.slug === selectedDestination)?.name}
                  <button
                    onClick={() => setSelectedDestination('')}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedActivity && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Activity: {activities.find(a => a.slug === selectedActivity)?.name}
                  <button
                    onClick={() => setSelectedActivity('')}
                    className="hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
