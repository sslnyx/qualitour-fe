import { getTourTypeBySlug } from '@/lib/wordpress';
import { TourCard } from '@/components/TourCard';
import { type Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';
import type { WPTour } from '@/lib/wordpress/types';

const VIKING_HERO_BG = 'http://qualitour.local/wp-content/uploads/2020/10/tour_cover2-scaled.jpg';
const VIKING_INTRO_IMAGE = 'http://qualitour.local/wp-content/uploads/2023/07/81e60901eb82dcb92a7314843431d657c2be56c3799dbd9f384049e537f7f127-scaled.webp';

const VIKING_BULLETS = [
  'Meals & regional specialties',
  'Curated library',
  'Cultural curriculum',
  'Enrichment lectures',
  'Destination performances',
  'Visits to UNESCO sites',
  'Rear-view stateroom',
  '24-hour service',
];

export default async function TourTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale; slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang, slug: type } = await params;
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page) || 1);
  const localePrefix = getLocalePrefix(lang);

  const isVikingCruisesPage = type === 'cruises';

  const tourType = await getTourTypeBySlug(type);
  if (!tourType) {
    return (
      <div className="container-qualitour py-8">
        <h1 className="text-3xl font-bold mb-4">Tour Type Not Found</h1>
        <p className="text-gray-600">The tour type you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    );
  }

  const perPage = 12;
  let tours: WPTour[] = [];
  let error: string | null = null;
  let totalTours = 0;
  let totalPages = 0;

  try {
    // Use direct fetch to read WP pagination headers (X-WP-Total / X-WP-TotalPages)
    // and avoid the REST API hard cap of 100 items per request.
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL;
    if (!apiUrl) {
      throw new Error('WordPress API URL is not configured');
    }

    const url = new URL(`${apiUrl}/tour`);
    // Dedicated taxonomy: rest_base is `tour-type`, so query param is `tour-type`.
    url.searchParams.set('tour-type', String(tourType.id));
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('page', String(page));
    url.searchParams.set('_embed', 'true');
    url.searchParams.set('_fields', 'id,slug,title,excerpt,featured_media,tour_category,tour_tag,featured_image_url,tour_meta,_embedded');
    url.searchParams.set('orderby', 'date');
    url.searchParams.set('order', 'desc');
    url.searchParams.set('lang', lang);

    // Basic Auth (Local Live Link / protected endpoints)
    const urlObj = new URL(url.toString());
    let authHeader: Record<string, string> = {};

    let username = urlObj.username;
    let password = urlObj.password;

    if (!username || !password) {
      username = process.env.WORDPRESS_AUTH_USER || '';
      password = process.env.WORDPRESS_AUTH_PASS || '';
    }

    if (username && password) {
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
      authHeader = { Authorization: `Basic ${credentials}` };
      urlObj.username = '';
      urlObj.password = '';
    }

    const timeoutMs = Number(process.env.WP_FETCH_TIMEOUT_MS || 8000);
    const controller = Number.isFinite(timeoutMs) && timeoutMs > 0 ? new AbortController() : null;
    const timeoutId = controller
      ? setTimeout(() => {
          controller.abort();
        }, timeoutMs)
      : null;

    const response = await fetch(urlObj.toString(), {
      next: { revalidate: 3600 },
      signal: controller?.signal,
      headers: {
        ...authHeader,
        'User-Agent': 'Mozilla/5.0 (compatible; Qualitour-API/1.0)',
      },
    }).finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    totalTours = Number(response.headers.get('X-WP-Total') || '0');
    totalPages = Number(response.headers.get('X-WP-TotalPages') || '0');
    tours = (await response.json()) as WPTour[];
  } catch (e) {
    console.error('Error fetching tours:', e);
    error = e instanceof Error ? e.message : 'Failed to load tours. Please try again.';
  }

  return (
    <div className="container-qualitour py-8">
      {isVikingCruisesPage ? (
        <>
          <section
            className="relative overflow-hidden rounded-lg mb-10"
            style={{
              backgroundImage: `url(${VIKING_HERO_BG})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative px-6 py-16 md:px-12 md:py-24">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Viking Cruises</h1>
              <p className="text-lg md:text-2xl text-white/90 max-w-3xl">
                Embark on the voyage of a lifetime with Viking Cruises Canada. Book your dream cruise today and let the adventure begin!
              </p>
            </div>
          </section>

          <section className="mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-lg border border-gray-200">
              <div className="hidden lg:block">
                <div
                  className="h-full min-h-[340px]"
                  style={{
                    backgroundImage: `url(${VIKING_INTRO_IMAGE})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </div>
              <div className="bg-gray-50 p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Embark on Unforgettable Voyages</h2>
                <p className="text-gray-700 mb-6">
                  Discover the allure of the open seas, where luxury meets exploration. Set sail on breathtaking itineraries that take you to the world&apos;s most captivating destinations. Immerse yourself in the rich history and culture of each port of call, indulge in exquisite experiences. Whether you crave a European river cruise or a majestic ocean voyage, our expertly curated itineraries promise unforgettable moments and lifelong memories. Explore our website and secure your spot on a remarkable journey with Viking Cruises Canada today. Your dream cruise awaits!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {VIKING_BULLETS.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <i className="fa fa-check-circle text-[#f7941e] mt-1" aria-hidden="true" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="mb-8">
            <p className="text-sm text-gray-500">{`${totalTours} tours found`}</p>
          </div>
        </>
      ) : (
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{tourType.name}</h1>
          {tourType.description && (
            <p className="text-lg text-gray-600 mb-4">{tourType.description}</p>
          )}
          <p className="text-sm text-gray-500">{`${totalTours} tours found`}</p>
        </div>
      )}

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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              {/* Previous Button */}
              {page > 1 && (
                <a
                  href={`${localePrefix}/tours/type/${type}?page=${page - 1}`}
                  className="px-4 py-2 rounded border border-gray-300 hover:border-[#f7941e] text-gray-700 hover:text-[#f7941e] transition"
                >
                  ← Previous
                </a>
              )}

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`${localePrefix}/tours/type/${type}?page=${p}`}
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

              {/* Next Button */}
              {page < totalPages && (
                <a
                  href={`${localePrefix}/tours/type/${type}?page=${page + 1}`}
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
          <p className="text-gray-600">
            No tours available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
