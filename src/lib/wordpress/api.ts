import { WPPost, WPPage, WPCategory, WPTag, WPMedia, WPApiParams, WPTour, WPTourCategory, WPTourTag, WPTourActivity, WPTourDestination, GoogleReview, PlaceDetails } from './types';

// Helper to get API URL dynamically
function getApiUrl() {
  return process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL;
}

/**
 * Request-level cache to prevent duplicate API calls during single render
 * Gets cleared between requests in production
 */
const requestCache = new Map<string, Promise<any>>();

function getCacheKey(endpoint: string, params: WPApiParams): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = (params as Record<string, any>)[key];
      return acc;
    }, {} as Record<string, any>);
  
  return `${endpoint}:${JSON.stringify(sortedParams)}`;
}

/**
 * Determine ISR revalidation time based on endpoint type
 */
function getRevalidateTime(endpoint: string): number | false {
  // Only tours need ISR (frequent updates)
  if (endpoint.includes('/tour') && !endpoint.includes('tour-')) return 900;    // Tours: 15 min
  
  // Everything else (taxonomies, posts, pages) should be static (cache forever)
  // to avoid Edge Runtime requirement and keep worker size down.
  return false;
}

/**
 * Generic fetch function for WordPress REST API with optimizations
 * 
 * Optimizations:
 * - Request-level deduplication: prevents duplicate API calls in same render
 * - Incremental Static Regeneration: smart revalidation based on content type
 * - Supports _fields parameter to reduce payload by 70%
 * - Logs fetch duration in development
 * - Supports language parameter for Polylang
 * - Automatic error handling with fallbacks
 */
