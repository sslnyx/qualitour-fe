import { WPPost, WPPage, WPCategory, WPTag, WPMedia, WPApiParams, WPTour, WPTourCategory, WPTourTag, WPTourActivity, WPTourDestination, WPTourDuration, WPTourType, GoogleReview, PlaceDetails } from './types';

const TOUR_TAXONOMY_FIELDS = 'id,slug,name,parent,count,description';
// Note: tours no longer use WP REST `_embed` to avoid large `_embedded` payloads.
// Use custom REST fields (e.g. `featured_image_url`, `tour_terms`) instead.
const TOUR_LIST_FIELDS = 'id,slug,title,excerpt,featured_media,tour_category,tour_tag,featured_image_url,tour_meta,tour_terms';
const TOUR_SINGLE_FIELDS =
  'id,slug,title,content,excerpt,featured_media,featured_image_url,tour_meta,goodlayers_data,acf_fields,tour_terms';

// Helper to get API URL dynamically
function getApiUrl() {
  return process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL;
}

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function toBase64(value: string): string {
  // Node.js
  if (typeof (globalThis as any).Buffer !== 'undefined') {
    return (globalThis as any).Buffer.from(value).toString('base64');
  }

  // Edge / browser
  if (typeof globalThis.btoa === 'function') {
    // Credentials are typically ASCII, but keep this UTF-8 safe.
    const utf8 = new TextEncoder().encode(value);
    let binary = '';
    for (const byte of utf8) binary += String.fromCharCode(byte);
    return globalThis.btoa(binary);
  }

  throw new Error('No base64 encoder available in this runtime');
}

/**
 * Base URL for our custom WordPress endpoints (e.g. /wp-json/qualitour/v1).
 *
 * Preferred:
 * - NEXT_PUBLIC_WORDPRESS_CUSTOM_API_URL=https://.../wp-json/qualitour/v1
 * - WORDPRESS_CUSTOM_API_URL=https://.../wp-json/qualitour/v1
 *
 * Fallback: derive from NEXT_PUBLIC_WORDPRESS_API_URL (wp/v2) if possible.
 */
function getCustomApiUrl() {
  const direct =
    process.env.NEXT_PUBLIC_WORDPRESS_CUSTOM_API_URL ||
    process.env.WORDPRESS_CUSTOM_API_URL;
  if (direct) return normalizeBaseUrl(direct);

  const apiUrl = getApiUrl();
  if (!apiUrl) return undefined;

  if (apiUrl.includes('/wp-json/qualitour/v1')) return normalizeBaseUrl(apiUrl);
  if (apiUrl.includes('/wp-json/wp/v2')) {
    return normalizeBaseUrl(apiUrl.replace('/wp-json/wp/v2', '/wp-json/qualitour/v1'));
  }

  // Last resort: assume apiUrl is an origin-like URL.
  try {
    const parsed = new URL(apiUrl);
    return `${parsed.origin}/wp-json/qualitour/v1`;
  } catch {
    return undefined;
  }
}

type V1TermMinimal = {
  id: number;
  slug: string;
  name: string;
  parent: number;
  count: number;
};

async function fetchToursV1(params: Record<string, any>, lang?: string): Promise<{ tours: WPTour[]; total: number; totalPages: number }> {
  const customApiUrl = getCustomApiUrl();
  if (!customApiUrl) {
    throw new Error('Custom API URL is not defined');
  }

  const url = new URL(`${customApiUrl}/tours`);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      url.searchParams.set(key, value.join(','));
    } else {
      url.searchParams.set(key, String(value));
    }
  }

  if (lang && lang !== 'en') {
    url.searchParams.set('lang', lang);
  }

  // Stable cache key to avoid reusing poisoned cached responses.
  url.searchParams.set('qt_cache', 'v1');

  const startTime = process.env.NODE_ENV === 'development' ? Date.now() : 0;

  // Add Basic Auth for protected WP endpoints (Workers/Production)
  const urlObj = new URL(url.toString());
  let authHeader: Record<string, string> = {};

  // Try URL credentials first (Local Live Link), then env vars (Workers)
  let username = urlObj.username;
  let password = urlObj.password;

  if (!username || !password) {
    username = process.env.WORDPRESS_AUTH_USER || '';
    password = process.env.WORDPRESS_AUTH_PASS || '';
  }

  if (username && password) {
    const credentials = toBase64(`${username}:${password}`);
    authHeader = { Authorization: `Basic ${credentials}` };
    // Remove credentials from URL to avoid fetch issues / leaking
    urlObj.username = '';
    urlObj.password = '';
  }

  // Deduplicate identical queries briefly (shared bounded TTL cache).
  const cacheKey = `fetchToursV1:${urlObj.toString()}`;
  const now = Date.now();
  pruneRequestCache(now);
  const cached = requestCache.get(cacheKey);
  if (cached && now - cached.createdAt <= REQUEST_CACHE_TTL_MS) {
    return cached.promise;
  }

  const timeoutMs = Number(process.env.WP_FETCH_TIMEOUT_MS || 8000);
  const controller = Number.isFinite(timeoutMs) && timeoutMs > 0 ? new AbortController() : null;
  const timeoutId = controller
    ? setTimeout(() => {
        controller.abort();
      }, timeoutMs)
    : null;

  const promise = (async () => {
    const response = await fetch(urlObj.toString(), {
      next: { revalidate: getRevalidateTime('/tour') },
      signal: controller?.signal,
      headers: {
        ...authHeader,
        'User-Agent': 'Mozilla/5.0 (compatible; Qualitour-API/1.0)',
      },
    }).finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });

    if (process.env.NODE_ENV === 'development' && startTime) {
      const duration = Date.now() - startTime;
      console.log(`[API] /qualitour/v1/tours${url.search} - ${duration}ms - ${response.status}`);
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          'WordPress API Error: 401 Unauthorized. ' +
            'Set WORDPRESS_AUTH_USER/WORDPRESS_AUTH_PASS in the Worker (or make the REST API publicly readable).'
        );
      }
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }

    const tours = (await response.json()) as WPTour[];
    const total = Number(response.headers.get('X-WP-Total') || '0');
    const totalPages = Number(response.headers.get('X-WP-TotalPages') || '1');

    return {
      tours: Array.isArray(tours) ? tours : [],
      total,
      totalPages,
    };
  })();

  requestCache.set(cacheKey, { createdAt: now, promise });
  promise.catch(() => {
    requestCache.delete(cacheKey);
  });

  return promise;
}

