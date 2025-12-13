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
 * Full-screen reviews modal slider for browsing all reviews
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 mb-0"
        onClick={onClose}
      >
        {/* Modal content */}
        <div
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-60 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Slider */}
          <div className="flex-1 overflow-hidden" ref={emblaRef}>
            <div className="flex h-full">
              {reviews.map((review, idx) => (
                <div
                  key={idx}
                  className="flex-[0_0_100%] min-w-0 overflow-y-auto"
                >
                  <div className="p-6 sm:p-8">
                    {/* Star rating and date */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex text-yellow-400 text-lg gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                        {Array.from({ length: 5 - review.rating }).map((_, i) => (
                          <span key={`empty-${i}`} className="text-gray-300">★</span>
                        ))}
                      </div>
                      <span className="text-gray-500 text-sm">
                        {review.relative_time_description}
                      </span>
                    </div>

                    {/* Reviewer info */}
                    <div className="flex items-center gap-3 mb-6">
                      {review.profile_photo_url && (
                        <Image
                          src={review.profile_photo_url}
                          alt={review.author_name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          {review.author_name}
                        </p>
                      </div>
                    </div>

                    {/* Review photos slider */}
                    {review.images && review.images.length > 0 && (
                      <div className="mb-6">
                        <ReviewPhotoSlider images={review.images} authorName={review.author_name} />
                      </div>
                    )}

                    {/* Review text */}
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {review.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation and counter */}
          <div className="bg-gray-50 border-t px-4 sm:px-6 py-4 flex items-center justify-between">
            <button
              onClick={scrollPrev}
              disabled={currentIndex === 0}
              className="bg-[#f7941e] hover:bg-orange-600 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors"
              aria-label="Previous"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center">
              <span className="text-sm font-semibold text-gray-900">
                {currentIndex + 1} / {reviews.length}
              </span>
            </div>

            <button
              onClick={scrollNext}
              disabled={currentIndex === reviews.length - 1}
              className="bg-[#f7941e] hover:bg-orange-600 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors"
              aria-label="Next"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
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
      <div className="space-y-6">
        {/* Header with rating summary */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Guest Reviews</h3>
            <p className="text-gray-600 mt-1">
              Showing {filteredReviews.length} relevant reviews for this tour
            </p>
          </div>
          {placeDetails.rating && (
            <div className="flex flex-col items-center bg-orange-50 rounded-lg p-4">
              <div className="flex text-yellow-400 text-2xl mb-2">
                {Array.from({ length: Math.round(placeDetails.rating) }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
                {Array.from({ length: 5 - Math.round(placeDetails.rating) }).map((_, i) => (
                  <span key={`empty-${i}`} className="text-gray-300">★</span>
                ))}
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-gray-900">
                  {placeDetails.rating.toFixed(1)}
                </span>
                <span className="text-gray-600 text-sm"> / 5</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on {placeDetails.user_ratings_total} reviews
              </p>
            </div>
          )}
        </div>

        {/* Best-match reviews slider */}
        <TransferReviewsCarousel reviews={filteredReviews} lang={lang} />

        {/* View all reviews button */}
        {placeDetails.reviews && placeDetails.reviews.length > filteredReviews.length && (
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => setShowAllReviewsModal(true)}
              className="inline-block px-6 py-2 border-2 border-[#f7941e] text-[#f7941e] hover:bg-orange-50 rounded-lg font-semibold transition-colors"
            >
              View all {placeDetails.reviews.length} reviews
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

        {/* Trust badge */}
        <div className="mt-8 pt-6 border-t text-center text-gray-600 text-sm">
          <p>
            ⭐ These reviews are from verified customers who have taken this tour with Qualitour.
          </p>
        </div>
      </div>
    );
}
