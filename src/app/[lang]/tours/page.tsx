import { getAllTourDestinations, getTourActivities, getToursPaged } from '@/lib/wordpress';
import type { WPTour, WPTourDestination, WPTourActivity } from '@/lib/wordpress';
import { TourFilterSidebar } from '@/components/TourFilterSidebar';
import { type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';

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

  let allTours: WPTour[] = [];
  let destinations: WPTourDestination[] = [];
  let activities: WPTourActivity[] = [];
  let error: string | null = null;

  try {
    // Fetch all data in parallel for faster loading
    const [toursResult, destinationsResult, activitiesResult] = await Promise.all([
      // Fetch all tours at once (up to 300) for client-side filtering
      getToursPaged({ per_page: 300, lang: lang !== 'en' ? lang : undefined }),
      getAllTourDestinations({ per_page: 100, lang }, { maxPages: 1 }),
      getTourActivities({ per_page: 100, lang }),
    ]);

    allTours = toursResult.tours;
    destinations = destinationsResult;
    activities = activitiesResult;

    // Fallback to English if no tours found and not already English
    if ((!allTours || allTours.length === 0) && lang !== 'en') {
      const fallbackResult = await getToursPaged({ per_page: 300 });
      allTours = fallbackResult.tours;
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

  if (!allTours || allTours.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Tours Found</h1>
          <p className="text-gray-600">Check back later for exciting tour packages!</p>
        </div>
      </div>
    );
  }

  return (
    <TourFilterSidebar
      tours={allTours}
      destinations={destinations}
      activities={activities}
      lang={lang}
    />
  );
}
