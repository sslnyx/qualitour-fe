/**
 * API Route: Sync Google Reviews from SerpAPI to WordPress
 * GET /api/reviews/sync - Get sync status
 * POST /api/reviews/sync - Trigger sync
 * DELETE /api/reviews/sync - Clear reviews
 */

import { fetchSerpAPIReviews, transformSerpAPIReview } from '@/lib/serpapi';

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function getWordPressCustomApiBase(): string {
  const direct =
    process.env.NEXT_PUBLIC_WORDPRESS_CUSTOM_API_URL ||
    process.env.WORDPRESS_CUSTOM_API_URL;
  if (direct) return normalizeBaseUrl(direct);

  const wpV2 = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL;
  if (!wpV2) {
    throw new Error('WordPress API URL is not configured');
  }

  if (wpV2.includes('/wp-json/qualitour/v1')) return normalizeBaseUrl(wpV2);
  if (wpV2.includes('/wp-json/wp/v2')) {
    return normalizeBaseUrl(wpV2.replace('/wp-json/wp/v2', '/wp-json/qualitour/v1'));
  }

  // Last resort: treat as origin.
  const parsed = new URL(wpV2);
  return `${parsed.origin}/wp-json/qualitour/v1`;
}

const WORDPRESS_CUSTOM_API = getWordPressCustomApiBase();
const SYNC_KEY = process.env.REVIEWS_SYNC_KEY || 'sync-key-' + process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.split('//')[1];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'status';

    if (action === 'fetch') {
      // Fetch from SerpAPI directly (for testing)
      const reviews = await fetchSerpAPIReviews();
      if (!reviews) {
        return Response.json({ error: 'Failed to fetch reviews' }, { status: 500 });
      }

      return Response.json({
        status: 'success',
        reviews_count: reviews.reviews?.length || 0,
        business: {
          name: reviews.business_name,
          rating: reviews.rating,
          total_reviews: reviews.review_count,
        },
        sample: reviews.reviews?.slice(0, 3),
      });
    }

    // Default: Get WordPress reviews (from cache)
    const wpResponse = await fetch(
      `${WORDPRESS_CUSTOM_API}/google-reviews`,
      {
        cache: 'no-store',
      }
    );

    const reviews = await wpResponse.json();

    return Response.json({
      status: 'success',
      source: 'wordpress',
      reviews_count: Array.isArray(reviews) ? reviews.length : 0,
      cached: true,
      reviews: Array.isArray(reviews) ? reviews.slice(0, 5) : [],
    });
  } catch (error) {
    console.error('[API] Error getting reviews:', error);
    return Response.json(
      { error: 'Failed to get reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, key } = body;

    // Check authentication
    if (key !== SYNC_KEY) {
      console.warn('[API] Unauthorized sync attempt');
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (action === 'sync') {
      // Fetch from SerpAPI
      const serpapiData = await fetchSerpAPIReviews();
      if (!serpapiData || !serpapiData.reviews) {
        return Response.json(
          { error: 'Failed to fetch from SerpAPI' },
          { status: 500 }
        );
      }

      // Transform and save to WordPress
      const reviews = serpapiData.reviews.map(transformSerpAPIReview);

      const wpSyncResponse = await fetch(
        `${WORDPRESS_CUSTOM_API}/google-reviews/sync?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reviews }),
        }
      );

      if (!wpSyncResponse.ok) {
        throw new Error('Failed to sync to WordPress');
      }

      const syncResult = await wpSyncResponse.json();

      return Response.json({
        status: 'success',
        message: `Synced ${reviews.length} reviews to WordPress`,
        details: syncResult,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[API] Sync error:', error);
    return Response.json(
      { error: 'Sync failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { key } = body;

    // Check authentication
    if (key !== SYNC_KEY) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete all reviews from WordPress
    const wpResponse = await fetch(
      `${WORDPRESS_CUSTOM_API}/google-reviews/clear?key=${encodeURIComponent(key)}`,
      {
        method: 'DELETE',
      }
    );

    if (!wpResponse.ok) {
      throw new Error('Failed to clear reviews');
    }

    return Response.json({
      status: 'success',
      message: 'All reviews cleared',
    });
  } catch (error) {
    console.error('[API] Clear error:', error);
    return Response.json(
      { error: 'Clear failed' },
      { status: 500 }
    );
  }
}
