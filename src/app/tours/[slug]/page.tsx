import { getTours, getTourBySlug } from '@/lib/wordpress';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import TourTabs from '@/components/TourTabs';

export async function generateStaticParams() {
  try {
    const tours = await getTours({ per_page: 100 });
    return tours.map((tour) => {
      // Decode slugs because WordPress returns percent-encoded slugs (e.g., %e9%9f%93...)
      // but Next.js route params should be clean, decoded values
      let decodedSlug = tour.slug;
      try {
        decodedSlug = decodeURIComponent(tour.slug);
      } catch {
        // If decoding fails, use original slug
        decodedSlug = tour.slug;
      }
      return {
        slug: decodedSlug,
      };
    });
  } catch (error) {
    console.error('Error generating static params for tours:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const tour = await getTourBySlug(slug);
    
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

export default async function TourPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let tour;
  let error: string | null = null;

  try {
    tour = await getTourBySlug(slug);
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
          <Link href="/tours" className="text-[#f7941e] hover:underline">
            ← Back to Tours
          </Link>
        </div>
      </div>
    );
  }

  if (!tour) {
    notFound();
  }

  const imageUrl = tour.featured_image_url?.full?.url || 
                   tour._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/tours" 
            className="text-[#f7941e] hover:text-[#d67a1a] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Tours
          </Link>
        </div>
      </div>

      {/* Hero Image */}
      {imageUrl && (
        <div className="relative h-96 bg-gray-200">
          <Image
            src={imageUrl}
            alt={tour.title.rendered}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
              <h1 
                className="text-4xl md:text-5xl font-bold text-white mb-4"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {!imageUrl && (
              <h1 
                className="text-4xl font-bold text-gray-900 mb-6"
                dangerouslySetInnerHTML={{ __html: tour.title.rendered }}
              />
            )}

            {/* Tabbed Content */}
            <TourTabs tour={tour} />
          </div>

          {/* Sidebar - Tour Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              {/* Price */}
              {price && (
                <div className="text-center mb-6 pb-6 border-b">
                  <div className="text-sm text-gray-600 mb-1">Starting from</div>
                  <div className="text-4xl font-bold text-[#f7941e]">${price}</div>
                  <div className="text-sm text-gray-500">per person</div>
                </div>
              )}

              {/* Tour Details */}
              <div className="space-y-4">
                {duration && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="font-semibold text-gray-900">{duration}</div>
                    </div>
                  </div>
                )}

                {groupSize && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-600">Group Size</div>
                      <div className="font-semibold text-gray-900">{groupSize}</div>
                    </div>
                  </div>
                )}

                {datesDetail && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-600">Availability</div>
                      <div className="font-semibold text-gray-900">{datesDetail}</div>
                    </div>
                  </div>
                )}

                {tourCodeDetail && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-600">Reference</div>
                      <div className="font-semibold text-gray-900 font-mono text-sm">{tourCodeDetail}</div>
                    </div>
                  </div>
                )}

                {rating && Number(rating) > 0 && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-400 fill-current mt-1" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-600">Rating</div>
                      <div className="font-semibold text-gray-900">
                        {rating} / 5
                        {reviewCount && ` (${reviewCount} reviews)`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Categories */}
                {tour._embedded?.['wp:term']?.[0] && tour._embedded['wp:term'][0].length > 0 && (
                  <div className="flex items-start gap-3 pt-4 border-t">
                    <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-2">Categories</div>
                      <div className="flex flex-wrap gap-2">
                        {tour._embedded['wp:term'][0].map((category) => (
                          <span 
                            key={category.id}
                            className="px-2 py-1 bg-orange-50 text-[#f7941e] text-xs rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button className="w-full mt-6 bg-[#f7941e] hover:bg-[#d67a1a] text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
