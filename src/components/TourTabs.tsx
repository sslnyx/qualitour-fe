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
  icon: string; // Material icon name
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: 'info' },
  { id: 'itinerary', label: 'Itinerary', icon: 'route' },
  { id: 'photos', label: 'Photos', icon: 'photo_library' },
  { id: 'faq', label: 'FAQ', icon: 'help_outline' },
];

export default function TourTabs({ tour }: { tour: WPTour }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Get sections - works with both old page_builder and new optimized sections
  const sections = tour.goodlayers_data?.sections || (tour.goodlayers_data as any)?.page_builder || [];

  // Check for itinerary
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

  // Check for photos
  const hasPhotos = sections.some(
    (section: any) => 'items' in section && section.items?.some((item: any) =>
      item.type === 'gallery' ||
      item.type === 'image' ||
      (item.type === 'text-box' && item.value?.content?.includes('<img'))
    )
  ) || tour.featured_image_url?.full?.url;

  // Check for FAQ
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
    <div className="overflow-hidden">
      {/* Premium Tab Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Tabs">
          {availableTabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-6 py-5 text-sm font-semibold whitespace-nowrap transition-all duration-300
                ${activeTab === tab.id
                  ? 'text-[#f7941e] bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }
                ${index === 0 ? 'rounded-tl-2xl' : ''}
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className={`material-icons text-xl ${activeTab === tab.id ? 'text-[#f7941e]' : 'text-gray-400'}`}>
                {tab.icon}
              </span>
              {tab.label}

              {/* Active indicator */}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#f7941e] to-[#ff6b35]" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content with animation */}
      <div className="p-6 md:p-8">
        <div className="animate-fadeIn">
          {activeTab === 'overview' && <TourOverview tour={tour} />}
          {activeTab === 'itinerary' && hasItinerary && <TourItinerary tour={tour} />}
          {activeTab === 'photos' && hasPhotos && <TourPhotos tour={tour} />}
          {activeTab === 'faq' && hasFAQ && <TourFAQ tour={tour} />}
        </div>
      </div>
    </div>
  );
}
