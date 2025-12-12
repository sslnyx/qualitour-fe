import { WPTour } from '@/lib/wordpress';
import TourDetailFields from './TourDetailFields';
import { ContentWithImageCarousel } from './ContentWithImageCarousel';

interface ContentBlock {
  type: 'title' | 'text' | 'icon-list';
  content: any;
  order: number;
}

export default function TourOverview({ tour }: { tour: WPTour }) {
  const tourOverview = tour.goodlayers_data?.tour_overview;
  const tourHighlight = tour.goodlayers_data?.tour_highlight;
  const tourInclude = tour.goodlayers_data?.tour_include;
  const tourExclude = tour.goodlayers_data?.tour_exclude;

  // Get sections - works with both old page_builder and new optimized sections
  const sections = tour.goodlayers_data?.sections || (tour.goodlayers_data as any)?.page_builder || [];

  // Find the detail/details section for structured content
  const detailSection = sections.find(
    (section: any) => section.value?.id === 'detail' || section.value?.id === 'details'
  );

  // Parse content blocks in order from detail section
  const contentBlocks: ContentBlock[] = [];
  
  if (detailSection?.items) {
    detailSection.items.forEach((item: any, idx: number) => {
      // Skip tour_title and dividers
      if (item.type === 'tour_title' || item.type === 'divider') return;
      
      // Handle text boxes
      if (item.type === 'text-box' && item.value?.content) {
        contentBlocks.push({
          type: 'text',
          content: item.value.content,
          order: idx,
        });
      }
      
      // Handle titles
      if (item.type === 'title' && (item.value?.title || item.value?.caption)) {
        contentBlocks.push({
          type: 'title',
          content: item.value?.title || item.value?.caption,
          order: idx,
        });
      }
      
      // Handle icon lists
      if (item.type === 'icon-list' && item.value?.tabs?.length > 0) {
        contentBlocks.push({
          type: 'icon-list',
          content: item.value.tabs,
          order: idx,
        });
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Main Description - Hero Text */}
      {tour.content?.rendered && (
        <div className="bg-orange-50 rounded-xl p-8 border border-orange-200">
          <ContentWithImageCarousel
            content={tour.content.rendered}
            className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
          />
        </div>
      )}

      {/* Render content blocks in order */}
      {contentBlocks.map((block, idx) => {
        switch (block.type) {
          case 'title':
            return (
              <h3 key={idx} className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-3">
                <span className="w-1 h-8 bg-[#f7941e] rounded-full"></span>
                {block.content}
              </h3>
            );
          
          case 'text':
            return (
              <ContentWithImageCarousel
                key={idx}
                content={block.content}
                className="prose prose-base max-w-none text-gray-700 leading-relaxed"
              />
            );
          
          case 'icon-list':
            return (
              <div key={idx} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <ul className="grid md:grid-cols-2 gap-4">
                  {block.content.map((listItem: any, listIdx: number) => (
                    <li key={listIdx} className="flex items-start gap-3 group">
                      <span className="text-[#f7941e] shrink-0 text-lg group-hover:scale-110 transition-transform">
                        {listItem.icon === 'icon_clock' ? (
                          // Use SVG for clock icon instead of icon font
                          <svg className="w-6 h-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        ) : listItem.icon ? (
                          <i className={listItem.icon} style={{ fontSize: '20px' }} />
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span className="text-gray-700 flex-1">{listItem.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          
          default:
            return null;
        }
      })}

      {/* Tour Overview from Tourmaster */}
      {tourOverview && (
        <div className="bg-blue-50 rounded-xl p-8 border border-blue-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <svg className="w-7 h-7 text-[#f7941e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Overview
          </h3>
          <ContentWithImageCarousel
            content={tourOverview}
            className="prose prose-base max-w-none text-gray-700"
          />
        </div>
      )}

      {/* Tour Highlights */}
      {tourHighlight && (
        <div className="bg-yellow-50 rounded-xl p-8 border border-yellow-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <svg className="w-7 h-7 text-[#f7941e]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Highlights
          </h3>
          <ContentWithImageCarousel
            content={tourHighlight}
            className="prose prose-base max-w-none text-gray-700"
          />
        </div>
      )}

      {/* Include/Exclude Grid */}
      {(tourInclude || tourExclude) && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* What's Included */}
          {tourInclude && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-3">
                <span className="bg-green-500 text-white rounded-full p-1.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                What&apos;s Included
              </h4>
              <ContentWithImageCarousel
                content={tourInclude}
                className="prose prose-sm prose-green max-w-none text-gray-700"
              />
            </div>
          )}

          {/* What's Excluded */}
          {tourExclude && (
            <div className="bg-red-50 rounded-xl p-6 border border-red-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-3">
                <span className="bg-red-500 text-white rounded-full p-1.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
                What&apos;s Excluded
              </h4>
              <ContentWithImageCarousel
                content={tourExclude}
                className="prose prose-sm prose-red max-w-none text-gray-700"
              />
            </div>
          )}
        </div>
      )}

      {/* Tour Detail Fields (Departure, Dates, Rates, etc.) */}
      <TourDetailFields tour={tour} />
    </div>
  );
}
