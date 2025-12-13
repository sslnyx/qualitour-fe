import { getTourDurationBySlug } from '@/lib/wordpress';
import { TourCard } from '@/components/TourCard';
import { type Locale } from '@/i18n/config';
import { notFound } from 'next/navigation';
import type { WPTour } from '@/lib/wordpress/types';

interface Props {
  params: Promise<{ lang: Locale; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function TourDurationPage({ params, searchParams }: Props) {
  const { lang, slug } = await params;
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;

  const duration = await getTourDurationBySlug(slug);
  if (!duration) notFound();

  console.log(`[DurationPage] Fetching duration=${slug} tours, page ${currentPage}, lang ${lang}`);
  let tours: WPTour[] = [];
  let error: string | null = null;

  const perPage = 12;
  let totalTours = 0;
  let totalPages = 0;

  try {
    // Use direct fetch to read WP pagination headers and avoid 100-item cap.
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL;
    if (!apiUrl) {
      throw new Error('WordPress API URL is not configured');
    }

    const url = new URL(`${apiUrl}/tour`);
    url.searchParams.set('tour-duration', String(duration.id));
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('page', String(currentPage));
    url.searchParams.set('_embed', 'true');
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

    const response = await fetch(urlObj.toString(), {
      next: { revalidate: 3600 },
      headers: {
        ...authHeader,
        'User-Agent': 'Mozilla/5.0 (compatible; Qualitour-API/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    totalTours = Number(response.headers.get('X-WP-Total') || '0');
    totalPages = Number(response.headers.get('X-WP-TotalPages') || '0');
    tours = (await response.json()) as WPTour[];
    console.log(`[DurationPage] Got ${tours.length} tours for duration ${slug} on page ${currentPage}`);
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
                  className={`px-3 py-2 rounded ${
                    pageNum === currentPage
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
