import { getTourBySlug, getTours } from '@/lib/wordpress';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import TourTabs from '@/components/TourTabs';
import TourReviews from '@/components/TourReviews';
import TourSidebarForm from '@/components/TourSidebarForm';
import type { Locale } from '@/i18n/config';
import { i18n } from '@/i18n/config';
import { wpUrl } from '@/lib/wp-url';

// Revalidate tour pages every 15 minutes
// This enables ISR so pages are served from cache with minimal CPU usage
export const revalidate = 900;

/**
 * Pre-generate tour detail pages at build time.
 * Limit to 50 most recent tours per language to avoid memory issues.
 * Remaining tours will be generated on-demand and cached.
 */
export async function generateStaticParams() {
  try {
    // Limit to 50 tours to avoid memory/CPU issues during build
    const tours = await getTours({ per_page: 50, orderby: 'date', order: 'desc' });
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

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale; slug: string }> }) {
  try {
    const { slug, lang } = await params;
    const tour = await getTourBySlug(slug, lang);

    if (!tour) {
      return { title: 'Tour Not Found' };
    }

    return {
      title: `${tour.title.rendered} | Qualitour`,
      description: tour.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160),
    };
  } catch {
    return { title: 'Tour Not Found' };
  }
}

export default async function TourPage({ params }: { params: Promise<{ lang: Locale; slug: string }> }) {
  const { slug, lang } = await params;
  let tour;
  let error: string | null = null;
  let isFallbackToEnglish = false;

  const localePrefix = lang === 'en' ? '' : `/${lang}`;

  try {
    tour = await getTourBySlug(slug, lang);
    if (!tour && lang !== 'en') {
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-lg shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="material-icons text-red-500 text-3xl">error_outline</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Error Loading Tour</h2>
          <p className="text-gray-500 text-center mb-6">{error}</p>
          <Link
            href={`${localePrefix}/tours`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#f7941e] text-white font-semibold rounded-xl hover:bg-[#e68a1c] transition-colors"
          >
            <span className="material-icons">arrow_back</span>
            Back to Tours
          </Link>
        </div>
      </div>
    );
  }

  if (!tour) {
    redirect(`${localePrefix}/tours`);
  }

  const imageUrl =
    normalizeMediaUrl((tour.featured_image_url as any)?.full) ||
    normalizeMediaUrl(tour.featured_image_url?.full?.url);

  const renderImageUrl = imageUrl ? wpUrl(imageUrl) : null;

  // Get sections
  const sections = tour.goodlayers_data?.sections || (tour.goodlayers_data as any)?.page_builder || [];

  // Extract tour details
  const detailSection = sections.find(
    (section: any) => section.value?.id === 'detail' || section.value?.id === 'details'
  );
  const detailItems = detailSection && 'items' in detailSection ? detailSection.items : [];
  const iconListItem = detailItems.find((item: any) => item.type === 'icon-list');
  const tourDetails = iconListItem?.value?.tabs || [];

  const durationDetail = tourDetails.find((d: any) => d.title?.includes('Days') || d.title?.includes('Night'))?.title;
  const groupSizeDetail = tourDetails.find((d: any) => d.title?.toLowerCase().includes('people') || d.title?.toLowerCase().includes('pax'))?.title;
  const datesDetail = tourDetails.find((d: any) => d.title?.toLowerCase().includes('every') || d.title?.match(/\d{2}\/[A-Za-z]{3}\/\d{4}/))?.title;
  const tourCodeDetailRaw = tourDetails.find((d: any) => d.title?.toLowerCase().includes('tour code'))?.title;
  const tourCodeDetail = tourCodeDetailRaw?.replace(/^tour\s*code\s*:?\s*/i, '').trim() || tourCodeDetailRaw;

  const price = tour.tour_meta?.price;
  const duration = durationDetail || tour.tour_meta?.duration_text || tour.tour_meta?.duration;
  const location = tour.tour_meta?.location;
  const country = tour.tour_meta?.country;
  const minPeople = tour.tour_meta?.min_people;
  const maxPeople = tour.tour_meta?.max_people;
  const groupSize = groupSizeDetail || (minPeople && maxPeople ? `${minPeople} - ${maxPeople} people` : maxPeople || minPeople);

  const categories = tour.tour_terms?.categories || [];
  const destinations = tour.tour_terms?.destinations || [];
  const destinationSlug = destinations[0]?.slug || '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Hero Section */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] overflow-hidden">
        {renderImageUrl ? (
          <>
            <Image
              src={renderImageUrl}
              alt={tour.title.rendered}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}

        {/* Back button - floating */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            href={`${localePrefix}/tours`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/20 hover:bg-white/20 transition-all"
          >
            <span className="material-icons text-lg">arrow_back</span>
            <span className="font-medium">All Tours</span>
          </Link>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container-qualitour pb-10 md:pb-16">
            {/* Fallback notice */}
            {isFallbackToEnglish && (
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-amber-500/20 backdrop-blur-sm text-amber-200 rounded-full text-sm">
                <span className="material-icons text-sm">translate</span>
                Showing English version
              </div>
            )}

            {/* Categories */}
            {(categories.length > 0 || destinations.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {destinations.slice(0, 1).map((dest: any) => (
                  <Link
                    key={dest.id}
                    href={`${localePrefix}/tours/destination/${dest.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
                  >
                    <span className="material-icons text-sm">location_on</span>
                    {dest.name}
                  </Link>
                ))}
                {categories.slice(0, 2).map((cat: any) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#f7941e]/80 backdrop-blur-sm text-white rounded-full text-sm font-medium"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 max-w-4xl leading-tight drop-shadow-lg"
              dangerouslySetInnerHTML={{ __html: tour.title.rendered }}
            />

            {/* Location */}
            {(location || country) && (
              <p className="text-lg md:text-xl text-white/80 flex items-center gap-2 mb-6">
                <span className="material-icons">place</span>
                {[location, country].filter(Boolean).join(', ')}
              </p>
            )}

            {/* Quick stats */}
            <div className="flex flex-wrap gap-4 md:gap-6">
              {duration && (
                <div className="flex items-center gap-2 text-white">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="material-icons">schedule</span>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 uppercase tracking-wide">Duration</div>
                    <div className="font-semibold">{duration}</div>
                  </div>
                </div>
              )}
              {groupSize && (
                <div className="flex items-center gap-2 text-white">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="material-icons">groups</span>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 uppercase tracking-wide">Group Size</div>
                    <div className="font-semibold">{groupSize}</div>
                  </div>
                </div>
              )}
              {price && (
                <div className="flex items-center gap-2 text-white">
                  <div className="w-10 h-10 bg-[#f7941e] rounded-xl flex items-center justify-center">
                    <span className="material-icons">paid</span>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 uppercase tracking-wide">From</div>
                    <div className="font-bold text-xl">${typeof price === 'string' ? price : price}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#f7941e]/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Content Section */}
      <section className="relative z-10 -mt-6">
        <div className="container-qualitour">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tabbed Content Card */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <TourTabs tour={tour} />
              </div>

              {/* Trust Indicators */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="material-icons text-green-600">verified</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Verified Tour</div>
                      <div className="text-sm text-gray-500">Quality guaranteed</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="material-icons text-green-600">support_agent</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">24/7 Support</div>
                      <div className="text-sm text-gray-500">Always here to help</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="material-icons text-green-600">credit_score</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Secure Booking</div>
                      <div className="text-sm text-gray-500">Safe payments</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
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
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 md:py-24 bg-white mt-16">
        <div className="container-qualitour">
          <div className="text-center mb-12">
            <span className="text-[#f7941e] font-bold tracking-widest uppercase text-sm mb-2 block">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Guests Say
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Real experiences from travelers who have explored this destination with us
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <TourReviews
              tourTitle={tour.title.rendered}
              tourDestination={destinationSlug}
              limit={6}
              lang={lang}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#f7941e] to-[#ff6b35] relative overflow-hidden">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#fff_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="container-qualitour relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Book this tour now or contact us for a custom itinerary
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#inquiry-form"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#f7941e] font-bold rounded-full hover:shadow-xl hover:scale-105 transition-all"
              >
                <span className="material-icons">mail</span>
                Send Inquiry
              </a>
              <a
                href="tel:+17789456000"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-full border border-white/30 hover:bg-white/20 transition-all"
              >
                <span className="material-icons">call</span>
                +1 (778) 945-6000
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