async function fetchAPI(endpoint: string, params: WPApiParams = {}, options: RequestInit = {}) {
  // Check request-level cache first
  const cacheKey = getCacheKey(endpoint, params);
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  const apiUrl = getApiUrl();
  if (!apiUrl) {
    console.error('Error: WordPress API URL is not defined. Please set NEXT_PUBLIC_WORDPRESS_API_URL environment variable.');
    console.error('Available environment variables:', Object.keys(process.env).join(', '));
    throw new Error('WordPress API URL is not defined');
  }

  const url = new URL(`${apiUrl}${endpoint}`);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        url.searchParams.append(key, value.join(','));
      } else {
        url.searchParams.append(key, String(value));
      }
    }
  });

  const startTime = process.env.NODE_ENV === 'development' ? Date.now() : 0;

  // Create the fetch promise
  const promise = (async () => {
    // Extract credentials from URL if present (for Local Live Link)
    const urlObj = new URL(url.toString());
    let authHeader = {};
    
    // Try to get credentials from URL first, then from environment variables
    let username = urlObj.username;
    let password = urlObj.password;
    
    if (!username || !password) {
      username = process.env.WORDPRESS_AUTH_USER || '';
      password = process.env.WORDPRESS_AUTH_PASS || '';
    }
    
    if (username && password) {
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
      authHeader = { 'Authorization': `Basic ${credentials}` };
      // Remove credentials from URL to prevent fetch error
      urlObj.username = '';
      urlObj.password = '';
    }

    const revalidateTime = getRevalidateTime(endpoint);

    const response = await fetch(urlObj.toString(), {
      // Smart ISR revalidation based on endpoint type
      // If revalidateTime is false, use force-cache (Static)
      // If revalidateTime is a number, use next: { revalidate: n } (ISR)
      ...(revalidateTime === false 
        ? { cache: 'force-cache' } 
        : { next: { revalidate: revalidateTime } }
      ),
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Qualitour-API/1.0)',
        ...authHeader,
        ...options.headers,
      },
    });

    if (process.env.NODE_ENV === 'development' && startTime) {
      const duration = Date.now() - startTime;
      console.log(`[API] ${endpoint} - ${duration}ms - ${response.status}`);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[API Error Body] ${endpoint}:`, errorBody);
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  })();

  // Store in request cache
  requestCache.set(cacheKey, promise);
  
  return promise;
}

/**
 * Get all posts
 * @param params - API parameters
 * @param lang - Language code for Polylang (e.g., 'en', 'zh')
 */
export async function getPosts(params: WPApiParams = {}, lang?: string): Promise<WPPost[]> {
  return fetchAPI('/posts', {
    _embed: true,
    ...(lang && { lang }),
    ...params,
  });
}

/**
 * Get a single post by slug
 * @param slug - Post slug
 * @param lang - Language code for Polylang (e.g., 'en', 'zh')
 */
export async function getPostBySlug(slug: string, lang?: string): Promise<WPPost | null> {
  const posts = await fetchAPI('/posts', {
    slug,
    _embed: true,
    ...(lang && { lang }),
  });
  return posts[0] || null;
}

/**
 * Get all pages
 */
export async function getPages(params: WPApiParams = {}): Promise<WPPage[]> {
  return fetchAPI('/pages', {
    _embed: true,
    ...params,
  });
}

/**
 * Get a single page by slug
 */
export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  const pages = await fetchAPI('/pages', {
    slug,
    _embed: true,
  });
  return pages[0] || null;
}

/**
 * Get all categories
 */
export async function getCategories(params: WPApiParams = {}): Promise<WPCategory[]> {
  return fetchAPI('/categories', params);
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
  const categories = await fetchAPI('/categories', { slug });
  return categories[0] || null;
}

/**
 * Get all tags
 */
export async function getTags(params: WPApiParams = {}): Promise<WPTag[]> {
  return fetchAPI('/tags', params);
}

/**
 * Get media by ID
 */
export async function getMediaById(id: number): Promise<WPMedia | null> {
  try {
    return await fetchAPI(`/media/${id}`);
  } catch {
    return null;
  }
}

/**
 * Search posts
 */
export async function searchPosts(query: string, params: WPApiParams = {}): Promise<WPPost[]> {
  return fetchAPI('/posts', {
    search: query,
    _embed: true,
    ...params,
  });
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(categoryId: number, params: WPApiParams = {}): Promise<WPPost[]> {
  return fetchAPI('/posts', {
    categories: categoryId,
    _embed: true,
    ...params,
  });
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(tagId: number, params: WPApiParams = {}): Promise<WPPost[]> {
  return fetchAPI('/posts', {
    tags: tagId,
    _embed: true,
    ...params,
  });
}

// ============================================
// Tour API Functions
// ============================================

/**
 * Get all tours
 * 
 * For list views, use _fields to reduce payload size
 * @param params - API parameters
 * @param lang - Language code for Polylang (e.g., 'en', 'zh')
 */
export async function getTours(params: WPApiParams = {}, lang?: string): Promise<WPTour[]> {
  // For list views, only fetch essential fields to reduce payload
  const isListView = !params.slug && (params.per_page || 0) > 1;
  
  if (isListView) {
    const result = await fetchAPI('/tour', {
      _embed: true,
      // Only fetch fields needed for tour cards
      _fields: 'id,slug,title,excerpt,featured_media,tour_category,tour_tag,featured_image_url,tour_meta,_embedded',
      ...(lang && { lang }),
      ...params,
    });
    console.log(`[getTours] List view returned ${result.length} tours`);
    return result;
  }
  
  return fetchAPI('/tour', {
    _embed: true,
    ...(lang && { lang }),
    ...params,
  });
}

/**
 * Get tours with minimal data for performance
 * Use for listing pages where full content isn't needed
 */
export async function getToursMinimal(params: WPApiParams = {}): Promise<WPTour[]> {
  return fetchAPI('/tour', {
    _embed: true,
    _fields: 'id,slug,title,excerpt,featured_image_url,tour_meta',
    ...params,
  });
}

/**
 * Get a single tour by slug
 * @param slug - Tour slug (can be decoded or encoded)
 * @param lang - Language code for Polylang (e.g., 'en', 'zh')
 */
export async function getTourBySlug(slug: string, lang?: string): Promise<WPTour | null> {
  // Handle URL encoding: WordPress API returns percent-encoded slugs for CJK characters
  // If slug contains non-ASCII characters (Chinese, Japanese, Korean, etc.),
  // encodeURIComponent will handle it. If already encoded, it becomes double-encoded
  // but WordPress correctly handles both formats.
  // For consistency, we ensure the slug is encoded.
  let encodedSlug = slug;
  try {
    // First decode in case it's already encoded, then re-encode
    const decoded = decodeURIComponent(slug);
    encodedSlug = encodeURIComponent(decoded);
  } catch {
    // If decoding fails, slug is probably already properly formatted
    encodedSlug = slug;
  }

  const tours = await fetchAPI('/tour', {
    slug: encodedSlug,
    _embed: true,
    ...(lang && { lang }),
  });
  return tours[0] || null;
}

/**
 * Get a single tour by ID
 */
export async function getTourById(id: number): Promise<WPTour | null> {
  try {
    return await fetchAPI(`/tour/${id}`, {
      _embed: true,
    });
  } catch {
    return null;
  }
}

/**
 * Get tours by category
 */
export async function getToursByCategory(categoryId: number, params: WPApiParams = {}): Promise<WPTour[]> {
  return fetchAPI('/tour', {
    tour_category: categoryId,
    _embed: true,
    ...params,
  });
}

/**
 * Get tours by category slug
 */
export async function getToursByCategorySlug(slug: string, params: WPApiParams = {}): Promise<WPTour[]> {
  const category = await getTourCategoryBySlug(slug);
  if (!category) {
    return [];
  }
  return getToursByCategory(category.id, params);
}

/**
 * Get tours by tag
 */
export async function getToursByTag(tagId: number, params: WPApiParams = {}): Promise<WPTour[]> {
  return fetchAPI('/tour', {
    tour_tag: tagId,
    _embed: true,
    ...params,
  });
}

/**
 * Search tours
 */
export async function searchTours(query: string, params: WPApiParams = {}): Promise<WPTour[]> {
  return fetchAPI('/tour', {
    search: query,
    _embed: true,
    ...params,
  });
}

/**
 * Get all tour categories
 */
export async function getTourCategories(params: WPApiParams = {}): Promise<WPTourCategory[]> {
  return fetchAPI('/tour-category', params);
}

/**
 * Get a single tour category by slug
 */
export async function getTourCategoryBySlug(slug: string): Promise<WPTourCategory | null> {
  const categories = await fetchAPI('/tour-category', { slug });
  return categories[0] || null;
}

/**
 * Get all tour tags
 */
export async function getTourTags(params: WPApiParams = {}): Promise<WPTourTag[]> {
  return fetchAPI('/tour-tag', params);
}

/**
 * Get a single tour tag by slug
 */
export async function getTourTagBySlug(slug: string): Promise<WPTourTag | null> {
  const tags = await fetchAPI('/tour-tag', { slug });
  return tags[0] || null;
}

/**
 * Get all tour activities
 */
export async function getTourActivities(params: WPApiParams = {}): Promise<WPTourActivity[]> {
  return fetchAPI('/tour-activity', params);
}

/**
 * Get a single tour activity by slug
 */
export async function getTourActivityBySlug(slug: string): Promise<WPTourActivity | null> {
  const activities = await fetchAPI('/tour-activity', { slug });
  return activities[0] || null;
}

/**
 * Get all tour destinations
 */
export async function getTourDestinations(params: WPApiParams = {}): Promise<WPTourDestination[]> {
  return fetchAPI('/tour-destination', params);
}

/**
 * Get a single tour destination by slug
 */
export async function getTourDestinationBySlug(slug: string, lang?: string): Promise<WPTourDestination | null> {
  const destinations = await fetchAPI('/tour-destination', { slug });
  const term = destinations[0] || null;
  
  if (!term || !lang) {
    return term;
  }
  
  // For language-specific requests, get the actual count for that language
  // by querying tours with the destination and language filter
  try {
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL;
    if (!apiUrl) return term;

    const url = new URL(`${apiUrl}/tour`);
    
    // Handle Basic Auth for Local Live Link
    let authHeader = {};
    if (url.username && url.password) {
      const credentials = Buffer.from(`${url.username}:${url.password}`).toString('base64');
      authHeader = { 'Authorization': `Basic ${credentials}` };
      url.username = '';
      url.password = '';
    }

    url.searchParams.append('tour-destination', term.id.toString());
    url.searchParams.append('lang', lang);
    url.searchParams.append('per_page', '1');

    const response = await fetch(
      url.toString(),
      { 
        next: { revalidate: getRevalidateTime('/tour') },
        headers: {
          ...authHeader
        }
      }
    );
    
    if (response.ok) {
      const actualCount = parseInt(response.headers.get('X-WP-Total') || '0');
      return {
        ...term,
        count: actualCount,
      };
    }
  } catch (error) {
    console.error(`Error fetching language-specific count for destination ${slug}:`, error);
  }
  
  return term;
}

/**
 * Get related destinations for a given destination slug
 * Maps common location relationships (e.g., Canada includes all provinces/regions)
 * 
 * Level 1 (continents/regions): canada, north-america, etc - includes child regions/countries
 * Level 3 (cities/provinces): whitehorse, yellowknife, banff, atlantic-canada - specific regions only
 */
export async function getRelatedDestinations(slug: string): Promise<WPTourDestination[]> {
  const relatedSlugs: { [key: string]: string[] } = {
    // North America (level 1) - includes Canada and USA
    'north-america': ['canada', 'atlantic-canada', 'banff', 'whitehorse', 'yellowknife', 'usa'],
    // Canada (level 1) - includes all Canadian regions
    'canada': ['atlantic-canada', 'banff', 'whitehorse', 'yellowknife'],
    // Africa (level 1) - includes Kenya and other African destinations
    'africa': ['kenya'],
    // Level 3 regions - only search their specific tours (no related destinations)
    'atlantic-canada': [],
    'banff': [],
    'whitehorse': [],
    'yellowknife': [],
    'kenya': [],
  };
  
  const slugs = relatedSlugs[slug] || [];
  if (slugs.length === 0) {
    return [];
  }
  
  const destinations: WPTourDestination[] = [];
  for (const relatedSlug of slugs) {
    const dest = await getTourDestinationBySlug(relatedSlug);
    if (dest) {
      destinations.push(dest);
    }
  }
  
  return destinations;
}

/**
 * Get keyword search terms for a destination
 * Used as fallback when taxonomy isn't populated
 */
export function getDestinationKeywords(slug: string): string[] {
  const keywordMap: { [key: string]: string[] } = {
    // Canada and related regions
    'canada': ['canada', 'whitehorse', 'yellowknife', 'banff', 'atlantic', 'vancouver', 'whistler', 'britannia', 'northwest passage', 'hudson bay', 'st. lawrence', 'great lakes', 'arctic', 'canadian rockies', 'niagara'],
    'whitehorse': ['whitehorse', 'aurora'],
    'yellowknife': ['yellowknife', 'aurora'],
    'banff': ['banff'],
    'atlantic-canada': ['atlantic', 'newfoundland'],
    'north-america': ['canada', 'whitehorse', 'yellowknife', 'banff', 'atlantic', 'vancouver', 'whistler', 'britannia', 'usa', 'america', 'northwest passage', 'hudson bay', 'st. lawrence', 'great lakes', 'arctic', 'canadian rockies'],
    // Asia
    'asia': ['taiwan', 'japan', 'thailand', 'vietnam', 'cambodia', 'singapore', 'indonesia', 'china', 'hong kong'],
    'taiwan': ['taiwan'],
    // Africa
    'africa': ['kenya', 'tanzania', 'safari', 'uganda'],
    'kenya': ['kenya', 'safari'],
    // Europe
    'europe': ['france', 'scandinavia', 'spain', 'mediterranean', 'uk', 'italy', 'germany', 'norway', 'iceland', 'london', 'paris', 'amsterdam', 'venice', 'danube', 'rhine', 'baltic', 'adriatic', 'alps', 'ireland', 'scotland'],
    'western-europe': ['london', 'paris', 'france', 'spain', 'italy', 'germany', 'mediterranean', 'uk', 'ireland', 'netherlands', 'rhine'],
    // Americas (other)
    'america': ['america', 'hawaii', 'panama'],
    'usa': ['usa', 'united states'],
  };
  
  return keywordMap[slug] || [];
}

/**
 * Get tours by destination ID using taxonomy filtering
 * This uses the WordPress REST API's native taxonomy query which is more efficient
 * than fetching all tours and filtering client-side
 * 
 * @param destinationId - The destination term ID
 * @param params - Additional API parameters
 * @param lang - Language code for Polylang
 */
export async function getToursByDestinationId(destinationId: number, params: WPApiParams = {}, lang?: string): Promise<WPTour[]> {
  return fetchAPI('/tour', {
    'tour-destination': destinationId,
    _embed: true,
    per_page: 100, // WordPress REST API max is 100
    ...(lang && { lang }),
    ...params,
  });
}

/**
 * Get tours by destination slug
 * This is a convenience function that looks up the destination ID first, then queries by ID
 * 
 * @param slug - The destination slug
 * @param params - Additional API parameters
 * @param lang - Language code for Polylang
 */
export async function getToursByDestinationSlug(slug: string, params: WPApiParams = {}, lang?: string): Promise<WPTour[]> {
  const destination = await getTourDestinationBySlug(slug);
  if (!destination) {
    return [];
  }
  return getToursByDestinationId(destination.id, params, lang);
}

/**
 * Get tours by activity ID using taxonomy filtering
 * This uses the WordPress REST API's native taxonomy query which is more efficient
 * than fetching all tours and filtering client-side
 * 
 * @param activityId - The activity term ID
 * @param params - Additional API parameters
 * @param lang - Language code for Polylang
 */
export async function getToursByActivityId(activityId: number, params: WPApiParams = {}, lang?: string): Promise<WPTour[]> {
  return fetchAPI('/tour', {
    'tour-activity': activityId,
    _embed: true,
    ...(lang && { lang }),
    ...params,
  });
}

/**
 * Get tours by activity slug
 * This is a convenience function that looks up the activity ID first, then queries by ID
 * 
 * @param slug - The activity slug
 * @param params - Additional API parameters
 * @param lang - Language code for Polylang
 */
export async function getToursByActivitySlug(slug: string, params: WPApiParams = {}, lang?: string): Promise<WPTour[]> {
  const activity = await getTourActivityBySlug(slug);
  if (!activity) {
    return [];
  }
  return getToursByActivityId(activity.id, params, lang);
}

// ============================================
// Advanced Search API Functions
// ============================================

/**
 * Search tours with advanced filtering
 * Supports searching by title, destination, activity, and more
 * Handles title-based matching for unassigned tours
 * 
 * @param options - Search options
 *   - query: Search text for tour titles
 *   - destination: Destination ID or slug to filter by
 *   - activity: Activity ID or slug to filter by
 *   - orderby: Sort by 'date', 'title', 'modified' (default: 'date')
 *   - order: 'asc' or 'desc' (default: 'desc')
 *   - page: Page number for pagination (default: 1)
 *   - per_page: Results per page (default: 12)
 *   - lang: Language code for Polylang
 * 
 * @returns Object with:
 *   - tours: Array of matching tours
 *   - total: Total number of matching tours
 *   - totalPages: Total number of pages
 *   - page: Current page
 */
export async function searchToursAdvanced(options: {
  query?: string;
  destination?: number | string;
  destinations?: (number | string)[]; // Support multiple destinations
  activity?: number | string;
  orderby?: string;
  order?: string;
  page?: number;
  per_page?: number;
  lang?: string;
} = {}): Promise<{
  tours: WPTour[];
  total: number;
  totalPages: number;
  page: number;
}> {
  const {
    query = '',
    destination,
    destinations,
    activity,
    orderby = 'date',
    order = 'desc',
    page = 1,
    per_page = 12,
    lang,
  } = options;

  const apiUrl = getApiUrl();
  
  if (!apiUrl) {
    console.error('Error: WordPress API URL is not defined in searchToursAdvanced');
    console.error('Available environment variables:', Object.keys(process.env).join(', '));
    throw new Error('WordPress API URL is not defined');
  }

  const url = new URL(`${apiUrl}/tour`);

  // Build query parameters
  url.searchParams.append('_embed', 'true');
  url.searchParams.append('orderby', orderby);
  url.searchParams.append('order', order);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('per_page', per_page.toString());

  // Add search query if provided
  if (query) {
    url.searchParams.append('search', query);
  }

  // Add destination filter if provided
  if (destination) {
    const destId = typeof destination === 'string' 
      ? (await getTourDestinationBySlug(destination))?.id 
      : destination;
    if (destId) {
      url.searchParams.append('tour-destination', destId.toString());
    }
  }

  // Add multiple destinations filter if provided
  if (destinations && destinations.length > 0) {
    const destIds = await Promise.all(
      destinations.map(async (dest) => {
        if (typeof dest === 'string') {
          return (await getTourDestinationBySlug(dest))?.id;
        }
        return dest;
      })
    );
    const validIds = destIds.filter((id): id is number => id != null);
    if (validIds.length > 0) {
      // WordPress REST API supports comma-separated term IDs
      url.searchParams.append('tour-destination', validIds.join(','));
    }
  }

  // Add activity filter if provided
  if (activity) {
    const actId = typeof activity === 'string'
      ? (await getTourActivityBySlug(activity))?.id
      : activity;
    if (actId) {
      url.searchParams.append('tour-activity', actId.toString());
    }
  }

  // Add language parameter for Polylang
  if (lang && lang !== 'en') {
    url.searchParams.append('lang', lang);
  }

  const startTime = process.env.NODE_ENV === 'development' ? Date.now() : 0;

  const response = await fetch(url.toString(), {
    next: { revalidate: getRevalidateTime('/tour') },
  });

  if (process.env.NODE_ENV === 'development' && startTime) {
    const duration = Date.now() - startTime;
    console.log(`[Search API] /tour${url.search} - ${duration}ms - ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(`Search API Error: ${response.status} ${response.statusText}`);
  }

  const tours = await response.json();
  const total = parseInt(response.headers.get('X-WP-Total') || '0');
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');

  // Debug logging for activity searches
  if (activity && process.env.NODE_ENV === 'development') {
    console.log(`[Search Activity] Slug: ${activity}, Found: ${total} tours, Response type: ${typeof tours}, Is array: ${Array.isArray(tours)}`);
  }

  return {
    tours,
    total,
    totalPages,
    page,
  };
}

