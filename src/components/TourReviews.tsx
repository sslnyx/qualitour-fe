'use client';

/**
 * Tour-specific reviews component
 * Displays reviews filtered/matched to a specific tour
 * with photo slider support
 * 
 * Matching strategy:
 * - Reviews about destinations/regions mentioned in the tour
 * - Reviews mentioning activities/keywords from tour title
 * - Highly rated reviews as fallback (5 stars = best experience indicator)
 */

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import type { GoogleReview, PlaceDetails } from '@/lib/wordpress/types';
import TransferReviewsCarousel from '@/components/TransferReviewsCarousel';

interface TourReviewsProps {
  tourTitle?: string;
  tourSlug?: string;
  tourDestination?: string;
  limit?: number;
  lang?: 'en' | 'zh' | string;
}

/**
 * Common destination keywords and their variations (English)
 */
const DESTINATION_KEYWORDS: Record<string, string[]> = {
  'africa': ['kenya', 'safari', 'african', 'serengeti', 'masai mara', 'kilimanjaro'],
  'asia': ['japan', 'taiwan', 'thailand', 'vietnam', 'asian', 'china', 'singapore', 'hong kong'],
  'canada': ['canadian', 'yellowknife', 'whitehorse', 'banff', 'vancouver', 'atlantic', 'ottawa', 'calgary', 'rocky mountains', 'niagara'],
  'europe': ['european', 'uk', 'london', 'france', 'paris', 'italy', 'rome', 'greece', 'swiss', 'alps', 'spain'],
  'tropical': ['caribbean', 'tropical', 'island', 'beach', 'hawaii', 'fiji', 'bali'],
  'usa': ['united states', 'america', 'new york', 'los angeles', 'florida', 'california'],
  'australia': ['australia', 'sydney', 'melbourne', 'great barrier reef', 'outback'],
};

/**
 * Chinese destination keywords mapped to English keywords
 * Maps Chinese tour destinations to English equivalents for review matching
 */
const CHINESE_DESTINATION_MAP: Record<string, string[]> = {
  '肯尼亚': ['kenya', 'safari', 'african', 'serengeti', 'masai mara'],
  '黄刀': ['yellowknife', 'aurora', 'northern lights'],
  '白马': ['whitehorse', 'aurora', 'northern lights'],
  '班夫': ['banff', 'canadian', 'rocky mountains'],
  '台湾': ['taiwan', 'asian', 'culture'],
  '日本': ['japan', 'asian'],
  '泰国': ['thailand', 'tropical', 'beach'],
  '越南': ['vietnam', 'asian', 'culture'],
  '欧洲': ['european', 'uk', 'london', 'france', 'paris'],
  '法国': ['france', 'paris', 'european'],
  '英国': ['uk', 'london', 'european'],
  '澳大利亚': ['australia', 'sydney'],
  '加拿大': ['canadian', 'canada', 'vancouver', 'banff'],
  '温哥华': ['vancouver', 'canada'],
};

/**
 * Common activity keywords (English)
 */
const ACTIVITY_KEYWORDS: Record<string, string[]> = {
  'aurora': ['aurora', 'northern lights', 'light', 'night sky', 'glow', 'sky', 'darkness'],
  'wildlife': ['wildlife', 'safari', 'animal', 'lion', 'elephant', 'bear', 'nature', 'creatures', 'species'],
  'city': ['city', 'urban', 'downtown', 'culture', 'cultural', 'architecture', 'museum', 'historic'],
  'adventure': ['adventure', 'hiking', 'trek', 'explore', 'thrilling', 'excitement', 'adrenaline', 'exciting', 'challenging'],
  'relax': ['relax', 'relaxing', 'peaceful', 'calm', 'spa', 'wellness', 'yoga', 'meditate', 'tranquil'],
  'food': ['food', 'culinary', 'restaurant', 'dining', 'cuisine', 'taste', 'delicious', 'eat', 'meal', 'drink'],
  'photography': ['photography', 'photo', 'picture', 'scenic', 'beautiful', 'landscape', 'view', 'stunning', 'capture'],
  'cultural': ['cultural', 'tradition', 'history', 'local', 'people', 'craft', 'heritage', 'authentic'],
  'tour': ['tour', 'guide', 'tour guide', 'experience', 'amazing', 'great', 'wonderful', 'fantastic'],
};

/**
 * Chinese activity keywords mapped to English keywords
 */
