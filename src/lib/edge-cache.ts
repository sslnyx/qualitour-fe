/**
 * Edge Cache Utility for Cloudflare Workers
 * 
 * Uses Cloudflare's Cache API to store API responses at the edge.
 * This dramatically reduces CPU usage by avoiding:
 * 1. External fetch calls to WordPress
 * 2. JSON parsing
 * 3. Data transformation
 * 
 * Cache hits return almost instantly with minimal CPU usage.
 */

// Cloudflare Workers Cache API type extension
// The 'default' property exists on Cloudflare's CacheStorage but not in standard TypeScript types
declare global {
    interface CacheStorage {
        default: Cache;
    }
}

// Cache TTL settings (in seconds)
export const CACHE_TTL = {
    TOURS_LIST: 300,        // 5 minutes - tour listings
    TOUR_SINGLE: 600,       // 10 minutes - single tour details  
    TAXONOMIES: 3600,       // 1 hour - destinations, categories, etc.
    STATIC_PAGES: 1800,     // 30 minutes - pages, settings
    REVIEWS: 86400,         // 24 hours - Google reviews (rarely change)
} as const;

// Check if we're running in a Cloudflare Worker environment
function isWorkerEnvironment(): boolean {
    return typeof caches !== 'undefined' && typeof caches.default !== 'undefined';
}

/**
 * Get a cached response from Cloudflare's edge cache
 * @param cacheKey - Unique key for the cached item (usually the API URL)
 * @returns Cached data or null if not found
 */
export async function getEdgeCache<T>(cacheKey: string): Promise<T | null> {
    if (!isWorkerEnvironment()) {
        return null; // Not in Worker environment (local dev)
    }

    try {
        const cache = caches.default;
        // Create a fake Request object as the cache key
        const cacheRequest = new Request(`https://cache.qualitour.local/${cacheKey}`);
        const cachedResponse = await cache.match(cacheRequest);

        if (cachedResponse) {
            const data = await cachedResponse.json();
            if (process.env.NODE_ENV === 'development') {
                console.log(`[EdgeCache] HIT: ${cacheKey}`);
            }
            return data as T;
        }

        if (process.env.NODE_ENV === 'development') {
            console.log(`[EdgeCache] MISS: ${cacheKey}`);
        }
        return null;
    } catch (error) {
        console.error('[EdgeCache] Get error:', error);
        return null;
    }
}

/**
 * Store data in Cloudflare's edge cache
 * @param cacheKey - Unique key for the cached item
 * @param data - Data to cache (will be JSON stringified)
 * @param ttlSeconds - Time to live in seconds
 */
export async function setEdgeCache<T>(
    cacheKey: string,
    data: T,
    ttlSeconds: number = CACHE_TTL.TOURS_LIST
): Promise<void> {
    if (!isWorkerEnvironment()) {
        return; // Not in Worker environment (local dev)
    }

    try {
        const cache = caches.default;
        const cacheRequest = new Request(`https://cache.qualitour.local/${cacheKey}`);

        // Create a Response with proper cache headers
        const response = new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}`,
                'X-Cache-TTL': String(ttlSeconds),
                'X-Cached-At': new Date().toISOString(),
            },
        });

        await cache.put(cacheRequest, response);

        if (process.env.NODE_ENV === 'development') {
            console.log(`[EdgeCache] SET: ${cacheKey} (TTL: ${ttlSeconds}s)`);
        }
    } catch (error) {
        console.error('[EdgeCache] Set error:', error);
    }
}

/**
 * Delete an item from the edge cache
 * @param cacheKey - Key to delete
 */
export async function deleteEdgeCache(cacheKey: string): Promise<boolean> {
    if (!isWorkerEnvironment()) {
        return false;
    }

    try {
        const cache = caches.default;
        const cacheRequest = new Request(`https://cache.qualitour.local/${cacheKey}`);
        return await cache.delete(cacheRequest);
    } catch (error) {
        console.error('[EdgeCache] Delete error:', error);
        return false;
    }
}

/**
 * Generate a consistent cache key from endpoint and params
 */
export function generateCacheKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
        .sort()
        .map(key => `${key}=${encodeURIComponent(String(params[key]))}`)
        .join('&');

    return sortedParams ? `${endpoint}?${sortedParams}` : endpoint;
}

/**
 * Cache-through wrapper for API calls
 * Checks cache first, then fetches if needed
 * 
 * @example
 * const tours = await cacheThrough(
 *   'tours-list',
 *   { page: 1, per_page: 12 },
 *   async () => fetchToursFromWP(),
 *   CACHE_TTL.TOURS_LIST
 * );
 */
export async function cacheThrough<T>(
    endpoint: string,
    params: Record<string, any>,
    fetcher: () => Promise<T>,
    ttlSeconds: number = CACHE_TTL.TOURS_LIST
): Promise<T> {
    const cacheKey = generateCacheKey(endpoint, params);

    // Try cache first (very fast, minimal CPU)
    const cached = await getEdgeCache<T>(cacheKey);
    if (cached !== null) {
        return cached;
    }

    // Cache miss - fetch from origin
    const result = await fetcher();

    // Store in cache (async, don't await to avoid blocking response)
    setEdgeCache(cacheKey, result, ttlSeconds).catch(() => {
        // Ignore cache set errors
    });

    return result;
}
