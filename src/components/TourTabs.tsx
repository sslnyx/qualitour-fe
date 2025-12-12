'use client';

import { useState } from 'react';
import { WPTour } from '@/lib/wordpress';
import TourOverview from './TourOverview';
import TourItinerary from './TourItinerary';
import TourPhotos from './TourPhotos';
import TourFAQ from './TourFAQ';

type TabId = 'overview' | 'itinerary' | 'photos' | 'faq';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'itinerary',
    label: 'Itinerary',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: 'photos',
    label: 'Photos',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'faq',
    label: 'FAQ',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function TourTabs({ tour }: { tour: WPTour }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Get sections - works with both old page_builder and new optimized sections
  const sections = tour.goodlayers_data?.sections || (tour.goodlayers_data as any)?.page_builder || [];

  // Check what content is available
  
  // Check for itinerary in sections (toggle-box) or old tour_itinerary field
  const hasItinerary = sections.some(
    (section: any) => {
      if (section.value?.id === 'itinerary') {
        const items = section.items || [];
        return items.some((item: any) => item.type === 'toggle-box' && item.value?.tabs?.length > 0);
      }
      return false;
    }
  ) || (
    tour.goodlayers_data?.tour_itinerary && 
    Array.isArray(tour.goodlayers_data.tour_itinerary) &&
    tour.goodlayers_data.tour_itinerary.length > 0
  );
  
  // Check for photos in multiple ways
  const hasPhotos = sections.some(
    (section: any) => 'items' in section && section.items?.some((item: any) => 
      item.type === 'gallery' || 
      item.type === 'image' || 
      (item.type === 'text-box' && item.value?.content?.includes('<img'))
    )
  ) || tour.featured_image_url?.full?.url || tour._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  
  // Check for FAQ in sections (accordion) or old tour_faq field
  const hasFAQ = sections.some(
    (section: any) => {
      if (section.value?.id === 'faq') {
        const items = section.items || [];
        return items.some((item: any) => 
          (item.type === 'accordion' || item.type === 'toggle-box') && 
          item.value?.tabs?.length > 0
        );
      }
      return false;
    }
  ) || tour.goodlayers_data?.tour_faq || tour.goodlayers_data?.tour_terms;

  // Filter tabs based on available content
  const availableTabs = tabs.filter(tab => {
    if (tab.id === 'overview') return true;
    if (tab.id === 'itinerary') return hasItinerary;
    if (tab.id === 'photos') return hasPhotos;
    if (tab.id === 'faq') return hasFAQ;
    return false;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-[#f7941e] text-[#f7941e]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && <TourOverview tour={tour} />}
        {activeTab === 'itinerary' && hasItinerary && <TourItinerary tour={tour} />}
        {activeTab === 'photos' && hasPhotos && <TourPhotos tour={tour} />}
        {activeTab === 'faq' && hasFAQ && <TourFAQ tour={tour} />}
      </div>
    </div>
  );
}
