/**
 * API Cache Utility
 * 
 * Simple in-memory + sessionStorage cache for API responses.
 * Prevents redundant network calls for data that doesn't change frequently
 * (cities, routes, popular routes, prices, etc.)
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// In-memory cache for current session (fastest)
const memoryCache = new Map<string, CacheEntry<any>>();

// Default TTL: 5 minutes
const DEFAULT_TTL_MS = 5 * 60 * 1000;

// Longer TTL for truly static data like cities
const LONG_TTL_MS = 30 * 60 * 1000;

// Short TTL for semi-dynamic data like trips
const SHORT_TTL_MS = 2 * 60 * 1000;

export const CacheTTL = {
  SHORT: SHORT_TTL_MS,     // 2 min — trips, seats
  DEFAULT: DEFAULT_TTL_MS, // 5 min — routes, popular routes
  LONG: LONG_TTL_MS,       // 30 min — cities, vehicle types
} as const;

/**
 * Generate a cache key from the API path + params
 */
function buildKey(path: string, params?: Record<string, any>): string {
  const paramStr = params ? JSON.stringify(params, Object.keys(params).sort()) : '';
  return `api_cache:${path}:${paramStr}`;
}

/**
 * Try to read from sessionStorage as fallback for memory cache
 */
function readFromStorage<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      sessionStorage.removeItem(key);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

/**
 * Write to sessionStorage
 */
function writeToStorage<T>(key: string, entry: CacheEntry<T>): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // sessionStorage might be full or blocked, ignore
  }
}

export const apiCache = {
  /**
   * Get cached data or null if cache miss / expired
   */
  get<T>(path: string, params?: Record<string, any>): T | null {
    const key = buildKey(path, params);

    // 1. Check in-memory first
    const memEntry = memoryCache.get(key);
    if (memEntry && Date.now() < memEntry.expiresAt) {
      return memEntry.data as T;
    }
    if (memEntry) memoryCache.delete(key);

    // 2. Fallback to sessionStorage
    const storageEntry = readFromStorage<T>(key);
    if (storageEntry) {
      // Promote back to memory cache
      memoryCache.set(key, storageEntry);
      return storageEntry.data;
    }

    return null;
  },

  /**
   * Store data in cache
   */
  set<T>(path: string, data: T, ttlMs: number = DEFAULT_TTL_MS, params?: Record<string, any>): void {
    const key = buildKey(path, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
    memoryCache.set(key, entry);
    writeToStorage(key, entry);
  },

  /**
   * Invalidate a specific cache entry
   */
  invalidate(path: string, params?: Record<string, any>): void {
    const key = buildKey(path, params);
    memoryCache.delete(key);
    try { sessionStorage.removeItem(key); } catch { /* noop */ }
  },

  /**
   * Invalidate all cache entries matching a prefix
   */
  invalidatePrefix(prefix: string): void {
    const fullPrefix = `api_cache:${prefix}`;
    // Memory cache
    for (const key of memoryCache.keys()) {
      if (key.startsWith(fullPrefix)) {
        memoryCache.delete(key);
      }
    }
    // SessionStorage
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(fullPrefix)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch { /* noop */ }
  },

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    memoryCache.clear();
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('api_cache:')) {
          sessionStorage.removeItem(key);
        }
      }
    } catch { /* noop */ }
  },
};
