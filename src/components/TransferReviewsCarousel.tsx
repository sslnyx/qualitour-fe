'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { GoogleReview } from '@/lib/wordpress/types';

type Props = {
  reviews: GoogleReview[];
  lang: 'en' | 'zh' | string;
};

function Stars({ rating }: { rating: number }) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-1" aria-label={`${rounded} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <i
          key={idx}
          className={`fa fa-star ${idx < rounded ? 'text-[#f7941e]' : 'text-gray-300'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function ReviewerAvatar({ src, name }: { src?: string; name: string }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={name ? `${name} profile photo` : 'Reviewer profile photo'}
      className="w-10 h-10 rounded-full border border-gray-200 object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

function ReviewPhotos({ images, authorName }: { images?: string[]; authorName: string }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((src, idx) => (
          <img
            key={`${src}-${idx}`}
            src={src}
            alt={authorName ? `${authorName} review photo ${idx + 1}` : `Review photo ${idx + 1}`}
            className="h-28 w-auto rounded-md border border-gray-200 object-cover shrink-0"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ))}
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
  });

  const [currentIndex, setCurrentIndex] = useState(0);

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

    const updateIndex = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', updateIndex);
    emblaApi.on('scroll', updateIndex);
    updateIndex();

    return () => {
      emblaApi.off('select', updateIndex);
      emblaApi.off('scroll', updateIndex);
    };
  }, [emblaApi]);

  if (!reviews || reviews.length === 0) return null;

  // Render a deterministic SSR-friendly fallback (then upgrade to slider on mount)
  if (!mounted) {
    const first = reviews[0];
    return (
      <div className="">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Stars rating={first.rating} />
            <div className="text-sm text-text-muted">{first.relative_time_description}</div>
          </div>
          <div className="flex items-center gap-3">
            <ReviewerAvatar src={first.profile_photo_url} name={first.author_name} />
            <div className="text-sm font-semibold text-text-heading">{first.author_name}</div>
          </div>
        </div>

        <blockquote className="mt-4 text-gray-700 italic">“{first.text}”</blockquote>

        <ReviewPhotos images={first.images} authorName={first.author_name} />

        {reviews.length > 1 ? (
          <div className="mt-3 text-sm text-text-muted text-center">1 / {reviews.length}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {reviews.map((review) => (
            <div key={`${review.author_name}-${review.time}`} className="embla__slide flex-[0_0_100%] min-w-0 last:mr-0">
              <div className="">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <Stars rating={review.rating} />
                    <div className="text-sm text-text-muted">{review.relative_time_description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ReviewerAvatar src={review.profile_photo_url} name={review.author_name} />
                    <div className="text-sm font-semibold text-text-heading">{review.author_name}</div>
                  </div>
                </div>

                <blockquote className="mt-4 text-gray-700 italic">“{review.text}”</blockquote>

                <ReviewPhotos images={review.images} authorName={review.author_name} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {reviews.length > 1 ? (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label={lang === 'zh' ? '上一条评价' : 'Previous review'}
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label={lang === 'zh' ? '下一条评价' : 'Next review'}
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="mt-3 text-sm text-text-muted text-center">
            {currentIndex + 1} / {reviews.length}
          </div>
        </>
      ) : null}
    </div>
  );
}
