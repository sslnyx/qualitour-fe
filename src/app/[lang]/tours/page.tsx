import { getAllTourDestinations, getTourActivities, getToursPaged, getTourDestinationBySlug, getTourActivityBySlug } from '@/lib/wordpress';
import type { WPTour, WPTourDestination, WPTourActivity } from '@/lib/wordpress';
import { TourFilterSidebar } from '@/components/TourFilterSidebar';
import { type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';

// Revalidate every 15 minutes with ISR
export const revalidate = 900;

export const metadata = {
  title: 'Tours | Qualitour',
  description: 'Browse our collection of amazing tours',
};

// OPTIMIZED: Only fetch 12 tours per page for Cloudflare Workers free tier (10ms CPU limit)
const TOURS_PER_PAGE = 12;

interface ToursPageProps {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{
    search?: string;
    destination?: string;
    activity?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function ToursPage({ params, searchParams }: ToursPageProps) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;

  // Extract filter parameters
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const searchQuery = resolvedSearchParams.search || '';
  const destinationSlug = resolvedSearchParams.destination || '';
  const activitySlug = resolvedSearchParams.activity || '';
  const sortOrder = resolvedSearchParams.sort || 'date';

  const dict = await getDictionary(lang);

  let tours: WPTour[] = [];
  let totalTours = 0;
  let totalPages = 1;
  let destinations: WPTourDestination[] = [];
  let activities: WPTourActivity[] = [];
  let error: string | null = null;

  // For showing active filter names
  let activeDestination: WPTourDestination | null = null;
  let activeActivity: WPTourActivity | null = null;

  try {
    // Build API params based on URL filters
    const tourParams: Record<string, any> = {
      per_page: TOURS_PER_PAGE,
      page: currentPage,
    };

    // Add search filter
    if (searchQuery) {
      tourParams.search = searchQuery;
    }

    // Add sorting
    if (sortOrder === 'price-asc') {
      tourParams.orderby = 'meta_value_num';
      tourParams.meta_key = 'tour-price-text';
      tourParams.order = 'asc';
    } else if (sortOrder === 'price-desc') {
      tourParams.orderby = 'meta_value_num';
      tourParams.meta_key = 'tour-price-text';
      tourParams.order = 'desc';
    } else if (sortOrder === 'name') {
      tourParams.orderby = 'title';
      tourParams.order = 'asc';
    } else {
      tourParams.orderby = 'date';
      tourParams.order = 'desc';
    }

    // Prepare promises for parallel fetching
    const fetchPromises: Promise<any>[] = [
      // Reduced from 100 to 20 top destinations
      getAllTourDestinations({ per_page: 20, lang }, { maxPages: 1 }),
      // Reduced from 100 to 15 activities
      getTourActivities({ per_page: 15, lang }),
    ];

    // If filtering by destination, get the ID first
    if (destinationSlug) {
      fetchPromises.push(getTourDestinationBySlug(destinationSlug, lang));
    }

    // If filtering by activity, get the ID first
    if (activitySlug) {
      fetchPromises.push(getTourActivityBySlug(activitySlug, lang));
    }

    // Execute parallel fetches for taxonomies
    const [destinationsResult, activitiesResult, ...filterResults] = await Promise.all(fetchPromises);

    destinations = destinationsResult;
    activities = activitiesResult;

    // Extract filter term IDs
    let filterIndex = 0;
    if (destinationSlug && filterResults[filterIndex]) {
      activeDestination = filterResults[filterIndex] as WPTourDestination;
      if (activeDestination?.id) {
        tourParams.tour_destination = activeDestination.id;
      }
      filterIndex++;
    }

    if (activitySlug && filterResults[filterIndex]) {
      activeActivity = filterResults[filterIndex] as WPTourActivity;
      if (activeActivity?.id) {
        tourParams.tour_activity = activeActivity.id;
      }
    }

    // Now fetch tours with all filters applied
    const toursResult = await getToursPaged(
      tourParams,
      lang !== 'en' ? lang : undefined
    );

    tours = toursResult.tours;
    totalTours = toursResult.total;
    totalPages = toursResult.totalPages;

    // Fallback to English if no tours found and not already English
    if ((!tours || tours.length === 0) && lang !== 'en' && currentPage === 1 && !searchQuery && !destinationSlug && !activitySlug) {
      const fallbackResult = await getToursPaged({ per_page: TOURS_PER_PAGE, page: 1 });
      tours = fallbackResult.tours;
      totalTours = fallbackResult.total;
      totalPages = fallbackResult.totalPages;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to fetch tours';
    console.error('Error fetching tours:', e);
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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

  return (
    <TourFilterSidebar
      tours={tours}
      totalTours={totalTours}
      currentPage={currentPage}
      totalPages={totalPages}
      destinations={destinations}
      activities={activities}
      lang={lang}
      // Pass active filters for UI state
      activeSearch={searchQuery}
      activeDestination={activeDestination}
      activeActivity={activeActivity}
      activeSort={sortOrder}
    />
  );
}
