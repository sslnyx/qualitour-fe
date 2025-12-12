'use client';

import { useState } from 'react';
import { WPTour } from '@/lib/wordpress';

export default function TourFAQ({ tour }: { tour: WPTour }) {
  const [openIndex, setOpenIndex] = useState<number>(-1);

  // Extract FAQ from Tourmaster or page builder
  const tourFAQ = tour.goodlayers_data?.tour_faq;
  const tourTerms = tour.goodlayers_data?.tour_terms;

  // Get sections - works with both old page_builder and new optimized sections
  const sections = tour.goodlayers_data?.sections || (tour.goodlayers_data as any)?.page_builder || [];

  // Find FAQ section from page builder
  const faqSection = sections.find(
    (section: any) => section.value?.id === 'faq'
  );

  // Extract accordion items (FAQs)
  const faqItems: Array<{ title: string; content: string }> = [];
  
  if (faqSection && 'items' in faqSection) {
    faqSection.items?.forEach((item: any) => {
      // Check for both 'accordion' (actual FAQ element) and 'toggle-box' (fallback)
      if ((item.type === 'accordion' || item.type === 'toggle-box') && item.value?.tabs) {
        item.value.tabs.forEach((tab: any) => {
          if (tab.title && tab.content) {
            faqItems.push({
              title: tab.title,
              content: tab.content,
            });
          }
        });
      }
    });
  }

  const hasContent = faqItems.length > 0 || tourFAQ || tourTerms;

  if (!hasContent) {
    return (
      <div className="text-center py-8 text-gray-500">
        No FAQ information available.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h3>

      {/* FAQ Accordion */}
      {faqItems.length > 0 && (
        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            
            return (
              <div 
                key={idx}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="font-semibold text-gray-900 pr-4">{item.title}</span>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Additional FAQ Content */}
      {tourFAQ && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h4>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: tourFAQ }}
          />
        </div>
      )}

      {/* Terms & Conditions */}
      {tourTerms && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Terms &amp; Conditions
          </h4>
          <div 
            className="prose prose-sm prose-amber max-w-none"
            dangerouslySetInnerHTML={{ __html: tourTerms }}
          />
        </div>
      )}
    </div>
  );
}
