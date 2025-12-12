'use client';

import { useState } from 'react';
import { WPTour } from '@/lib/wordpress';

export default function TourItinerary({ tour }: { tour: WPTour }) {
  const [openDay, setOpenDay] = useState<number>(0);
  
  // Get sections - works with both old page_builder and new optimized sections
  const sections = tour.goodlayers_data?.sections || (tour.goodlayers_data as any)?.page_builder || [];
  
  // Find itinerary section
  const itinerarySection = sections.find(
    (section: any) => section.value?.id === 'itinerary'
  );

  // Extract toggle-box items (itinerary days)
  let itinerary: any[] = [];
  if (itinerarySection) {
    const items = itinerarySection.items || [];
    items.forEach((item: any) => {
      if (item.type === 'toggle-box' && item.value?.tabs) {
        itinerary = item.value.tabs;
      }
    });
  }

  // Fallback to old tour_itinerary field
  if (itinerary.length === 0 && Array.isArray(tour.goodlayers_data?.tour_itinerary)) {
    itinerary = tour.goodlayers_data.tour_itinerary;
  }

  if (itinerary.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No itinerary information available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Day by Day Itinerary</h3>
      
      <div className="space-y-3">
        {itinerary.map((day, idx) => {
          const isOpen = openDay === idx;
          const dayNumber = day['head-text'] || `Day ${idx + 1}`;
          
          return (
            <div 
              key={idx}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#f7941e] transition-colors"
            >
              {/* Accordion Header */}
              <button
                onClick={() => setOpenDay(isOpen ? -1 : idx)}
                className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 text-left">
                  <span className="shrink-0 w-12 h-12 bg-orange-50 text-[#f7941e] rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-sm text-gray-500">{dayNumber}</div>
                    <div className="font-semibold text-gray-900">{day.title}</div>
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Accordion Content */}
              {isOpen && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: day.content }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
