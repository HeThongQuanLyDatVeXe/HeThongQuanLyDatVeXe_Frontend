/**
 * API Cache Utility
 * 
 * In-memory only cache for API responses within the current page lifecycle.
 * Cache is automatically cleared on page reload, ensuring fresh data from backend.
 * 
 * NOTE: sessionStorage was intentionally removed because it caused stale data 
 * to persist across page reloads. When admin (or AI Agent) updates data, the 
 * backend Redis cache is properly evicted, but sessionStorage on the user's 
 * browser would still serve old data even after reload.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// In-memory cache — automatically cleared on page reload
const memoryCache = new Map<string, CacheEntry<any>>();

// Default TTL: 5 minutes
const DEFAULT_TTL_MS = 5 * 60 * 1000;

// Longer TTL for truly static data like cities
const LONG_TTL_MS = 15 * 60 * 1000;

// Short TTL for semi-dynamic data like trips
const SHORT_TTL_MS = 2 * 60 * 1000;

export const CacheTTL = {
  SHORT: SHORT_TTL_MS,     // 2 min — trips, seats
  DEFAULT: DEFAULT_TTL_MS, // 5 min — routes, popular routes
  LONG: LONG_TTL_MS,       // 15 min — cities, vehicle types
} as const;

/**
 * Generate a cache key from the API path + params
 */
function buildKey(path: string, params?: Record<string, any>): string {
  const paramStr = params ? JSON.stringify(params, Object.keys(params).sort()) : '';
  return `api_cache:${path}:${paramStr}`;
}

export const apiCache = {
  /**
   * Get cached data or null if cache miss / expired
   */
  get<T>(path: string, params?: Record<string, any>): T | null {
    const key = buildKey(path, params);

    const memEntry = memoryCache.get(key);
    if (memEntry && Date.now() < memEntry.expiresAt) {
      return memEntry.data as T;
    }
    if (memEntry) memoryCache.delete(key);

    return null;
  },

  /**
   * Store data in cache (in-memory only)
   */
  set<T>(path: string, data: T, ttlMs: number = DEFAULT_TTL_MS, params?: Record<string, any>): void {
    const key = buildKey(path, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
    memoryCache.set(key, entry);
  },

  /**
   * Invalidate a specific cache entry
   */
  invalidate(path: string, params?: Record<string, any>): void {
    const key = buildKey(path, params);
    memoryCache.delete(key);
  },

  /**
   * Invalidate all cache entries matching a prefix
   */
  invalidatePrefix(prefix: string): void {
    const fullPrefix = `api_cache:${prefix}`;
    for (const key of memoryCache.keys()) {
      if (key.startsWith(fullPrefix)) {
        memoryCache.delete(key);
      }
    }
  },

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    memoryCache.clear();
  },
};