const CHINESE_ACTIVITY_MAP: Record<string, string[]> = {
  '极光': ['aurora', 'northern lights', 'light'],
  '野生动物': ['wildlife', 'safari', 'animal', 'nature'],
  '萨法里': ['safari', 'wildlife', 'animal'],
  '城市': ['city', 'urban', 'culture', 'cultural'],
  '冒险': ['adventure', 'hiking', 'trek', 'explore'],
  '美食': ['food', 'culinary', 'restaurant', 'dining'],
  '摄影': ['photography', 'photo', 'scenic', 'beautiful'],
  '文化': ['cultural', 'tradition', 'history', 'heritage'],
  '放松': ['relax', 'relaxing', 'peaceful', 'calm', 'spa'],
};

/**
 * Convert Chinese text to English keywords for review matching
 */
function translateChineseToEnglish(text: string): string[] {
  const englishKeywords: string[] = [];

  // Check destination mappings
  for (const [chinese, keywords] of Object.entries(CHINESE_DESTINATION_MAP)) {
    if (text.includes(chinese)) {
      englishKeywords.push(...keywords);
    }
  }

  // Check activity mappings
  for (const [chinese, keywords] of Object.entries(CHINESE_ACTIVITY_MAP)) {
    if (text.includes(chinese)) {
      englishKeywords.push(...keywords);
    }
  }

  return englishKeywords;
}

/**
 * Score review relevance to tour using keyword matching
 * Returns score from 0-100
 */
function scoreReviewForTour(
  review: GoogleReview,
  tourTitle?: string,
  tourDestination?: string
): number {
  let score = 0;
  const reviewText = review.text.toLowerCase();

  // Base score: higher rating = more likely positive experience
  // Weight: 5-25 points (5 star = 25 points)
  score += review.rating * 5;

  // Destination matching (30 points max - higher weight)
  if (tourDestination) {
    const destLower = tourDestination.toLowerCase();
    let keywords = DESTINATION_KEYWORDS[destLower] || destLower.split('-').filter(w => w.length > 2);

    // Check if destination contains Chinese characters and translate
    if (!/^[a-z0-9\s-]*$/.test(tourDestination)) {
      const chineseKeywords = translateChineseToEnglish(tourDestination);
      keywords = [...new Set([...keywords, ...chineseKeywords])]; // Merge and deduplicate
    }

    const destMatches = keywords.filter(kw => reviewText.includes(kw)).length;
    if (destMatches > 0) {
      // Multiple destination matches get high score
      score += Math.min(30, destMatches * 10);
    }
  }

  // Activity/experience matching (35 points max - highest weight for relevance)
  if (tourTitle) {
    const titleLower = tourTitle.toLowerCase();
    let matched = false;

    // Check for activity keywords - these are most relevant
    for (const [activity, keywords] of Object.entries(ACTIVITY_KEYWORDS)) {
      if (titleLower.includes(activity)) {
        const activityMatches = keywords.filter(kw => reviewText.includes(kw)).length;
        if (activityMatches > 0) {
          // Multiple activity matches indicate strong relevance
          score += Math.min(35, activityMatches * 10);
          matched = true;
          break; // Only count most specific activity
        }
      }
    }

    // Check if title contains Chinese characters
    if (!matched && !/^[a-z0-9\s-]*$/.test(tourTitle)) {
      const chineseKeywords = translateChineseToEnglish(tourTitle);
      if (chineseKeywords.length > 0) {
        const activityMatches = chineseKeywords.filter(kw => reviewText.includes(kw)).length;
        if (activityMatches > 0) {
          score += Math.min(35, activityMatches * 10);
          matched = true;
        }
      }
    }

    // Generic title keyword matching (10 points max)
    const titleWords = titleLower
      .split(/[\s\-]+/)
      .filter(w => w.length > 3 && !['tour', 'days', 'day', 'with', 'from', 'the'].includes(w));
    const titleMatches = titleWords.filter(word => reviewText.includes(word)).length;
    score += Math.min(10, titleMatches * 2);
  }

  // Bonus points for positive sentiment words
  const positiveWords = ['amazing', 'wonderful', 'fantastic', 'excellent', 'outstanding', 'loved', 'awesome', 'incredible', 'perfect'];
  const sentimentMatches = positiveWords.filter(word => reviewText.includes(word)).length;
  score += Math.min(10, sentimentMatches * 2);

  return Math.min(100, score);
}

/**
 * Photo slider component for review images using Embla Carousel
 * Shows thumbnail grid, opens full-screen slider modal on click
 */