/**
 * Get all tours for megamenu/navigation
 * Returns minimal tour data for quick navigation menus
 * 
 * @param limit - Maximum number of tours to return (default: 30)
 * @param lang - Language code for Polylang
 * @returns Array of tours with essential data
 */
export async function getToursForMegamenu(limit: number = 30, lang?: string): Promise<WPTour[]> {
  return fetchAPI('/tour', {
    _embed: true,
    per_page: limit,
    orderby: 'date',
    order: 'desc',
    _fields: 'id,slug,title,featured_image_url,tour_meta',
    ...(lang && { lang }),
  });
}

/**
 * Get featured tours for homepage or special displays
 * Filters tours by featured status or other criteria
 * 
 * @param limit - Maximum number of tours to return (default: 6)
 * @param lang - Language code for Polylang
 * @returns Array of featured tours
 */
export async function getFeaturedTours(limit: number = 6, lang?: string): Promise<WPTour[]> {
  return fetchAPI('/tour', {
    _embed: true,
    per_page: limit,
    orderby: 'date',
    order: 'desc',
    _fields: 'id,slug,title,featured_image_url,tour_meta,excerpt',
    ...(lang && { lang }),
  });
}

/**
 * Get tours by type using keyword and tag matching
 * Supports: Attraction Tickets, Package Tours, Cruises
 * 
 * @param type - Tour type ('attraction-tickets', 'land-tours', 'cruises')
 * @param params - Additional API parameters
 * @param lang - Language code for Polylang
 * @returns Array of matching tours
 */
