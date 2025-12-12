/**
 * Request-level deduplication cache
 * Prevents multiple identical API calls during the same render cycle
 * Gets reset at the start of each request
 */

type CacheKey = string;
type CacheEntry = {
  promise: Promise<any>;
  timestamp: number;
};

const cache = new Map<CacheKey, CacheEntry>();

export function getCacheKey(endpoint: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);
  
  return `${endpoint}:${JSON.stringify(sortedParams)}`;
}

export function getCachedRequest<T>(
  key: CacheKey,
  fetcher: () => Promise<T>
): Promise<T> {
  if (cache.has(key)) {
    return cache.get(key)!.promise;
  }

  const promise = fetcher();
  cache.set(key, { promise, timestamp: Date.now() });
  
  return promise;
}

export function clearCache(): void {
  cache.clear();
}

/**
 * For production: optionally implement Redis-based cache
 * Example usage:
 * 
 * const redisCache = redis.createClient();
 * export async function getFromRedis(key: string) {
 *   return redisCache.get(key);
 * }
 */