function ReviewPhotoSlider({
  images,
  authorName
}: {
  images: string[];
  authorName: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStartIndex, setModalStartIndex] = useState(0);

  const openModal = useCallback((index: number) => {
    setModalStartIndex(index);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  if (!images.length) return null;

  return (
    <div className="mb-4">
      {/* Photo grid - 3 columns mobile, 5 columns desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        {images.map((imageUrl, idx) => (
          <button
            key={idx}
            onClick={() => openModal(idx)}
            className="relative group bg-gray-100 rounded overflow-hidden aspect-square hover:opacity-80 transition-opacity cursor-pointer"
            aria-label={`View photo ${idx + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`${authorName}'s review photo ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                console.warn(`[TourReviews] Failed to load image: ${imageUrl}`);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
              onLoad={() => {
                console.log(`[TourReviews] Successfully loaded image: ${imageUrl.substring(0, 50)}...`);
              }}
            />
            {/* Zoom icon overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Full-screen modal slider */}
      {isModalOpen && (
        <PhotoModalSlider
          images={images}
          authorName={authorName}
          startIndex={modalStartIndex}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

/**
 * Full-screen modal slider for viewing photos
 */
function PhotoModalSlider({
  images,
  authorName,
  startIndex,
  onClose
}: {
  images: string[];
  authorName: string;
  startIndex: number;
  onClose: () => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: startIndex,
    loop: false,
    align: 'center'
  });
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Update current index on scroll
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

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') scrollPrev();
      if (e.key === 'ArrowRight') scrollNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, scrollPrev, scrollNext]);

  return (
    <>
      {/* Modal backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal content */}
        <div
          className="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-60 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Slider */}
          <div className="flex-1 flex items-center justify-center overflow-hidden rounded-lg">
            <div className="overflow-hidden w-full h-full" ref={emblaRef}>
              <div className="flex h-full">
                {images.map((imageUrl, idx) => (
                  <div
                    key={idx}
                    className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center bg-black relative"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={`${authorName}'s photo ${idx + 1}`}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        console.warn(`[PhotoModal] Failed to load image: ${imageUrl}`);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log(`[PhotoModal] Successfully loaded image: ${imageUrl.substring(0, 50)}...`);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={scrollPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-colors"
                  aria-label="Previous"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={scrollNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-colors"
                  aria-label="Next"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Photo counter and info */}
          {images.length > 1 && (
            <div className="bg-black/60 text-white px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold">
                {currentIndex + 1} / {images.length}
              </span>
              <span className="text-xs">Press ESC to close, arrow keys to navigate</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Filter and sort reviews by relevance to specific tour
 */
function filterReviewsForTour(
  reviews: GoogleReview[] = [],
  tourTitle?: string,
  tourDestination?: string
): GoogleReview[] {
  if (!reviews.length) return [];

  // Score all reviews
  const scoredReviews = reviews.map(review => ({
    review,
    score: scoreReviewForTour(review, tourTitle, tourDestination)
  }));

  // Sort by score descending, then by rating
  scoredReviews.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.review.rating - a.review.rating;
  });

  // Return top reviews:
  // - Prefer reviews with score >= 20 (highly relevant)
  // - Include 5-star reviews even if score is lower (quality indicator)
  // - As fallback, include 4+ star reviews
  return scoredReviews
    .filter(({ score, review }) => score >= 20 || review.rating === 5 || (score >= 10 && review.rating >= 4))
    .slice(0, 10) // Get up to 10, we'll limit in component
    .map(({ review }) => review);
}

/**
 * Premium full-screen reviews modal slider for browsing all reviews
 * Features: Gradient header, glassmorphism, smooth animations, refined UI
 */
function ReviewsModalSlider({
  reviews,
  onClose
}: {
  reviews: GoogleReview[];
  onClose: () => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center'
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Update current index on scroll
  useEffect(() => {
    if (!emblaApi) return;

    const updateIndex = () => {
      const scroller = emblaApi.containerNode();
      if (scroller) {
        const scrollLeft = scroller.scrollLeft;
        const clientWidth = scroller.clientWidth;
        const index = Math.round(scrollLeft / clientWidth);
        setCurrentIndex(Math.max(0, Math.min(index, reviews.length - 1)));
      }
    };

    emblaApi.on('select', updateIndex);
    emblaApi.on('scroll', updateIndex);
    updateIndex();

    return () => {
      emblaApi.off('select', updateIndex);
      emblaApi.off('scroll', updateIndex);
    };
  }, [emblaApi, reviews.length]);

  // Close on ESC key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') scrollPrev();
      if (e.key === 'ArrowRight') scrollNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, scrollPrev, scrollNext]);

  const currentReview = reviews[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Modal content */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scaleIn 0.3s ease-out' }}
      >
        {/* Premium gradient header */}
        <div className="bg-gradient-to-r from-[#f7941e] to-[#ff6b35] p-6 relative overflow-hidden">
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative flex items-center gap-4">
            {/* Avatar with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full blur-md" />
              {currentReview?.profile_photo_url ? (
                <Image
                  src={currentReview.profile_photo_url}
                  alt={currentReview.author_name}
                  width={56}
                  height={56}
                  className="relative w-14 h-14 rounded-full object-cover border-2 border-white shadow-lg"
                />
              ) : (
                <div className="relative w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl border-2 border-white/50">
                  {currentReview?.author_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white truncate">
                {currentReview?.author_name}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <svg
                      key={idx}
                      className={`w-5 h-5 ${idx < (currentReview?.rating || 0) ? 'text-white' : 'text-white/30'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-white/80 text-sm">
                  {currentReview?.relative_time_description}
                </span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Slider content */}
        <div className="flex-1 overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="flex-[0_0_100%] min-w-0 overflow-y-auto"
              >
                <div className="p-6 sm:p-8">
                  {/* Review photos */}
                  {review.images && review.images.length > 0 && (
                    <div className="mb-6">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {review.images.slice(0, 8).map((src, imgIdx) => (
                          <div
                            key={`${src}-${imgIdx}`}
                            className="relative aspect-square rounded-xl overflow-hidden group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={src}
                              alt={`${review.author_name} review photo ${imgIdx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review text */}
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                    &ldquo;{review.text}&rdquo;
                  </p>

                  {/* Verified badge */}
                  <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Verified Google Review</span>
                    <span className="mx-2">•</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Powered by Google</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium navigation footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
          <button
            onClick={scrollPrev}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-300 ${currentIndex > 0
                ? 'bg-gradient-to-r from-[#f7941e] to-[#ff6b35] text-white shadow-lg shadow-orange-200/50 hover:shadow-xl hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            aria-label="Previous"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(reviews.length, 5) }).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex % 5
                    ? 'bg-[#f7941e] w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                  }`}
              />
            ))}
            {reviews.length > 5 && (
              <span className="text-xs text-gray-500 ml-1">
                {currentIndex + 1}/{reviews.length}
              </span>
            )}
          </div>

          <button
            onClick={scrollNext}
            disabled={currentIndex === reviews.length - 1}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-300 ${currentIndex < reviews.length - 1
                ? 'bg-gradient-to-r from-[#f7941e] to-[#ff6b35] text-white shadow-lg shadow-orange-200/50 hover:shadow-xl hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            aria-label="Next"
          >
            <span className="hidden sm:inline">Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.95);
          }
          to { 
            opacity: 1; 
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default function TourReviews({
  tourTitle,
  tourDestination,
  limit = 5,
  lang = 'en',
}: TourReviewsProps) {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        if (!res.ok) {
          throw new Error('Failed to load reviews');
        }
        const data = (await res.json()) as PlaceDetails | null;
        setPlaceDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded">
        <p className="text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  if (error || !placeDetails?.reviews) {
    return (
      <div className="p-4 bg-gray-50 rounded">
        <p className="text-gray-600">No reviews available for this tour.</p>
      </div>
    );
  }

  // Filter reviews for this specific tour
  const filteredReviews = filterReviewsForTour(
    placeDetails.reviews,
    tourTitle,
    tourDestination
  ).slice(0, limit);

  if (filteredReviews.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded">
        <p className="text-gray-600">No reviews yet for this tour. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Premium Header with rating summary */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {/* Google logo */}
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Guest Reviews</h3>
          </div>
          <p className="text-gray-500">
            Real experiences from verified travelers
          </p>
        </div>

        {/* Premium rating badge */}
        {placeDetails.rating && (
          <div className="flex items-center gap-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100 shadow-sm">
            {/* Large rating number */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {placeDetails.rating.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 mt-1">out of 5</div>
            </div>

            <div className="h-12 w-px bg-amber-200" />

            {/* Stars and count */}
            <div>
              <div className="flex items-center gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(placeDetails.rating!) ? 'text-amber-400' : 'text-gray-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {placeDetails.user_ratings_total?.toLocaleString()} reviews
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* Reviews carousel */}
      <TransferReviewsCarousel reviews={filteredReviews} lang={lang} />

      {/* View all reviews button */}
      {placeDetails.reviews && placeDetails.reviews.length > filteredReviews.length && (
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => setShowAllReviewsModal(true)}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-[#f7941e] text-[#f7941e] hover:bg-[#f7941e] hover:text-white rounded-full font-bold transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105"
          >
            <span>View all {placeDetails.reviews.length} reviews</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      )}

      {/* All reviews modal slider */}
      {showAllReviewsModal && placeDetails.reviews && (
        <ReviewsModalSlider
          reviews={placeDetails.reviews}
          onClose={() => setShowAllReviewsModal(false)}
        />
      )}

      {/* Premium trust badge */}
      <div className="mt-8 pt-8 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-gray-600">Verified Reviews</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-gray-600">Trusted by 1000+ travelers</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-gray-600">Powered by Google</span>
          </div>
        </div>
      </div>
    </div>
  );
}