async function fetchTermsV1(
  taxonomy: string,
  params: Record<string, any>
): Promise<{ terms: V1TermMinimal[]; total: number; totalPages: number }> {
  const customApiUrl = getCustomApiUrl();
  if (!customApiUrl) {
    throw new Error('Custom API URL is not defined');
  }

  const url = new URL(`${customApiUrl}/terms/${taxonomy}`);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (key === '_fields' || key === '_embed') continue;

    if (Array.isArray(value)) {
      url.searchParams.set(key, value.join(','));
    } else {
      url.searchParams.set(key, String(value));
    }
  }

  // Stable cache key to avoid reusing poisoned cached responses.
  url.searchParams.set('qt_cache', 'v1');

  const startTime = process.env.NODE_ENV === 'development' ? Date.now() : 0;

  // Basic Auth for protected WP endpoints
  const urlObj = new URL(url.toString());
  let authHeader: Record<string, string> = {};

  let username = urlObj.username;
  let password = urlObj.password;
  if (!username || !password) {
    username = process.env.WORDPRESS_AUTH_USER || '';
    password = process.env.WORDPRESS_AUTH_PASS || '';
  }

  if (username && password) {
    const credentials = toBase64(`${username}:${password}`);
    authHeader = { Authorization: `Basic ${credentials}` };
    urlObj.username = '';
    urlObj.password = '';
  }

  const cacheKey = `fetchTermsV1:${urlObj.toString()}`;
  const now = Date.now();
  pruneRequestCache(now);
  const cached = requestCache.get(cacheKey);
  if (cached && now - cached.createdAt <= REQUEST_CACHE_TTL_MS) {
    return cached.promise;
  }

  const timeoutMs = Number(process.env.WP_FETCH_TIMEOUT_MS || 8000);
  const controller = Number.isFinite(timeoutMs) && timeoutMs > 0 ? new AbortController() : null;
  const timeoutId = controller
    ? setTimeout(() => {
        controller.abort();
      }, timeoutMs)
    : null;

  const promise = (async () => {
    const response = await fetch(urlObj.toString(), {
      next: { revalidate: getRevalidateTime('/terms') },
      signal: controller?.signal,
      headers: {
        ...authHeader,
        'User-Agent': 'Mozilla/5.0 (compatible; Qualitour-API/1.0)',
      },
    }).finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });

    if (process.env.NODE_ENV === 'development' && startTime) {
      const duration = Date.now() - startTime;
      console.log(`[API] /qualitour/v1/terms/${taxonomy}${url.search} - ${duration}ms - ${response.status}`);
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          'WordPress API Error: 401 Unauthorized. ' +
            'Set WORDPRESS_AUTH_USER/WORDPRESS_AUTH_PASS (or make the REST API publicly readable).'
        );
      }
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }

    const terms = (await response.json()) as V1TermMinimal[];
    const total = Number(response.headers.get('X-WP-Total') || '0');
    const totalPages = Number(response.headers.get('X-WP-TotalPages') || '1');

    return {
      terms: Array.isArray(terms) ? terms : [],
      total,
      totalPages,
    };
  })();

  requestCache.set(cacheKey, { createdAt: now, promise });
  promise.catch(() => {
    requestCache.delete(cacheKey);
  });

  return promise;
}

function mapV1TermToTourDestination(term: V1TermMinimal): WPTourDestination {
  return {
    id: term.id,
    slug: term.slug,
    name: term.name,
    parent: term.parent,
    count: term.count,
    taxonomy: 'tour-destination',
    description: '',
    link: '',
    meta: [],
    acf: [],
    _links: {},
  };
}

function mapV1TermToTourActivity(term: V1TermMinimal): WPTourActivity {
  return {
    id: term.id,
    slug: term.slug,
    name: term.name,
    parent: term.parent,
    count: term.count,
    taxonomy: 'tour-activity',
    description: '',
    link: '',
  };
}

function mapV1TermToTourCategory(term: V1TermMinimal): WPTourCategory {
  return {
    id: term.id,
    slug: term.slug,
    name: term.name,
    parent: term.parent,
    count: term.count,
    taxonomy: 'tour_category',
    description: '',
    link: '',
  };
}

function mapV1TermToTourTag(term: V1TermMinimal): WPTourTag {
  return {
    id: term.id,
    slug: term.slug,
    name: term.name,
    count: term.count,
    taxonomy: 'tour_tag',
    description: '',
    link: '',
  };
}

function mapV1TermToTourType(term: V1TermMinimal): WPTourType {
  return {
    id: term.id,
    slug: term.slug,
    name: term.name,
    count: term.count,
    taxonomy: 'tour_type',
    description: '',
    link: '',
  };
}

function mapV1TermToTourDuration(term: V1TermMinimal): WPTourDuration {
  return {
    id: term.id,
    slug: term.slug,
    name: term.name,
    count: term.count,
    taxonomy: 'tour_duration',
    description: '',
    link: '',
  };
}

