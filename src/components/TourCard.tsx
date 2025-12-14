/**
 * TourCard Component
 * 
 * Reusable tour card component that mimics WordPress Tourmaster page builder
 * "tour-item" element styling and functionality.
 * 
 * Supports:
 * - Grid and list layouts
 * - Discount pricing display
 * - Configurable tour info (duration, rating, etc.)
 * - Excerpt word count control
 * - Frame/no-frame styles
 */

import Link from 'next/link';
import Image from 'next/image';
import { WPTour } from '@/lib/wordpress';

function normalizeMediaUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Some WP fields occasionally contain stray newlines/spaces.
  return trimmed.replace(/\s+/g, '');
}

function pickTourImageUrl(tour: WPTour, imageSize: NonNullable<TourCardProps['imageSize']>): string | null {
  const sizes: Array<NonNullable<TourCardProps['imageSize']>> = [
    imageSize,
    'large',
    'medium',
    'thumbnail',
    'full',
  ];

  for (const size of sizes) {
    const candidate: unknown = (tour.featured_image_url as any)?.[size];
    const url = normalizeMediaUrl(candidate) || normalizeMediaUrl((candidate as any)?.url);
    if (url) return url;
  }

  return null;
}

export interface TourCardProps {
  tour: WPTour;
  lang?: string;
  /** Layout style - matches WordPress tour-item page builder options */
  style?: 'grid' | 'grid-with-frame' | 'medium' | 'medium-with-frame' | 'full';
  /** Show rating stars/score */
  showRating?: boolean;
  /** Tour meta info to display (matches page builder 'tour-info' option) */
  showInfo?: ('duration-text' | 'availability' | 'location')[];
  /** Number of excerpt words to show (0 = none, -1 = all) */
  excerptWords?: number;
  /** Image size preference */
  imageSize?: 'thumbnail' | 'medium' | 'large' | 'full';
}

/**
 * Extract N words from HTML content
 */
function getExcerptWords(html: string, wordCount: number): string {
  if (wordCount === 0) return '';
  if (wordCount === -1) return html; // show all
  
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(Boolean).slice(0, wordCount);
  return words.join(' ') + (words.length >= wordCount ? '...' : '');
}

