import { getTours } from '@/lib/wordpress';
import type { WPTour } from '@/lib/wordpress';
import { TourCard } from '@/components/TourCard';
import Link from 'next/link';
import { getLocaleFromPathname, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { headers } from 'next/headers';

export const metadata = {
  title: 'Tours | Qualitour',
  description: 'Browse our collection of amazing tours',
};

interface ToursPageProps {
  searchParams: Promise<{ 
    category?: string; 
    tag?: string; 
    page?: string;
    orderby?: string;
  }>;
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  // Detect locale from current path
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const lang: Locale = getLocaleFromPathname(pathname);
  const dict = await getDictionary(lang);
  
  const params = await searchParams;
  let tours: WPTour[] = [];
  let error: string | null = null;
  let totalTours = 0;
  let totalPages = 0;

  // Parse URL parameters for filtering/pagination
  const page = params?.page ? parseInt(params.page) : 1;
  const perPage = 12; // Default from tour-item page builder element

  try {
    // Fetch tours with pagination
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL;
    const url = new URL(`${apiUrl}/tour`);
    url.searchParams.append('per_page', perPage.toString());
    url.searchParams.append('page', page.toString());
    url.searchParams.append('orderby', 'date');
    url.searchParams.append('order', 'desc');
    url.searchParams.append('_embed', 'true');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    // Get total count from headers
    totalTours = parseInt(response.headers.get('X-WP-Total') || '0');
    totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');
    
    tours = await response.json();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to fetch tours';
    console.error('Error fetching tours:', e);
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-lg">
          <h2 className="text-lg font-semibold mb-2">Error Loading Tours</h2>
          <p className="mb-2">{error}</p>
          <p className="text-sm text-red-600">
            Check: {process.env.NEXT_PUBLIC_WORDPRESS_API_URL}
          </p>
        </div>
      </div>
    );
  }

  if (!tours || tours.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Tours Found</h1>
          <p className="text-gray-600">Check back later for exciting tour packages!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900">Our Tours</h1>
          <p className="mt-2 text-lg text-gray-600">
            {totalTours > 0 
              ? `${totalTours} Results Found` 
              : `Discover amazing destinations`}
          </p>
        </div>
      </div>

      {/* Tours Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
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
                href={`/tours?page=${page - 1}`}
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
                    href="/tours?page=1"
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
                    href={`/tours?page=${pageNum}`}
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
                    href={`/tours?page=${totalPages}`}
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
                href={`/tours?page=${page + 1}`}
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