export async function getToursPaged(
  params: WPApiParams = {},
  lang?: string
): Promise<{ tours: WPTour[]; total: number; totalPages: number }> {
  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const { tours, total, totalPages } = await fetchToursV1(
      {
        _fields: TOUR_LIST_FIELDS,
        orderby: 'date',
        order: 'desc',
        ...params,
      },
      lang
    );
    return { tours, total, totalPages };
  }

  // Legacy wp/v2 fallback (only used when custom API isn't configured)
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    throw new Error('WordPress API URL is not defined');
  }

  const url = new URL(`${apiUrl}/tour`);
  const merged = {
    _fields: TOUR_LIST_FIELDS,
    orderby: 'date',
    order: 'desc',
    ...params,
  } as Record<string, any>;

  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) url.searchParams.set(key, value.join(','));
    else url.searchParams.set(key, String(value));
  }
  if (lang && lang !== 'en') url.searchParams.set('lang', lang);

  const urlObj = new URL(url.toString());
  let authHeader: Record<string, string> = {};
  let username = urlObj.username;
  let password = urlObj.password;
  if (!username || !password) {
    username = process.env.WORDPRESS_AUTH_USER || '';
    password = process.env.WORDPRESS_AUTH_PASS || '';
  }
  if (username && password) {
    const credentials = toBase64(`${username}:${password}`);
    authHeader = { Authorization: `Basic ${credentials}` };
    urlObj.username = '';
    urlObj.password = '';
  }

  const response = await fetch(urlObj.toString(), {
    next: { revalidate: getRevalidateTime('/tour') },
    headers: {
      ...authHeader,
      'User-Agent': 'Mozilla/5.0 (compatible; Qualitour-API/1.0)',
    },
  });
  if (!response.ok) {
    throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
  }
  const tours = (await response.json()) as WPTour[];
  const total = Number(response.headers.get('X-WP-Total') || '0');
  const totalPages = Number(response.headers.get('X-WP-TotalPages') || '1');
  return { tours: Array.isArray(tours) ? tours : [], total, totalPages };
}

/**
 * Request-level cache to prevent duplicate API calls during single render
 * NOTE: In Edge/Worker runtimes, module scope can persist across requests.
 * Keep this cache bounded + short-lived to avoid memory growth (Cloudflare 1102).
 */
type RequestCacheEntry = {
  createdAt: number;
  promise: Promise<any>;
};

const requestCache = new Map<string, RequestCacheEntry>();
const REQUEST_CACHE_MAX_ENTRIES = 200;
const REQUEST_CACHE_TTL_MS = 15_000;

function pruneRequestCache(now: number) {
  // Drop expired entries first.
  for (const [key, entry] of requestCache) {
    if (now - entry.createdAt > REQUEST_CACHE_TTL_MS) {
      requestCache.delete(key);
    }
  }

  // If still too large, remove oldest entries.
  if (requestCache.size <= REQUEST_CACHE_MAX_ENTRIES) return;

  const entries = Array.from(requestCache.entries());
  entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
  const overflow = requestCache.size - REQUEST_CACHE_MAX_ENTRIES;
  for (let i = 0; i < overflow; i++) {
    requestCache.delete(entries[i]![0]);
  }
}

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

  // Tour taxonomies change occasionally (menu/hierarchy updates)
  if (
    endpoint.includes('tour-destination') ||
    endpoint.includes('tour-activity') ||
    endpoint.includes('tour-duration') ||
    endpoint.includes('tour-type')
  ) return 3600; // 1 hour

	// Custom v1 terms endpoint
	if (endpoint.includes('/terms')) return 3600;
  
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
  const now = Date.now();
  pruneRequestCache(now);
  const cached = requestCache.get(cacheKey);
  if (cached && now - cached.createdAt <= REQUEST_CACHE_TTL_MS) {
    return cached.promise;
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
      const credentials = toBase64(`${username}:${password}`);
      authHeader = { 'Authorization': `Basic ${credentials}` };
      // Remove credentials from URL to prevent fetch error
      urlObj.username = '';
      urlObj.password = '';
    }

    const revalidateTime = getRevalidateTime(endpoint);

    const timeoutMs = Number(process.env.WP_FETCH_TIMEOUT_MS || 8000);
    const controller = !options.signal && Number.isFinite(timeoutMs) && timeoutMs > 0 ? new AbortController() : null;
    const timeoutId = controller
      ? setTimeout(() => {
          controller.abort();
        }, timeoutMs)
      : null;

    const response = await fetch(urlObj.toString(), {
      // Smart ISR revalidation based on endpoint type
      // If revalidateTime is false, use force-cache (Static)
      // If revalidateTime is a number, use next: { revalidate: n } (ISR)
      ...(revalidateTime === false 
        ? { cache: 'force-cache' } 
        : { next: { revalidate: revalidateTime } }
      ),
      ...options,
      signal: options.signal ?? controller?.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Qualitour-API/1.0)',
        ...authHeader,
        ...options.headers,
      },
    }).finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });

    if (process.env.NODE_ENV === 'development' && startTime) {
      const duration = Date.now() - startTime;
      console.log(`[API] ${endpoint} - ${duration}ms - ${response.status}`);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[API Error Body] ${endpoint}:`, errorBody);
      if (response.status === 401) {
        throw new Error(
          'WordPress API Error: 401 Unauthorized. ' +
            'Set WORDPRESS_AUTH_USER/WORDPRESS_AUTH_PASS in the Worker (or make the REST API publicly readable).'
        );
      }
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  })();

  // Store promise in cache (bounded/TTL)
  requestCache.set(cacheKey, { createdAt: now, promise });

  // If this request fails, drop it so future calls can retry.
  promise.catch(() => {
    requestCache.delete(cacheKey);
  });
  
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
export async function getPagesByLang(params: WPApiParams = {}, lang?: string): Promise<WPPage[]> {
  return fetchAPI('/pages', {
    _embed: true,
    ...(lang && { lang }),
    ...params,
  });
}

export async function getPageBySlug(slug: string, lang?: string): Promise<WPPage | null> {
  const pages = await fetchAPI('/pages', {
    slug,
    _embed: true,
    ...(lang && { lang }),
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
  // We intentionally avoid WP REST `_embed` for tours.
  const { _embed: _ignoredEmbed, ...safeParams } = params;

  const customApiUrl = getCustomApiUrl();

  // If slug is provided, use the dedicated slug endpoint (v1 if available).
  if (customApiUrl && typeof (safeParams as any).slug === 'string' && (safeParams as any).slug) {
    const tour = await getTourBySlug((safeParams as any).slug, lang);
    return tour ? [tour] : [];
  }

  // Prefer custom v1 endpoint for all list-like tour reads.
  if (customApiUrl) {
    const { _fields, search, page, per_page, orderby, order, ...rest } = safeParams as Record<string, any>;

    // Map wp/v2-style taxonomy params to v1 args.
    const mappedParams: Record<string, any> = {
      page,
      per_page,
      orderby,
      order,
      search,
      _fields,
    };

    // Keep these in wp/v2-style names (plugin supports them directly).
    if (rest.tour_tag != null) mappedParams.tour_tag = rest.tour_tag;
    if (rest.tour_category != null) mappedParams.tour_category = rest.tour_category;
    if (rest['tour-type'] != null) mappedParams['tour-type'] = rest['tour-type'];
    if (rest['tour-duration'] != null) mappedParams['tour-duration'] = rest['tour-duration'];
    if (rest['tour-brand'] != null) mappedParams['tour-brand'] = rest['tour-brand'];

    // Destination/activity filters (plugin supports v1 args and aliases).
    if (rest['tour-destination'] != null) mappedParams['tour-destination'] = rest['tour-destination'];
    if (rest['tour-activity'] != null) mappedParams['tour-activity'] = rest['tour-activity'];

    // Zero-fallback: if callers pass params we don't support in v1, fail loudly
    // so we can implement them in the v1 endpoint (instead of silently using wp/v2).
    const allowedRestKeys = new Set([
      'tour_tag',
      'tour_category',
      'tour-type',
      'tour-duration',
      'tour-brand',
      'tour-destination',
      'tour-activity',
      'slug',
    ]);
    const unsupportedKeys = Object.keys(rest).filter((k) => !allowedRestKeys.has(k));
    if (unsupportedKeys.length > 0) {
      throw new Error(
        `getTours: unsupported params for qualitour/v1: ${unsupportedKeys.join(', ')}. ` +
          'Add support to /wp-json/qualitour/v1/tours instead of falling back to wp/v2.'
      );
    }

    // For list views, ensure we keep payload small by default.
    const isListView = !(safeParams as any).slug && (Number((safeParams as any).per_page || 0) > 1);
    if (isListView && !mappedParams._fields) {
      mappedParams._fields = TOUR_LIST_FIELDS;
    }

    const result = await fetchToursV1(mappedParams, lang);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[getTours] v1 returned ${result.tours.length} tours`);
    }
    return result.tours;
  }

  // For list views, only fetch essential fields to reduce payload
  const isListView = !safeParams.slug && (safeParams.per_page || 0) > 1;
  
  if (isListView) {
    const result = await fetchAPI('/tour', {
      // Only fetch fields needed for tour cards
      _fields: TOUR_LIST_FIELDS,
      ...(lang && { lang }),
      ...safeParams,
    });
    if (process.env.NODE_ENV === 'development') {
      console.log(`[getTours] List view returned ${result.length} tours`);
    }
    return result;
  }
  
  return fetchAPI('/tour', {
    ...(lang && { lang }),
    ...safeParams,
  });
}

