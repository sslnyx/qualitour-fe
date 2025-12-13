import { getTours, getTourDestinations, getTourActivities, searchToursAdvanced } from '@/lib/wordpress';
import type { WPTour, WPTourDestination, WPTourActivity } from '@/lib/wordpress';
import { TourCard } from '@/components/TourCard';
import { TourFilter } from '@/components/TourFilter';
import Link from 'next/link';
import { type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';

export const runtime = 'edge';

export const metadata = {
  title: 'Tours | Qualitour',
  description: 'Browse our collection of amazing tours',
};

interface ToursPageProps {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ 
    search?: string;
    destination?: string;
    activity?: string;
    page?: string;
    orderby?: string;
  }>;
}

export default async function ToursPage({ params, searchParams }: ToursPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const searchParamsResolved = await searchParams;
  
  let tours: WPTour[] = [];
  let destinations: WPTourDestination[] = [];
  let activities: WPTourActivity[] = [];
  let error: string | null = null;
  let totalTours = 0;
  let totalPages = 0;
  let isFallbackToEnglish = false;

  // Parse URL parameters for filtering/pagination
  const page = searchParamsResolved?.page ? parseInt(searchParamsResolved.page) : 1;
  const perPage = 12;
  const searchQuery = searchParamsResolved?.search || '';
  const selectedDestination = searchParamsResolved?.destination || '';
  const selectedActivity = searchParamsResolved?.activity || '';

  // Build the locale prefix for links
  const localePrefix = lang === 'en' ? '' : `/${lang}`;

  try {
    // Fetch destinations and activities for filter dropdowns
    destinations = await getTourDestinations({ per_page: 100 });
    activities = await getTourActivities({ per_page: 100 });

    // Use advanced search API if filters are applied
    if (searchQuery || selectedDestination || selectedActivity) {
      console.log('[ToursPage] Searching with filters:', { searchQuery, selectedDestination, selectedActivity, page });
      
      const searchResult = await searchToursAdvanced({
        query: searchQuery,
        destination: selectedDestination,
        activity: selectedActivity,
        page,
        per_page: perPage,
        lang: lang !== 'en' ? lang : undefined,
      });

      tours = searchResult.tours;
      totalTours = searchResult.total;
      totalPages = searchResult.totalPages;

      console.log('[ToursPage] Search results:', { total: totalTours, found: tours.length, pages: totalPages });
    } else {
      // Fetch all tours without filters
      console.log('[ToursPage] Fetching all tours, page:', page);
      
      const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL;
      const url = new URL(`${apiUrl}/tour`);
      
      // Handle Basic Auth for Local Live Link
      let authHeader = {};
      let username = url.username;
      let password = url.password;
      
      if (!username || !password) {
        username = process.env.WORDPRESS_AUTH_USER || '';
        password = process.env.WORDPRESS_AUTH_PASS || '';
      }
      
      if (username && password) {
        const credentials = Buffer.from(`${username}:${password}`).toString('base64');
        authHeader = { 'Authorization': `Basic ${credentials}` };
        url.username = '';
        url.password = '';
      }

      url.searchParams.append('per_page', perPage.toString());
      url.searchParams.append('page', page.toString());
      url.searchParams.append('orderby', 'date');
      url.searchParams.append('order', 'desc');
      url.searchParams.append('_embed', 'true');
      
      if (lang && lang !== 'en') {
        url.searchParams.append('lang', lang);
      }

      let response = await fetch(url.toString(), {
        headers: {
          ...authHeader
        }
      });
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      totalTours = parseInt(response.headers.get('X-WP-Total') || '0');
      totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');
      tours = await response.json();

      // Fallback to English if no tours found and not already English
      if ((!tours || tours.length === 0) && lang !== 'en') {
        const enUrl = new URL(`${apiUrl}/tour`);
        
        // Handle Basic Auth for fallback URL
        if (enUrl.username && enUrl.password) {
          enUrl.username = '';
          enUrl.password = '';
        }
        // Use environment variables for auth if URL doesn't have them
        if (!username && !password) {
          username = process.env.WORDPRESS_AUTH_USER || '';
          password = process.env.WORDPRESS_AUTH_PASS || '';
        }

        enUrl.searchParams.append('per_page', perPage.toString());
        enUrl.searchParams.append('page', page.toString());
        enUrl.searchParams.append('orderby', 'date');
        enUrl.searchParams.append('order', 'desc');
        enUrl.searchParams.append('_embed', 'true');
        response = await fetch(enUrl.toString(), {
          headers: {
            ...authHeader
          }
        });
        if (response.ok) {
          totalTours = parseInt(response.headers.get('X-WP-Total') || '0');
          totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');
          tours = await response.json();
          isFallbackToEnglish = true;
        }
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to fetch tours';
    console.error('Error fetching tours:', e);
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TourFilter
          destinations={destinations}
          activities={activities}
          currentQuery={searchQuery}
          currentDestination={selectedDestination}
          currentActivity={selectedActivity}
          currentPage={page}
          lang={lang}
        />
        <div className="flex items-center justify-center p-4 min-h-[60vh]">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-lg">
            <h2 className="text-lg font-semibold mb-2">Error Loading Tours</h2>
            <p className="mb-2">{error}</p>
            <p className="text-sm text-red-600">
              Check: {process.env.NEXT_PUBLIC_WORDPRESS_API_URL}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!tours || tours.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TourFilter
          destinations={destinations}
          activities={activities}
          currentQuery={searchQuery}
          currentDestination={selectedDestination}
          currentActivity={selectedActivity}
          currentPage={page}
          lang={lang}
        />
        <div className="flex items-center justify-center p-4 min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Tours Found</h1>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedDestination || selectedActivity
                ? 'Try adjusting your filters or search terms'
                : 'Check back later for exciting tour packages!'}
            </p>
            <Link href={`${localePrefix}/tours`} className="inline-block px-6 py-2 bg-[#f7941e] text-white rounded-lg hover:bg-[#d67a1a]">
              View All Tours
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Build pagination URLs with current filters
  const buildPaginationUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.append('page', pageNum.toString());
    if (searchQuery) params.append('search', searchQuery);
    if (selectedDestination) params.append('destination', selectedDestination);
    if (selectedActivity) params.append('activity', selectedActivity);
    return `${localePrefix}/tours?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filter Component */}
      <TourFilter
        destinations={destinations}
        activities={activities}
        currentQuery={searchQuery}
        currentDestination={selectedDestination}
        currentActivity={selectedActivity}
        currentPage={page}
        lang={lang}
      />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {searchQuery || selectedDestination || selectedActivity ? 'Search Results' : 'Our Tours'}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {totalTours > 0 
              ? `${totalTours} Tours Found` 
              : `Discover amazing destinations`}
          </p>
          {isFallbackToEnglish && (
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
              No tours found for this language. Showing English tours instead.
            </div>
          )}
        </div>
      </div>

      {/* Tours Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              lang={lang}
              style="grid-with-frame"
              showRating={true}
              showInfo={['duration-text']}
              excerptWords={14}
              imageSize="large"
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {/* Previous Button */}
            {page > 1 && (
              <Link
                href={buildPaginationUrl(page - 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                ← Previous
              </Link>
            )}

            {/* Page Numbers */}
            <div className="flex gap-2">
              {/* First page */}
              {page > 3 && (
                <>
                  <Link
                    href={buildPaginationUrl(1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    1
                  </Link>
                  {page > 4 && <span className="px-2 py-2">...</span>}
                </>
              )}

              {/* Pages around current page */}
              {Array.from({ length: 5 }, (_, i) => {
                const pageNum = page - 2 + i;
                if (pageNum < 1 || pageNum > totalPages) return null;
                return (
                  <Link
                    key={pageNum}
                    href={buildPaginationUrl(pageNum)}
                    className={`px-4 py-2 border rounded-lg ${
                      pageNum === page
                        ? 'bg-[#f7941e] text-white border-[#f7941e]'
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}

              {/* Last page */}
              {page < totalPages - 2 && (
                <>
                  {page < totalPages - 3 && <span className="px-2 py-2">...</span>}
                  <Link
                    href={buildPaginationUrl(totalPages)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    {totalPages}
                  </Link>
                </>
              )}
            </div>

            {/* Next Button */}
            {page < totalPages && (
              <Link
                href={buildPaginationUrl(page + 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Next →
              </Link>
            )}
          </div>
        )}

        {/* Page Info */}
        {totalTours > 0 && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, totalTours)} of {totalTours} tours
          </p>
        )}
      </div>
    </div>
  );
}