export function TourCard({
  tour,
  lang = 'en',
  style = 'grid-with-frame',
  showRating = true,
  showInfo = ['duration-text'],
  excerptWords = 14,
  imageSize = 'large',
}: TourCardProps) {
  const imageUrl = pickTourImageUrl(tour, imageSize);

  // Pricing - check for Tourmaster discount
  const price = tour.tour_meta?.['tour-price-text'] || tour.tour_meta?.price;
  const discountPrice = tour.tour_meta?.['tour-price-discount-text'];
  const hasDiscount = tour.tour_meta?.['tourmaster-tour-discount'] === 'true' && discountPrice;

  // Rating
  const rating = typeof tour.tour_meta?.rating === 'object'
    ? tour.tour_meta.rating.score
    : tour.tour_meta?.rating;

  // Ribbon (season/availability info)
  const ribbon = tour.tour_meta?.ribbon;

  // Duration text - use meta field or extract from title
  let durationText = tour.tour_meta?.duration_text;
  if (!durationText) {
    // Try to extract from title (e.g., "4 Days", "8 Days/7 Nights")
    const titleMatch = tour.title.rendered.match(/(\d+)\s*Days?(?:\s*\/?\s*(\d+)\s*Nights?)?/i);
    if (titleMatch) {
      const days = titleMatch[1];
      const nights = titleMatch[2];
      durationText = nights ? `${days} Days / ${nights} Nights` : `${days} Days`;
    }
  }

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('TourCard Debug:', {
      title: tour.title.rendered.substring(0, 50),
      ribbon,
      duration_text_from_api: tour.tour_meta?.duration_text,
      duration_text_computed: durationText,
      has_tour_meta: !!tour.tour_meta
    });
  }

  // Base styling
  const withFrame = style.includes('frame');
  const isHorizontal = style.includes('medium') || style === 'full';
  
  const cardClass = withFrame
    ? 'bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300'
    : 'overflow-hidden';

  const contentLayout = isHorizontal
    ? 'flex flex-col sm:flex-row'
    : 'flex flex-col';

  const imageClass = isHorizontal
    ? 'relative sm:w-1/3 h-48 sm:h-auto bg-gray-200'
    : 'relative h-64 bg-gray-200';

  // Build locale prefix for links
  const localePrefix = lang === 'en' ? '' : `/${lang}`;

  return (
    <Link 
      prefetch={false}
      href={`${localePrefix}/tours/${tour.slug}`} 
      className={`group block ${cardClass} ${contentLayout}`}
    >
      {/* Image */}
      <div className={`${imageClass} overflow-hidden`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={tour.title.rendered}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes={
              isHorizontal
                ? '(max-width: 640px) 100vw, 33vw'
                : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        {/* Price Badge */}
        {price && (
          <div className="absolute top-4 right-4 z-10">
            {hasDiscount ? (
              <div className="text-white text-right">
                <div className="bg-red-600 px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  ${discountPrice}
                </div>
                <div className="bg-gray-800/75 px-2 py-0.5 rounded text-xs line-through mt-1">
                  ${price}
                </div>
              </div>
            ) : (
              <></>
              // <div className="bg-[#f7941e] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              //   From ${price}
              // </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-6 ${isHorizontal ? 'sm:w-2/3' : ''} relative`}>
        {/* Ribbon - Season/Availability */}
        {ribbon && (
          <div className="absolute top-0 left-6 -translate-y-1/2">
            <div className="relative bg-[#f7941e] text-white px-4 py-1.5 text-xs font-semibold shadow-md">
              {ribbon}
            </div>
          </div>
        )}

        <h2
          className={`text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#f7941e] transition-colors line-clamp-2 ${ribbon ? 'mt-2' : ''}`}
          dangerouslySetInnerHTML={{ __html: tour.title.rendered }}
        />

        {/* Price Display (below title, like WordPress) */}
        {price && (
          <div className="mb-3">
            {hasDiscount ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 line-through text-sm">
                  <span className="text-xs">From</span> ${price}
                </span>
                <span className="text-[#f7941e] text-2xl font-bold">${discountPrice}</span>
              </div>
            ) : (
              <div className="text-[#f7941e]">
                <span className="text-xs ">From</span>{' '}
                <span className="text-2xl font-bold">${price}</span>
              </div>
            )}
          </div>
        )}

        {/* Tour Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
          {showInfo.includes('duration-text') && durationText && (
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 465 465"
              >
                <path d="M221.124,83.198c-8.363,0-15.137,6.78-15.137,15.131v150.747l137.87,71.271c2.219,1.149,4.595,1.69,6.933,1.69c5.476,0,10.765-2.982,13.454-8.185c3.835-7.426,0.933-16.549-6.493-20.384l-121.507-62.818V98.329C236.243,89.978,229.477,83.198,221.124,83.198z"/>
                <path d="M197.999,426.402c-16.72-3.002-32.759-8.114-47.968-15.244c-0.18-0.094-0.341-0.201-0.53-0.287c-3.584-1.687-7.162-3.494-10.63-5.382c-0.012-0.014-0.034-0.023-0.053-0.031c-6.363-3.504-12.573-7.381-18.606-11.628C32.24,331.86,11.088,209.872,73.062,121.901c13.476-19.122,29.784-35.075,47.965-47.719c0.224-0.156,0.448-0.311,0.67-0.468c64.067-44.144,151.06-47.119,219.089-1.757l-14.611,21.111c-4.062,5.876-1.563,10.158,5.548,9.518l63.467-5.682c7.12-0.64,11.378-6.799,9.463-13.675L387.61,21.823c-1.908-6.884-6.793-7.708-10.859-1.833l-14.645,21.161C312.182,7.638,252.303-5.141,192.87,5.165c-5.986,1.036-11.888,2.304-17.709,3.78c-0.045,0.008-0.081,0.013-0.117,0.021c-0.225,0.055-0.453,0.128-0.672,0.189C123.122,22.316,78.407,52.207,46.5,94.855c-0.269,0.319-0.546,0.631-0.8,0.978c-1.061,1.429-2.114,2.891-3.145,4.353c-1.686,2.396-3.348,4.852-4.938,7.308c-0.199,0.296-0.351,0.597-0.525,0.896C10.762,149.191-1.938,196.361,0.24,244.383c0.005,0.158-0.004,0.317,0,0.479c0.211,4.691,0.583,9.447,1.088,14.129c0.027,0.302,0.094,0.588,0.145,0.89c0.522,4.708,1.177,9.427,1.998,14.145c8.344,48.138,31.052,91.455,65.079,125.16c0.079,0.079,0.161,0.165,0.241,0.247c0.028,0.031,0.059,0.047,0.086,0.076c9.142,9.017,19.086,17.357,29.793,24.898c28.02,19.744,59.221,32.795,92.729,38.808c10.167,1.827,19.879-4.941,21.703-15.103C214.925,437.943,208.163,428.223,197.999,426.402z"/>
              </svg>
              <span className="font-medium">{durationText}</span>
            </span>
          )}

          {showInfo.includes('location') && tour.tour_meta?.location && (
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {tour.tour_meta.location}
            </span>
          )}
        </div>

        {/* Excerpt */}
        {excerptWords !== 0 && (
          <p className="text-gray-600 text-sm">
            {getExcerptWords(tour.excerpt.rendered, excerptWords)}
          </p>
        )}

        {/* Rating */}
        {/* {showRating && rating && Number(rating) > 0 && (
          <div className="mt-3 flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Number(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">{rating}</span>
          </div>
        )} */}
      </div>
    </Link>
  );
}