export async function getToursByType(type: string, params: WPApiParams = {}, lang?: string): Promise<WPTour[]> {
  const typeConfig: Record<string, { activity?: number; keywords: string[]; tag?: string; excludeKeywords?: string[] }> = {
    'attraction-tickets': {
      activity: 67, // Outdoor Activites (where the 3 real ticket tours are tagged)
      keywords: [], // No keyword fallback for tickets - use activity only
    },
    'land-tours': {
      keywords: ['package tour'],
      excludeKeywords: ['cruise', 'ticket', 'admission'],
      // Land tours are multi-day package tours (excludes cruises and day trips)
    },
    'cruises': {
      keywords: ['cruise', 'river cruise', 'expedition'],
      excludeKeywords: ['safari', 'wildlife', 'kenya'],
      // Use keywords only - 'viking' tag is misleading and includes non-cruise tours
    },
  };

  const config = typeConfig[type];
  if (!config) {
    return [];
  }

  // First try searching by activity if available
  if (config.activity) {
    try {
      const tours = await getToursByActivityId(config.activity, {
        _embed: true,
        per_page: 100,
        ...params,
        ...(lang && { lang }),
      });
      if (tours.length > 0) {
        // For attraction-tickets, filter to only include tours with "Ticket" in title
        if (type === 'attraction-tickets') {
          return tours.filter(tour => 
            tour.title.rendered.toLowerCase().includes('ticket') ||
            tour.title.rendered.toLowerCase().includes('admission')
          );
        }
        return tours;
      }
    } catch (e) {
      console.error(`Error fetching tours by activity ${config.activity}:`, e);
    }
  }

  // Second try searching by tag if available
  if (config.tag) {
    try {
      const tag = await getTourTagBySlug(config.tag);
      if (tag) {
        const tours = await getToursByTag(tag.id, {
          _embed: true,
          per_page: 100,
          ...params,
          ...(lang && { lang }),
        });
        if (tours.length > 0) {
          return tours;
        }
      }
    } catch (e) {
      console.error(`Error fetching tours by tag ${config.tag}:`, e);
    }
  }

  // Fallback: search by keywords
  let allTours: WPTour[] = [];
  const seen = new Set<number>();

  for (const keyword of config.keywords) {
    try {
      const result = await searchTours(keyword, {
        _embed: true,
        per_page: 100,
        ...params,
        ...(lang && { lang }),
      });
      result.forEach((tour) => {
        if (!seen.has(tour.id)) {
          // Apply exclusion filter if specified
          if (config.excludeKeywords) {
            const titleLower = tour.title.rendered.toLowerCase();
            const shouldExclude = config.excludeKeywords.some(exclude => 
              titleLower.includes(exclude.toLowerCase())
            );
            if (shouldExclude) {
              return; // Skip this tour
            }
          }
          allTours.push(tour);
          seen.add(tour.id);
        }
      });
    } catch (e) {
      console.error(`Error searching tours with keyword ${keyword}:`, e);
    }
  }

  return allTours;
}

