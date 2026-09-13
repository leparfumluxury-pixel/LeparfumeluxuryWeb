interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const globalCache = new Map<string, CacheEntry<any>>();

/**
 * Retrieves an item from the in-memory cache.
 * Returns null if the item does not exist or has expired.
 */
export function cacheGet<T>(key: string): T | null {
  const entry = globalCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    globalCache.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Stores an item in the in-memory cache with an optional TTL (Time To Live).
 * Defaults to 30 seconds (30000 ms).
 */
export function cacheSet<T>(key: string, data: T, ttlMs = 30000) {
  globalCache.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
}

/**
 * Invalidates a specific cache key.
 */
export function cacheInvalidate(key: string) {
  globalCache.delete(key);
}

/**
 * Clears the entire in-memory cache.
 * Useful when an administrator updates a product or blog post.
 */
export function cacheClear() {
  globalCache.clear();
}