/**
 * Get tours with minimal data for performance
 * Use for listing pages where full content isn't needed
 */
export async function getToursMinimal(params: WPApiParams = {}): Promise<WPTour[]> {
  const { _embed: _ignoredEmbed, ...safeParams } = params;
  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const result = await fetchToursV1({
      _fields: 'id,slug,title,excerpt,featured_image_url,tour_meta,tour_terms',
      ...safeParams,
    });
    return result.tours;
  }

  return fetchAPI('/tour', {
    _fields: 'id,slug,title,excerpt,featured_image_url,tour_meta,tour_terms',
    ...safeParams,
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

  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const url = new URL(`${customApiUrl}/tours/slug/${encodedSlug}`);
    url.searchParams.set('_fields', TOUR_SINGLE_FIELDS);
    if (lang && lang !== 'en') url.searchParams.set('lang', lang);
    url.searchParams.set('qt_cache', 'v1');

    const startTime = process.env.NODE_ENV === 'development' ? Date.now() : 0;

    // Add Basic Auth for protected WP endpoints (Workers/Production)
    const urlObj = new URL(url.toString());
    let authHeader: Record<string, string> = {};

    // Try URL credentials first (Local Live Link), then env vars (Workers)
    let username = urlObj.username;
    let password = urlObj.password;

    if (!username || !password) {
      username = process.env.WORDPRESS_AUTH_USER || '';
      password = process.env.WORDPRESS_AUTH_PASS || '';
    }

    if (username && password) {
      const credentials = toBase64(`${username}:${password}`);
      authHeader = { Authorization: `Basic ${credentials}` };
      urlObj.username = '';
      urlObj.password = '';
    }

    const cacheKey = `getTourBySlug:${urlObj.toString()}`;
    const now = Date.now();
    pruneRequestCache(now);
    const cached = requestCache.get(cacheKey);
    if (cached && now - cached.createdAt <= REQUEST_CACHE_TTL_MS) {
      return cached.promise;
    }

    const timeoutMs = Number(process.env.WP_FETCH_TIMEOUT_MS || 8000);
    const controller = Number.isFinite(timeoutMs) && timeoutMs > 0 ? new AbortController() : null;
    const timeoutId = controller
      ? setTimeout(() => {
          controller.abort();
        }, timeoutMs)
      : null;

    const promise = (async () => {
      const response = await fetch(urlObj.toString(), {
        next: { revalidate: getRevalidateTime('/tour') },
        signal: controller?.signal,
        headers: {
          ...authHeader,
          'User-Agent': 'Mozilla/5.0 (compatible; Qualitour-API/1.0)',
        },
      }).finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      });

      if (process.env.NODE_ENV === 'development' && startTime) {
        const duration = Date.now() - startTime;
        console.log(`[Tour API] /qualitour/v1/tours/slug/${encodedSlug} - ${duration}ms - ${response.status}`);
      }

      if (!response.ok) {
        if (response.status === 404) return null;
        if (response.status === 401) {
          throw new Error(
            'Tour API Error: 401 Unauthorized. ' +
              'Set WORDPRESS_AUTH_USER/WORDPRESS_AUTH_PASS in the Worker (or make the REST API publicly readable).'
          );
        }
        throw new Error(`Tour API Error: ${response.status} ${response.statusText}`);
      }

      const tour = (await response.json()) as WPTour;
      return tour || null;
    })();

    requestCache.set(cacheKey, { createdAt: now, promise });
    promise.catch(() => {
      requestCache.delete(cacheKey);
    });

    return promise;
  }

  const tours = await fetchAPI('/tour', {
    slug: encodedSlug,
    per_page: 1,
    _fields: TOUR_SINGLE_FIELDS,
    ...(lang && { lang }),
  });
  return tours[0] || null;
}

