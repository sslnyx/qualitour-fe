/**
 * SerpAPI Integration for fetching Google Maps reviews
 * Fetches all available reviews (not limited to 5 like Google Places API)
 */

const SERPAPI_KEY = process.env.SERPAPI_KEY;

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function getWordPressCustomApiBase(): string | null {
  const direct =
    process.env.NEXT_PUBLIC_WORDPRESS_CUSTOM_API_URL ||
    process.env.WORDPRESS_CUSTOM_API_URL;
  if (direct) return normalizeBaseUrl(direct);

  const wpV2 = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL;
  if (!wpV2) return null;

  if (wpV2.includes('/wp-json/qualitour/v1')) return normalizeBaseUrl(wpV2);
  if (wpV2.includes('/wp-json/wp/v2')) {
    return normalizeBaseUrl(wpV2.replace('/wp-json/wp/v2', '/wp-json/qualitour/v1'));
  }

  try {
    const parsed = new URL(wpV2);
    return `${parsed.origin}/wp-json/qualitour/v1`;
  } catch {
    return null;
  }
}

export interface SerpAPIReview {
  reviewer: string;
  reviewer_url?: string;
  reviewer_image?: string;
  rating: number;
  review: string;
  review_text?: string;
  review_datetime?: string;
  review_datetime_utc?: string;
}

export interface SerpAPIResponse {
  place_id: string;
  business_name?: string;
  rating?: number;
  review_count?: number;
  reviews?: SerpAPIReview[];
}

/**
 * Fetch reviews from SerpAPI
 * Returns ALL available reviews (not limited to 5)
 */
export async function fetchSerpAPIReviews(
  placeId: string = 'ChIJXUMRKHd0hlQRJ5matAPcxfE'
): Promise<SerpAPIResponse | null> {
  if (!SERPAPI_KEY) {
    console.error('[SerpAPI] API key not configured');
    return null;
  }

  try {
    console.log(`[SerpAPI] Fetching reviews for place: ${placeId}`);

    const params = new URLSearchParams({
      engine: 'google_maps_reviews',
      place_id: placeId,
      api_key: SERPAPI_KEY,
    });

    const response = await fetch(`https://serpapi.com/search?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status}`);
    }

    const data = (await response.json()) as SerpAPIResponse;

    console.log(`[SerpAPI] Successfully fetched ${data.reviews?.length || 0} reviews`);
    console.log(`[SerpAPI] Business: ${data.business_name}, Rating: ${data.rating}`);

    return data;
  } catch (error) {
    console.error('[SerpAPI] Error fetching reviews:', error);
    return null;
  }
}

/**
 * Transform SerpAPI review format to our standard format
 */
export function transformSerpAPIReview(review: SerpAPIReview) {
  return {
    author_name: review.reviewer || 'Anonymous',
    author_url: review.reviewer_url || '',
    profile_photo_url: review.reviewer_image || '',
    rating: review.rating || 0,
    text: review.review_text || review.review || '',
    time: new Date(review.review_datetime || review.review_datetime_utc || Date.now()).getTime() / 1000,
    relative_time_description: review.review_datetime || 'Recently',
    language: 'en',
  };
}

/**
 * Trigger sync from Next.js
 * POST /api/reviews/sync
 */
export async function triggerSerpAPISync(syncKey: string = '') {
  try {
    const customApiBase = getWordPressCustomApiBase();
    if (!customApiBase) {
      throw new Error('WordPress custom API URL is not configured');
    }

    const response = await fetch(
      `${customApiBase}/google-reviews/sync`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: syncKey }),
      }
    );

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[SerpAPI] Sync response:', data);

    return data;
  } catch (error) {
    console.error('[SerpAPI] Sync error:', error);
    return null;
  }
}