/**
 * Get tour type information
 * Returns label and other metadata for a tour type
 * 
 * @param type - Tour type slug
 * @returns Type information object
 */
export function getTourTypeInfo(type: string): {
  label: string;
  description: string;
  slug: string;
} | null {
  const types: Record<string, { label: string; description: string; slug: string }> = {
    'attraction-tickets': {
      label: 'Attraction Tickets',
      description: 'Admission and activity tickets for popular attractions',
      slug: 'attraction-tickets',
    },
    'land-tours': {
      label: 'Package Tours',
      description: 'Multi-day package tours and vacation packages',
      slug: 'land-tours',
    },
    'cruises': {
      label: 'Cruises',
      description: 'River cruises, ocean cruises, and expedition cruises',
      slug: 'cruises',
    },
  };

  return types[type] || null;
}

/**
 * Get tours by duration range
 * Filters tours based on number of days
 * 
 * @param durationSlug - Duration slug ('single-day', 'short-breaks', 'weeklong', 'extended-journeys', 'grand-voyages')
 * @param params - Additional API parameters
 * @param lang - Language code for Polylang
 * @returns Array of matching tours
 */
export async function getToursByDuration(durationSlug: string, params: WPApiParams = {}, lang?: string): Promise<WPTour[]> {
  // Fetch all tours and filter by duration
  // WordPress REST API max is 100 per_page, so fetch up to 200 tours to ensure we get most of them
  let allTours: WPTour[] = [];
  
  // Fetch first batch
  const batch1 = await getTours({
    _embed: true,
    per_page: 100,
    page: 1,
    ...params,
    ...(lang && { lang }),
  });
  allTours = allTours.concat(batch1);
  console.log(`[getToursByDuration] Batch 1: ${batch1.length} tours, slug: ${durationSlug}`);
  
  // Fetch second batch if there are likely more tours
  if (batch1.length === 100) {
    try {
      const batch2 = await getTours({
        _embed: true,
        per_page: 100,
        page: 2,
        ...params,
        ...(lang && { lang }),
      });
      allTours = allTours.concat(batch2);
      console.log(`[getToursByDuration] Batch 2: ${batch2.length} tours`);
    } catch (e) {
      // Silently ignore if second batch fails
      console.warn('Could not fetch second batch of tours for duration filtering');
    }
  }

  const tours = allTours;
  console.log(`[getToursByDuration] Total fetched: ${tours.length} tours, filtering by slug: ${durationSlug}`);

  // DEBUG: Check first tour
  if (tours.length > 0) {
    const firstTour = tours[0];
    const days = extractTourDays(firstTour);
    console.log(`[getToursByDuration] First tour: "${firstTour.title?.rendered}" = ${days} days`);
  }

  const filtered = tours.filter(tour => {
    const days = extractTourDays(tour);
    
    let matches = false;
    switch (durationSlug) {
      case 'single-day':
        matches = days === 1;
        break;
      case 'short-breaks':
        matches = days >= 2 && days <= 4;
        break;
      case 'weeklong':
        matches = days >= 5 && days <= 8;
        break;
      case 'extended-journeys':
        matches = days >= 9 && days <= 29;
        break;
      case 'grand-voyages':
        matches = days >= 30;
        break;
    }
    
    return matches;
  });

  console.log(`[getToursByDuration] Filtered result: ${filtered.length} tours for ${durationSlug}`);
  return filtered;
}