/**
 * Get a single tour by ID
 */
export async function getTourById(id: number): Promise<WPTour | null> {
  try {
    const customApiUrl = getCustomApiUrl();
    if (customApiUrl) {
      const url = new URL(`${customApiUrl}/tours/${id}`);
      url.searchParams.set(
        '_fields',
        'id,slug,title,content,excerpt,featured_media,featured_image_url,tour_meta,goodlayers_data,acf_fields,tour_category,tour_tag,tour_terms'
      );
      url.searchParams.set('qt_cache', 'v1');

      // Reuse the same auth + timeout behavior as other v1 fetchers by delegating through fetchToursV1 isn't possible here.
      // Keep a small inline fetch.
      const urlObj = new URL(url.toString());
      let authHeader: Record<string, string> = {};

      let username = urlObj.username;
      let password = urlObj.password;
      if (!username || !password) {
        username = process.env.WORDPRESS_AUTH_USER || '';
        password = process.env.WORDPRESS_AUTH_PASS || '';
      }
      if (username && password) {
        const credentials = toBase64(`${username}:${password}`);
        authHeader = { Authorization: `Basic ${credentials}` };
        urlObj.username = '';
        urlObj.password = '';
      }

      const timeoutMs = Number(process.env.WP_FETCH_TIMEOUT_MS || 8000);
      const controller = Number.isFinite(timeoutMs) && timeoutMs > 0 ? new AbortController() : null;
      const timeoutId = controller
        ? setTimeout(() => {
            controller.abort();
          }, timeoutMs)
        : null;

      const res = await fetch(urlObj.toString(), {
        next: { revalidate: getRevalidateTime('/tour') },
        signal: controller?.signal,
        headers: {
          ...authHeader,
          'User-Agent': 'Mozilla/5.0 (compatible; Qualitour-API/1.0)',
        },
      }).finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      });

      if (!res.ok) return null;
      return (await res.json()) as WPTour;
    }

    return await fetchAPI(`/tour/${id}`, {
      _fields:
        'id,slug,title,content,excerpt,featured_media,featured_image_url,tour_meta,goodlayers_data,acf_fields,tour_category,tour_tag,tour_terms',
    });
  } catch {
    return null;
  }
}

/**
 * Get tours by category
 */
export async function getToursByCategory(
  categoryId: number,
  params: WPApiParams = {},
  lang?: string
): Promise<WPTour[]> {
  return getTours({ tour_category: categoryId, ...params }, lang);
}

/**
 * Get tours by category slug
 */
export async function getToursByCategorySlug(
  slug: string,
  params: WPApiParams = {},
  lang?: string
): Promise<WPTour[]> {
  const category = await getTourCategoryBySlug(slug);
  if (!category) {
    return [];
  }
  return getToursByCategory(category.id, params, lang);
}

/**
 * Get tours by tag
 */
export async function getToursByTag(tagId: number, params: WPApiParams = {}, lang?: string): Promise<WPTour[]> {
  return getTours({ tour_tag: tagId, ...params }, lang);
}

/**
 * Get tours by dedicated Tour Type term ID (taxonomy: tour_type, REST base: tour-type)
 */
export async function getToursByTourType(typeId: number, params: WPApiParams = {}, lang?: string): Promise<WPTour[]> {
  return getTours({ 'tour-type': typeId, ...params }, lang);
}

/**
 * Get tours by tag slug
 */
export async function getToursByTagSlug(slug: string, params: WPApiParams = {}, lang?: string): Promise<WPTour[]> {
  const tag = await getTourTagBySlug(slug);
  if (!tag) {
    return [];
  }
  return getToursByTag(tag.id, params, lang);
}

/**
 * Get tours by Tour Type slug (dedicated taxonomy)
 */
export async function getToursByTourTypeSlug(slug: string, params: WPApiParams = {}, lang?: string): Promise<WPTour[]> {
  const type = await getTourTypeBySlug(slug, lang);
  if (!type) return [];
  return getToursByTourType(type.id, params, lang);
}

/**
 * Get tours by dedicated Duration term ID (taxonomy: tour_duration, REST base: tour-duration)
 */
export async function getToursByTourDuration(durationId: number, params: WPApiParams = {}, lang?: string): Promise<WPTour[]> {
  return getTours({ 'tour-duration': durationId, ...params }, lang);
}

/**
 * Get tours by Duration slug (dedicated taxonomy)
 */
export async function getToursByTourDurationSlug(slug: string, params: WPApiParams = {}, lang?: string): Promise<WPTour[]> {
  const duration = await getTourDurationBySlug(slug, lang);
  if (!duration) return [];
  return getToursByTourDuration(duration.id, params, lang);
}

/**
 * Search tours
 */
export async function searchTours(query: string, params: WPApiParams = {}): Promise<WPTour[]> {
  const { _embed: _ignoredEmbed, ...safeParams } = params;
  return fetchAPI('/tour', {
    search: query,
    ...safeParams,
  });
}

