import { TourCard } from '@/components/TourCard';
import { getTourTagBySlug, getToursPaged } from '@/lib/wordpress';
import type { WPTour } from '@/lib/wordpress/types';
import { type Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  const title = lang === 'zh' ? '精選行程 | Qualitour' : 'Featured Tours | Qualitour';
  const description =
    lang === 'zh'
      ? '探索我們精選的熱門行程與特色體驗。'
      : 'Explore our featured tours and curated travel experiences.';

  return { title, description };
}

export default async function FeaturedToursPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  const localePrefix = getLocalePrefix(lang);
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page) || 1);

  const perPage = 12;
  let tours: WPTour[] = [];
  let totalTours = 0;
  let totalPages = 1;
  let error: string | null = null;

  try {
    const featuredTag = await getTourTagBySlug('featured-tour');
    if (!featuredTag) {
      tours = [];
      totalTours = 0;
      totalPages = 1;
    } else {
    const result = await getToursPaged(
      {
        tour_tag: featuredTag.id,
        per_page: perPage,
        page,
        orderby: 'date',
        order: 'desc',
      } as any,
      lang
    );

      tours = result.tours;
      totalTours = result.total;
      totalPages = result.totalPages;
    }
  } catch (e) {
    console.error('[FeaturedTours] Error fetching tours:', e);
    error = e instanceof Error ? e.message : 'Failed to load featured tours.';
  }

  return (
    <div className="container-qualitour py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {lang === 'zh' ? '精選行程' : 'Featured Tours'}
        </h1>
        <p className="text-sm text-gray-500">{`${totalTours} tours found`}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {tours.length > 0 ? (
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
            <div className="flex justify-center items-center gap-2 mt-12">
              {page > 1 && (
                <a
                  href={`${localePrefix}/tours/featured?page=${page - 1}`}
                  className="px-4 py-2 rounded border border-gray-300 hover:border-[#f7941e] text-gray-700 hover:text-[#f7941e] transition"
                >
                  ← Previous
                </a>
              )}

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`${localePrefix}/tours/featured?page=${p}`}
                    className={`px-3 py-2 rounded transition ${
                      p === page
                        ? 'bg-[#f7941e] text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {p}
                  </a>
                ))}
              </div>

              {page < totalPages && (
                <a
                  href={`${localePrefix}/tours/featured?page=${page + 1}`}
                  className="px-4 py-2 rounded border border-gray-300 hover:border-[#f7941e] text-gray-700 hover:text-[#f7941e] transition"
                >
                  Next →
                </a>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No featured tours available at the moment.</p>
        </div>
      )}
    </div>
  );
}
