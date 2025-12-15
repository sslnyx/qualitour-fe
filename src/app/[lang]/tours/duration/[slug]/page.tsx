import { getTourDurationBySlug, getToursPaged, getTourDurations } from '@/lib/wordpress';
import { TourCard } from '@/components/TourCard';
import { type Locale, i18n } from '@/i18n/config';
import { notFound } from 'next/navigation';
import type { WPTour } from '@/lib/wordpress/types';

/**
 * Pre-generate duration pages at build time.
 * Reduces runtime compute on Cloudflare Workers free tier.
 */
export async function generateStaticParams() {
  try {
    const durations = await getTourDurations({ per_page: 100 });

    return i18n.locales.flatMap((lang) =>
      durations.map((duration) => ({
        lang,
        slug: duration.slug,
      }))
    );
  } catch (error) {
    console.error('[generateStaticParams] Failed to fetch durations:', error);
    return [];
  }
}

interface Props {
  params: Promise<{ lang: Locale; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function TourDurationPage({ params, searchParams }: Props) {
  const { lang, slug } = await params;
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;

  const duration = await getTourDurationBySlug(slug, lang);
  if (!duration) notFound();

  if (process.env.NODE_ENV === 'development') {
    console.log(`[DurationPage] Fetching duration=${slug} tours, page ${currentPage}, lang ${lang}`);
  }
  let tours: WPTour[] = [];
  let error: string | null = null;

  const perPage = 12;
  let totalTours = 0;
  let totalPages = 0;

  try {
    const result = await getToursPaged(
      {
        'tour-duration': duration.id,
        per_page: perPage,
        page: currentPage,
        orderby: 'date',
        order: 'desc',
      },
      lang
    );

    totalTours = result.total;
    totalPages = result.totalPages;
    tours = result.tours;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DurationPage] Got ${tours.length} tours for duration ${slug} on page ${currentPage}`);
    }
  } catch (e) {
    console.error(`[DurationPage] Error fetching tours:`, e);
    error = e instanceof Error ? e.message : 'Failed to fetch tours';
  }

  return (
    <div className="container-qualitour py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{duration.name}</h1>
        <p className="text-sm text-gray-500">
          {totalTours} tours found
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {totalTours === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No tours found in this duration category.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <a
                  key={pageNum}
                  href={`?page=${pageNum}`}
                  className={`px-3 py-2 rounded ${pageNum === currentPage
                      ? 'bg-[#f7941e] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {pageNum}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
