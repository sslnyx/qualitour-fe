'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { GoogleReview } from '@/lib/wordpress/types';

type Props = {
  reviews: GoogleReview[];
  lang: 'en' | 'zh' | string;
};

// Premium star rating with filled gradient stars
function PremiumStars({ rating }: { rating: number }) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rounded} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <svg
          key={idx}
          className={`w-5 h-5 ${idx < rounded ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// Premium avatar with gradient border
function PremiumAvatar({ src, name }: { src?: string; name: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (!src) {
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f7941e] to-[#ff6b35] flex items-center justify-center text-white font-bold text-sm shadow-lg">
        {initials}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f7941e] to-[#ff6b35] rounded-full animate-pulse opacity-50 blur-sm" />
      <img
        src={src}
        alt={name ? `${name} profile photo` : 'Reviewer profile photo'}
        className="relative w-12 h-12 rounded-full border-2 border-white object-cover shadow-lg"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}

// Premium photo gallery with hover effects
function PremiumPhotoGallery({ images, authorName }: { images?: string[]; authorName: string }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="mt-5">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {images.slice(0, 5).map((src, idx) => (
          <div
            key={`${src}-${idx}`}
            className="relative group flex-shrink-0 rounded-xl overflow-hidden"
          >
            <img
              src={src}
              alt={authorName ? `${authorName} review photo ${idx + 1}` : `Review photo ${idx + 1}`}
              className="h-24 w-24 object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).parentElement!.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        ))}
        {images.length > 5 && (
          <div className="h-24 w-24 flex-shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-sm">
            +{images.length - 5} more
          </div>
        )}
      </div>
    </div>
  );
}

// Single premium review card
function PremiumReviewCard({ review }: { review: GoogleReview }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const text = review.text || '';
  const shouldTruncate = text.length > 280;
  const displayText = shouldTruncate && !isExpanded ? text.slice(0, 280) + '...' : text;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
      {/* Header: Avatar and reviewer info */}
      <div className="flex items-start gap-4 mb-4">
        <PremiumAvatar src={review.profile_photo_url} name={review.author_name} />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 truncate">{review.author_name}</h4>
          <div className="flex items-center gap-3 mt-1">
            <PremiumStars rating={review.rating} />
            <span className="text-xs text-gray-400">{review.relative_time_description}</span>
          </div>
        </div>
        {/* Google logo badge */}
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </div>
      </div>

      {/* Review text */}
      <div className="flex-1">
        <p className="text-gray-600 leading-relaxed text-sm">
          "{displayText}"
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#f7941e] font-semibold text-sm mt-2 hover:underline"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Photos */}
      <PremiumPhotoGallery images={review.images} authorName={review.author_name} />

      {/* Verified badge */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Verified Google Review</span>
      </div>
    </div>
  );
}

export default function TransferReviewsCarousel({ reviews, lang }: Props) {
  const [mounted, setMounted] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 },
    },
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const updateState = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on('select', updateState);
    emblaApi.on('init', updateState);
    updateState();

    return () => {
      emblaApi.off('select', updateState);
      emblaApi.off('init', updateState);
    };
  }, [emblaApi]);

  if (!reviews || reviews.length === 0) return null;

  // SSR fallback - show first review
  if (!mounted) {
    const first = reviews[0];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PremiumReviewCard review={first} />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Carousel container */}
      <div className="overflow-hidden -mx-4 px-4 pb-10" ref={emblaRef}>
        <div className="flex gap-6">
          {reviews.map((review) => (
            <div
              key={`${review.author_name}-${review.time}`}
              className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] min-w-0"
            >
              <PremiumReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      {reviews.length > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${canScrollPrev
              ? 'bg-gradient-to-br from-[#f7941e] to-[#ff6b35] text-white shadow-lg shadow-orange-200/50 hover:shadow-xl hover:scale-105'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            aria-label={lang === 'zh' ? '上一条评价' : 'Previous review'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(reviews.length, 5) }).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex % 5
                  ? 'bg-[#f7941e] w-6'
                  : 'bg-gray-200 hover:bg-gray-300'
                  }`}
              />
            ))}
            {reviews.length > 5 && (
              <span className="text-xs text-gray-400 ml-1">+{reviews.length - 5}</span>
            )}
          </div>

          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${canScrollNext
              ? 'bg-gradient-to-br from-[#f7941e] to-[#ff6b35] text-white shadow-lg shadow-orange-200/50 hover:shadow-xl hover:scale-105'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            aria-label={lang === 'zh' ? '下一条评价' : 'Next review'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