/**
 * Get all tour categories
 */
export async function getTourCategories(params: WPApiParams = {}): Promise<WPTourCategory[]> {
  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const { terms } = await fetchTermsV1('tour_category', params as Record<string, any>);
    return terms.map(mapV1TermToTourCategory);
  }
  return fetchAPI('/tour-category', { _fields: TOUR_TAXONOMY_FIELDS, ...params });
}

/**
 * Get a single tour category by slug
 */
export async function getTourCategoryBySlug(slug: string): Promise<WPTourCategory | null> {
  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const { terms } = await fetchTermsV1('tour_category', { slug, per_page: 1 } as Record<string, any>);
    return terms[0] ? mapV1TermToTourCategory(terms[0]) : null;
  }
  const categories = await fetchAPI('/tour-category', { slug, _fields: TOUR_TAXONOMY_FIELDS });
  return categories[0] || null;
}

/**
 * Get all tour tags
 */
export async function getTourTags(params: WPApiParams = {}): Promise<WPTourTag[]> {
  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const { terms } = await fetchTermsV1('tour_tag', params as Record<string, any>);
    return terms.map(mapV1TermToTourTag);
  }
  return fetchAPI('/tour-tag', { _fields: TOUR_TAXONOMY_FIELDS, ...params });
}

/**
 * Get a single tour tag by slug
 */
export async function getTourTagBySlug(slug: string): Promise<WPTourTag | null> {
  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const { terms } = await fetchTermsV1('tour_tag', { slug, per_page: 1 } as Record<string, any>);
    return terms[0] ? mapV1TermToTourTag(terms[0]) : null;
  }
  const tags = await fetchAPI('/tour-tag', { slug, _fields: TOUR_TAXONOMY_FIELDS });
  return tags[0] || null;
}

/**
 * Get all tour types (dedicated taxonomy)
 */
export async function getTourTypes(params: WPApiParams = {}): Promise<WPTourType[]> {
  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const { terms } = await fetchTermsV1('tour_type', params as Record<string, any>);
    return terms.map(mapV1TermToTourType);
  }
  return fetchAPI('/tour-type', { _fields: TOUR_TAXONOMY_FIELDS, ...params });
}

/**
 * Get a single tour type by slug (dedicated taxonomy)
 */
export async function getTourTypeBySlug(slug: string, lang?: string): Promise<WPTourType | null> {
  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const termParams: Record<string, any> = { slug, per_page: 1 };
    if (lang && lang !== 'en') termParams.lang = lang;
    const { terms } = await fetchTermsV1('tour_type', termParams);
    return terms[0] ? mapV1TermToTourType(terms[0]) : null;
  }
  const types = await fetchAPI('/tour-type', { slug, lang, _fields: TOUR_TAXONOMY_FIELDS });
  return types[0] || null;
}

/**
 * Get all tour durations (dedicated taxonomy)
 */
export async function getTourDurations(params: WPApiParams = {}): Promise<WPTourDuration[]> {
  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const { terms } = await fetchTermsV1('tour_duration', params as Record<string, any>);
    return terms.map(mapV1TermToTourDuration);
  }
  return fetchAPI('/tour-duration', { _fields: TOUR_TAXONOMY_FIELDS, ...params });
}

/**
 * Get a single tour duration by slug (dedicated taxonomy)
 */
export async function getTourDurationBySlug(slug: string, lang?: string): Promise<WPTourDuration | null> {
  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const termParams: Record<string, any> = { slug, per_page: 1 };
    if (lang && lang !== 'en') termParams.lang = lang;
    const { terms } = await fetchTermsV1('tour_duration', termParams);
    return terms[0] ? mapV1TermToTourDuration(terms[0]) : null;
  }
  const durations = await fetchAPI('/tour-duration', { slug, lang, _fields: TOUR_TAXONOMY_FIELDS });
  return durations[0] || null;
}

/**
 * Get all tour activities
 */
export async function getTourActivities(params: WPApiParams = {}): Promise<WPTourActivity[]> {
  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const { terms } = await fetchTermsV1('tour-activity', params as Record<string, any>);
    return terms.map(mapV1TermToTourActivity);
  }
  return fetchAPI('/tour-activity', { _fields: TOUR_TAXONOMY_FIELDS, ...params });
}

/**
 * Get a single tour activity by slug
 */
export async function getTourActivityBySlug(slug: string, lang?: string): Promise<WPTourActivity | null> {
  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const termParams: Record<string, any> = { slug, per_page: 1 };
    if (lang && lang !== 'en') termParams.lang = lang;
    const { terms } = await fetchTermsV1('tour-activity', termParams);
    return terms[0] ? mapV1TermToTourActivity(terms[0]) : null;
  }
  const activities = await fetchAPI('/tour-activity', { slug, lang, _fields: TOUR_TAXONOMY_FIELDS });
  return activities[0] || null;
}

/**
 * Get all tour destinations
 */
export async function getTourDestinations(params: WPApiParams = {}): Promise<WPTourDestination[]> {
  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const { terms } = await fetchTermsV1('tour-destination', params as Record<string, any>);
    return terms.map(mapV1TermToTourDestination);
  }
  return fetchAPI('/tour-destination', { _fields: TOUR_TAXONOMY_FIELDS, ...params });
}

/**
 * Get all tour destination terms (handles WP REST pagination limit of 100/page).
 *
 * This is used for the mega-menu so we don't silently miss terms when the
 * destination taxonomy grows beyond 100 terms.
 */