/**
 * Extract number of days from a tour
 * Checks tour_meta.duration_days first, then parses from duration_text or title
 */
function extractTourDays(tour: WPTour): number {
  // First try tour_meta.duration_days
  if (tour.tour_meta?.duration_days) {
    const days = parseInt(tour.tour_meta.duration_days);
    if (!isNaN(days) && days > 0) {
      return days;
    }
  }

  // Try parsing from duration_text
  if (tour.tour_meta?.duration_text) {
    const match = tour.tour_meta.duration_text.match(/(\d+)\s*Days?/i);
    if (match) {
      return parseInt(match[1]);
    }
  }

  // Try parsing from title - look for "X Days" or "X Day"
  const titleRendered = tour.title?.rendered || tour.title || '';
  const titleLower = typeof titleRendered === 'string' ? titleRendered.toLowerCase() : '';
  
  // Match patterns like "4 Days", "8 Days/7 Nights", "27 Days"
  const daysMatch = titleLower.match(/(\d+)\s*days?(?:\/|[^0-9]|$)/i);
  if (daysMatch) {
    return parseInt(daysMatch[1]);
  }

  // If title contains "ticket" or "admission", it's likely a single-day activity
  if (titleLower.includes('ticket') || titleLower.includes('admission')) {
    return 1;
  }

  // Default: can't determine, return 0
  return 0;
}

