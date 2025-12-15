import { getTourBySlug, getTours } from '@/lib/wordpress';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import TourTabs from '@/components/TourTabs';
import TourReviews from '@/components/TourReviews';
import TourSidebarForm from '@/components/TourSidebarForm';
import type { Locale } from '@/i18n/config';
import { i18n } from '@/i18n/config';

/**
 * Pre-generate tour detail pages at build time.
 * This reduces runtime compute on Cloudflare Workers free tier.
 * Pages not pre-generated will be rendered on-demand and cached.
 */
export async function generateStaticParams() {
  try {
    // Fetch up to 100 tours for static generation
    const tours = await getTours({ per_page: 100 });

    // Generate params for all locales
    return i18n.locales.flatMap((lang) =>
      tours.map((tour) => ({
        lang,
        slug: tour.slug,
      }))
    );
  } catch (error) {
    console.error('[generateStaticParams] Failed to fetch tours:', error);
    return [];
  }
}

function normalizeMediaUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\s+/g, '');
}

function proxyIfProtectedMedia(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith('.localsite.io')) {
      return `/api/media?url=${encodeURIComponent(url)}`;
    }
  } catch {
    // ignore
  }
  return url;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale; slug: string }> }) {
  try {
    const { slug, lang } = await params;
    const tour = await getTourBySlug(slug, lang);

    if (!tour) {
      return {
        title: 'Tour Not Found',
      };
    }

    return {
      title: `${tour.title.rendered} | Qualitour`,
      description: tour.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160),
    };
  } catch {
    return {
      title: 'Tour Not Found',
    };
  }
}

export default async function TourPage({ params }: { params: Promise<{ lang: Locale; slug: string }> }) {
  const { slug, lang } = await params;
  let tour;
  let error: string | null = null;
  let isFallbackToEnglish = false;

  // Build the locale prefix for links
  const localePrefix = lang === 'en' ? '' : `/${lang}`;

  try {
    tour = await getTourBySlug(slug, lang);
    if (!tour && lang !== 'en') {
      // Try fallback to English
      const enTour = await getTourBySlug(slug, 'en');
      if (enTour) {
        tour = enTour;
        isFallbackToEnglish = true;
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to fetch tour';
    console.error('Error fetching tour:', e);
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-lg">
          <h2 className="text-lg font-semibold mb-2">Error Loading Tour</h2>
          <p className="mb-2">{error}</p>
          <Link href={`${localePrefix}/tours`} className="text-[#f7941e] hover:underline">
            ← Back to Tours
          </Link>
        </div>
      </div>
    );
  }

  if (!tour) {
    // Redirect to tours listing if tour not found (e.g., translation doesn't exist)
    redirect(`${localePrefix}/tours`);
  }

  const imageUrl =
    normalizeMediaUrl((tour.featured_image_url as any)?.full) ||
    normalizeMediaUrl(tour.featured_image_url?.full?.url);

  const renderImageUrl = imageUrl ? proxyIfProtectedMedia(imageUrl) : null;

  // Get sections - works with both old page_builder and new optimized sections
  const sections = tour.goodlayers_data?.sections || (tour.goodlayers_data as any)?.page_builder || [];

  // Extract tour details from page builder detail/details section
  const detailSection = sections.find(
    (section: any) => section.value?.id === 'detail' || section.value?.id === 'details'
  );
  const detailItems = detailSection && 'items' in detailSection ? detailSection.items : [];
  const iconListItem = detailItems.find((item: any) => item.type === 'icon-list');
  const tourDetails = iconListItem?.value?.tabs || [];

  // Parse tour details from icon-list
  const durationDetail = tourDetails.find((d: any) => d.title?.includes('Days') || d.title?.includes('Night'))?.title;
  const groupSizeDetail = tourDetails.find((d: any) => d.title?.toLowerCase().includes('people') || d.title?.toLowerCase().includes('pax'))?.title;
  const datesDetail = tourDetails.find((d: any) => d.title?.toLowerCase().includes('every') || d.title?.match(/\d{2}\/[A-Za-z]{3}\/\d{4}/))?.title;
  const tourCodeDetail = tourDetails.find((d: any) => d.title?.toLowerCase().includes('tour code'))?.title;

  // Fallback to tour_meta
  const price = tour.tour_meta?.price;
  const duration = durationDetail || tour.tour_meta?.duration_text || tour.tour_meta?.duration;
  const location = tour.tour_meta?.location;
  const country = tour.tour_meta?.country;
  const minPeople = tour.tour_meta?.min_people;
  const maxPeople = tour.tour_meta?.max_people;
  const groupSize = groupSizeDetail || (minPeople && maxPeople ? `${minPeople} - ${maxPeople} people` : maxPeople || minPeople);
  const rating = typeof tour.tour_meta?.rating === 'object'
    ? tour.tour_meta.rating.score
    : tour.tour_meta?.rating;
  const reviewCount = typeof tour.tour_meta?.rating === 'object'
    ? tour.tour_meta.rating.reviewer
    : tour.tour_meta?.review_count;

  const categories = tour.tour_terms?.categories || [];
  const destinationSlug = tour.tour_terms?.destinations?.[0]?.slug || '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container-qualitour py-4">
          <Link
            href={`${localePrefix}/tours`}
            className="text-[#f7941e] hover:text-[#d67a1a] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Tours
          </Link>
        </div>
      </div>

      {/* Fallback to English notice */}
      {isFallbackToEnglish && (
        <div className="container-qualitour py-4">
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
            This tour is only available in English. Showing English version.
          </div>
        </div>
      )}

      {/* Hero Image */}
      {renderImageUrl && (
        <div className="relative h-96 bg-gray-200">
          <Image
            src={renderImageUrl}
            alt={tour.title.rendered}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container-qualitour">
              <h1
                className="text-2xl md:text-5xl font-bold text-white mb-4"
                dangerouslySetInnerHTML={{ __html: tour.title.rendered }}
              />
              {(location || country) && (
                <p className="text-xl text-white/90">
                  {[location, country].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container-qualitour py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {!renderImageUrl && (
              <h1
                className="text-4xl font-bold text-gray-900 mb-6"
                dangerouslySetInnerHTML={{ __html: tour.title.rendered }}
              />
            )}

            {/* Tabbed Content */}
            <TourTabs tour={tour} />
          </div>

          {/* Sidebar - Tour Info with Inquiry Form */}
          <div className="lg:col-span-1">
            <TourSidebarForm
              tourId={tour.id}
              tourTitle={tour.title.rendered.replace(/<[^>]*>/g, '')}
              price={price}
              duration={duration}
              groupSize={groupSize}
              datesDetail={datesDetail}
              tourCodeDetail={tourCodeDetail}
              categories={categories}
              pdfUrl={tour.acf_fields?.pdf_file?.url}
            />
          </div>
        </div>

        {/* Reviews Section - Full Width Below */}
        <div className="mt-16 pt-12 border-t">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">What Our Guests Say</h2>
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Tour-specific reviews (filtered by destination/keywords) */}
            <TourReviews
              tourTitle={tour.title.rendered}
              tourDestination={
                destinationSlug
              }
              limit={5}
              lang={lang}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