export async function getAllTourDestinations(
  params: WPApiParams = {},
  opts: { maxPages?: number } = {}
): Promise<WPTourDestination[]> {
  const customApiUrl = getCustomApiUrl();
  const maxPages = Math.max(1, opts.maxPages ?? 20);

  if (customApiUrl) {
    const perPage = Math.min(Number(params.per_page) || 200, 200);
    const baseParams: Record<string, any> = { ...params, per_page: perPage };
    delete baseParams.page;

    const all: WPTourDestination[] = [];
    for (let page = 1; page <= maxPages; page++) {
      const { terms } = await fetchTermsV1('tour-destination', { ...baseParams, page });
      if (!Array.isArray(terms) || terms.length === 0) break;
      all.push(...terms.map(mapV1TermToTourDestination));
      if (terms.length < perPage) break;
    }

    const byId = new Map<number, WPTourDestination>();
    for (const term of all) byId.set(term.id, term);
    return Array.from(byId.values());
  }

  const perPage = Math.min(Number(params.per_page) || 100, 100);
  const baseParams: WPApiParams = { _fields: TOUR_TAXONOMY_FIELDS, ...params, per_page: perPage };
  delete (baseParams as Record<string, unknown>).page;

  const all: WPTourDestination[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const batch = await fetchAPI('/tour-destination', { ...baseParams, page });
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...(batch as WPTourDestination[]));
    if (batch.length < perPage) break;
  }

  const byId = new Map<number, WPTourDestination>();
  for (const term of all) byId.set(term.id, term);
  return Array.from(byId.values());
}

/**
 * Get a single tour destination by slug
 */
export async function getTourDestinationBySlug(slug: string, lang?: string): Promise<WPTourDestination | null> {
  const customApiUrl = getCustomApiUrl();

  let resolvedTerm: WPTourDestination | null = null;
  if (customApiUrl) {
    const termParams: Record<string, any> = { slug, per_page: 1 };
    if (lang && lang !== 'en') termParams.lang = lang;
    const { terms } = await fetchTermsV1('tour-destination', termParams);
    resolvedTerm = terms[0] ? mapV1TermToTourDestination(terms[0]) : null;
  } else {
    const destinations = await fetchAPI('/tour-destination', { slug, _fields: TOUR_TAXONOMY_FIELDS });
    resolvedTerm = destinations[0] || null;
  }
  
  if (!resolvedTerm || !lang) {
    return resolvedTerm;
  }
  
  // For language-specific requests, get the actual count for that language
  // by querying tours with the destination and language filter
  try {
    const { total } = await fetchToursV1(
      {
        'tour-destination': resolvedTerm.id,
        per_page: 1,
        _fields: 'id',
      },
      lang
    );

    return {
      ...resolvedTerm,
      count: total,
    };
  } catch (error) {
    console.error(`Error fetching language-specific count for destination ${slug}:`, error);
  }

  return resolvedTerm;
}

/**
 * Resolve a tour destination term ID by slug.
 *
 * Use this instead of `getTourDestinationBySlug(slug, lang)` when you only need the ID,
 * to avoid triggering extra language-specific count queries.
 */