/**
 * Get duration type information
 * Returns label and other metadata for a duration type
 */
export function getDurationTypeInfo(slug: string): {
  label: string;
  description: string;
  slug: string;
} | null {
  const durations: Record<string, { label: string; description: string; slug: string }> = {
    'single-day': {
      label: 'Single-Day Tickets',
      description: 'Quick attractions and day activities',
      slug: 'single-day',
    },
    'short-breaks': {
      label: '1–4 Days (Short Breaks)',
      description: 'Weekend getaways and short trips',
      slug: 'short-breaks',
    },
    'weeklong': {
      label: '5–8 Days (Weeklong)',
      description: 'Full week vacations and tours',
      slug: 'weeklong',
    },
    'extended-journeys': {
      label: '9–29 Days (Extended Journeys)',
      description: 'In-depth explorations and adventures',
      slug: 'extended-journeys',
    },
    'grand-voyages': {
      label: '30+ Days (Grand Voyages)',
      description: 'Epic journeys and world tours',
      slug: 'grand-voyages',
    },
  };

  return durations[slug] || null;
}

/**
 * Get all Google reviews synced from SerpAPI
 * Reviews are fetched from the custom WordPress REST endpoint
 * @returns All available Google reviews (45+)
 */
// Fetch reviews from WordPress
export async function getGoogleReviews(): Promise<GoogleReview[]> {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    console.warn('[Reviews] API URL not configured');
    return [];
  }

  try {
    // Get base URL (remove /wp-json/wp/v2 from API_URL)
    const baseUrl = apiUrl.replace('/wp-json/wp/v2', '');
    const url = new URL(`${baseUrl}/wp-json/qualitour/v1/google-reviews`);
    
    // Handle Basic Auth for Local Live Link
    let authHeader = {};
    if (url.username && url.password) {
      const credentials = Buffer.from(`${url.username}:${url.password}`).toString('base64');
      authHeader = { 'Authorization': `Basic ${credentials}` };
      url.username = '';
      url.password = '';
    }
    
    const response = await fetch(
      url.toString(),
      { 
        next: { revalidate: false }, // Static (cache forever)
        headers: {
          ...authHeader
        }
      }
    );

    if (!response.ok) {
      console.warn(`[Reviews] API returned ${response.status}`);
      return [];
    }

    const reviews = await response.json();
    
    if (!Array.isArray(reviews)) {
      console.warn('[Reviews] Unexpected response format');
      return [];
    }

    console.log(`[Reviews] Retrieved ${reviews.length} reviews from WordPress`);
    return reviews;
  } catch (error) {
    console.error('[Reviews] Error fetching reviews:', error);
    return [];
  }
}

/**
 * Get reviews with aggregated business details
 * @returns Place details including aggregated rating and review count
 */
export async function getBusinessReviews(): Promise<PlaceDetails | null> {
  const reviews = await getGoogleReviews();
  
  if (!reviews || reviews.length === 0) {
    console.warn('[Reviews] No reviews available');
    return null;
  }

  return {
    name: 'Qualitour - Vancouver Branch',
    formatted_address: 'Vancouver, BC, Canada',
    rating: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
    user_ratings_total: reviews.length,
    reviews,
  };
}