export async function getTourDestinationIdBySlug(slug: string): Promise<number | null> {
  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const { terms } = await fetchTermsV1('tour-destination', { slug, per_page: 1 } as Record<string, any>);
    return terms[0]?.id ?? null;
  }
  const destinations = await fetchAPI('/tour-destination', { slug, _fields: 'id' });
  return destinations[0]?.id ?? null;
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
  
  const destinations = await Promise.all(slugs.map((relatedSlug) => getTourDestinationBySlug(relatedSlug)));
  return destinations.filter((d): d is WPTourDestination => d != null);
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
  const perPage = params.per_page ?? 100; // WP REST API max is 100
  return getTours({ 'tour-destination': destinationId, per_page: perPage, ...params }, lang);
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
  return getTours({ 'tour-activity': activityId, ...params }, lang);
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
  const activity = await getTourActivityBySlug(slug, lang);
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
  const customApiUrl = getCustomApiUrl();

  if (!apiUrl && !customApiUrl) {
    console.error('Error: WordPress API URL is not defined in searchToursAdvanced');
    console.error('Available environment variables:', Object.keys(process.env).join(', '));
    throw new Error('WordPress API URL is not defined');
  }

  const useCustom = !!customApiUrl;
  const url = useCustom
    ? new URL(`${customApiUrl}/tours`)
    : new URL(`${apiUrl}/tour`);

  // Build query parameters
  // For list views, reduce payload dramatically (tour cards only).
  if (per_page > 1) {
    url.searchParams.append('_fields', TOUR_LIST_FIELDS);
  }
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
    if (useCustom) {
      // Custom endpoint accepts slug or id.
      url.searchParams.append('destination', String(destination));
    } else {
      const destId = typeof destination === 'string'
        ? await getTourDestinationIdBySlug(destination)
        : destination;
      if (destId) {
        url.searchParams.append('tour-destination', destId.toString());
      }
    }
  }

  // Add multiple destinations filter if provided
  if (destinations && destinations.length > 0) {
    if (useCustom) {
      // Custom endpoint accepts comma-separated slugs/ids.
      url.searchParams.append('destinations', destinations.map((d) => String(d)).join(','));
    } else {
      const destIds = await Promise.all(
        destinations.map(async (dest) => {
          if (typeof dest === 'string') {
            return await getTourDestinationIdBySlug(dest);
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
  }

  // Add activity filter if provided
  if (activity) {
    if (useCustom) {
      url.searchParams.append('activity', String(activity));
    } else {
      const actId = typeof activity === 'string'
        ? (await getTourActivityBySlug(activity, lang))?.id
        : activity;
      if (actId) {
        url.searchParams.append('tour-activity', actId.toString());
      }
    }
  }

  // Add language parameter for Polylang
  if (lang && lang !== 'en') {
    url.searchParams.append('lang', lang);
  }

  // OpenNext/Next fetch caching can persist across deployments. If an earlier deployment
  // cached an unauthenticated 401 (or other bad response) for /tour, we need a stable
  // cache key so the fixed authenticated request doesn't keep reusing the poisoned entry.
  // WordPress REST ignores unknown query params, so this is safe.
  url.searchParams.set('qt_cache', 'v1');

  const startTime = process.env.NODE_ENV === 'development' ? Date.now() : 0;

  // Add Basic Auth for protected WP endpoints (Workers/Production)
  const urlObj = new URL(url.toString());
  let authHeader: Record<string, string> = {};

  // Try URL credentials first (Local Live Link), then env vars (Workers)
  let username = urlObj.username;
  let password = urlObj.password;

  if (!username || !password) {
    username = process.env.WORDPRESS_AUTH_USER || '';
    password = process.env.WORDPRESS_AUTH_PASS || '';
  }

  if (username && password) {
    const credentials = toBase64(`${username}:${password}`);
    authHeader = { Authorization: `Basic ${credentials}` };
    // Remove credentials from URL to avoid fetch issues / leaking
    urlObj.username = '';
    urlObj.password = '';
  }

  // Deduplicate identical search queries briefly (use the same bounded TTL cache).
  const cacheKey = `searchToursAdvanced:${urlObj.toString()}`;
  const now = Date.now();
  pruneRequestCache(now);
  const cached = requestCache.get(cacheKey);
  if (cached && now - cached.createdAt <= REQUEST_CACHE_TTL_MS) {
    return cached.promise;
  }

  const timeoutMs = Number(process.env.WP_FETCH_TIMEOUT_MS || 8000);
  const controller = Number.isFinite(timeoutMs) && timeoutMs > 0 ? new AbortController() : null;
  const timeoutId = controller
    ? setTimeout(() => {
        controller.abort();
      }, timeoutMs)
    : null;

  const promise = (async () => {
    const response = await fetch(urlObj.toString(), {
      next: { revalidate: getRevalidateTime('/tour') },
      signal: controller?.signal,
      headers: {
        ...authHeader,
        'User-Agent': 'Mozilla/5.0 (compatible; Qualitour-API/1.0)',
      },
    }).finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });

    if (process.env.NODE_ENV === 'development' && startTime) {
      const duration = Date.now() - startTime;
      console.log(`[Search API] ${useCustom ? '/qualitour/v1/tours' : '/tour'}${url.search} - ${duration}ms - ${response.status}`);
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          'Search API Error: 401 Unauthorized. ' +
            'Set WORDPRESS_AUTH_USER/WORDPRESS_AUTH_PASS in the Worker (or make the REST API publicly readable).'
        );
      }
      throw new Error(`Search API Error: ${response.status} ${response.statusText}`);
    }

    const tours = (await response.json()) as WPTour[];
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
  })();

  requestCache.set(cacheKey, { createdAt: now, promise });
  promise.catch(() => {
    requestCache.delete(cacheKey);
  });

  return promise;
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
  const customApiUrl = getCustomApiUrl();
  if (customApiUrl) {
    const result = await fetchToursV1(
      {
        per_page: limit,
        orderby: 'date',
        order: 'desc',
        _fields: 'id,slug,title,featured_image_url,tour_meta,tour_terms',
      },
      lang
    );
    return result.tours;
  }

  return fetchAPI('/tour', {
    per_page: limit,
    orderby: 'date',
    order: 'desc',
    _fields: 'id,slug,title,featured_image_url,tour_meta,tour_terms',
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
  // Featured tours are defined as tours tagged with the "featured-tour" tag.
  const featuredTag = await getTourTagBySlug('featured-tour');
  if (!featuredTag) return [];

  const { tours } = await getToursPaged(
    {
      tour_tag: featuredTag.id,
      per_page: limit,
      orderby: 'date',
      order: 'desc',
      _fields: 'id,slug,title,featured_image_url,tour_meta,excerpt,tour_terms',
    },
    lang
  );

  return tours;
}

/**
 * Get tours by type using keyword and tag matching
 * Supports: Tickets & Passes, Land Tours, Cruises & Expeditions
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
  const allTours: WPTour[] = [];
  const seen = new Set<number>();

  for (const keyword of config.keywords) {
    try {
      const result = await searchTours(keyword, {
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
      label: 'Tickets & Passes',
      description: 'Attraction admissions, tickets, and passes (no packaged itinerary)',
      slug: 'attraction-tickets',
    },
    'land-tours': {
      label: 'Land Tours',
      description: 'Guided tours and itineraries on land (day trips and multi-day tours)',
      slug: 'land-tours',
    },
    'cruises': {
      label: 'Cruises & Expeditions',
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
  if (process.env.NODE_ENV === 'development') {
    console.log(`[getToursByDuration] Batch 1: ${batch1.length} tours, slug: ${durationSlug}`);
  }
  
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
      if (process.env.NODE_ENV === 'development') {
        console.log(`[getToursByDuration] Batch 2: ${batch2.length} tours`);
      }
    } catch (e) {
      // Silently ignore if second batch fails
      console.warn('Could not fetch second batch of tours for duration filtering');
    }
  }

  const tours = allTours;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[getToursByDuration] Total fetched: ${tours.length} tours, filtering by slug: ${durationSlug}`);
  }

  // DEBUG: Check first tour
  if (tours.length > 0 && process.env.NODE_ENV === 'development') {
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

  if (process.env.NODE_ENV === 'development') {
    console.log(`[getToursByDuration] Filtered result: ${filtered.length} tours for ${durationSlug}`);
  }
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
  const customApiUrl = getCustomApiUrl();
  if (!customApiUrl) {
    console.warn('[Reviews] API URL not configured');
    return [];
  }

  try {
    const url = new URL(`${customApiUrl}/google-reviews`);
    
    // Handle Basic Auth for Local Live Link
    let authHeader = {};
    let username = url.username;
    let password = url.password;

    if (!username || !password) {
      username = process.env.WORDPRESS_AUTH_USER || '';
      password = process.env.WORDPRESS_AUTH_PASS || '';
    }

    if (username && password) {
      const credentials = toBase64(`${username}:${password}`);
      authHeader = { Authorization: `Basic ${credentials}` };
      url.username = '';
      url.password = '';
    }
    
    const response = await fetch(
      url.toString(),
      { 
        cache: 'force-cache',
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
