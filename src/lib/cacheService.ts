/**
 * Client-side cache service for storing data in memory and localStorage
 * Provides a convenient API for caching data with TTL
 */

// Type definitions
interface CacheItem<T> {
    data: T;
    expiry: number;
  }
  
  interface CacheOptions {
    ttl?: number; // Time to live in milliseconds
    storage?: 'memory' | 'local'; // Storage type: memory (default) or localStorage
  }
  
  // Default options
  const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  const DEFAULT_STORAGE = 'memory';
  
  // In-memory cache
  const memoryCache = new Map<string, CacheItem<unknown>>();
  
  /**
   * Cache service for client-side caching
   */
  export const cacheService = {
    /**
     * Set an item in the cache
     * 
     * @param key - Cache key
     * @param data - Data to cache
     * @param options - Cache options
     */
    set<T>(key: string, data: T, options: CacheOptions = {}): void {
      const { ttl = DEFAULT_TTL, storage = DEFAULT_STORAGE } = options;
      const expiry = Date.now() + ttl;
      const item: CacheItem<T> = { data, expiry };
  
      if (storage === 'local') {
        try {
          localStorage.setItem(
            `cache:${key}`,
            JSON.stringify(item)
          );
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
      } else {
        memoryCache.set(key, item);
      }
    },
  
    /**
     * Get an item from the cache
     * 
     * @param key - Cache key
     * @param options - Cache options
     * @returns The cached data or null if not found or expired
     */
    get<T>(key: string, options: CacheOptions = {}): T | null {
      const { storage = DEFAULT_STORAGE } = options;
      let item: CacheItem<T> | undefined;
  
      if (storage === 'local') {
        try {
          const storedItem = localStorage.getItem(`cache:${key}`);
          if (storedItem) {
            item = JSON.parse(storedItem) as CacheItem<T>;
          }
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          return null;
        }
      } else {
        item = memoryCache.get(key) as CacheItem<T>;
      }
  
      // Return null if item doesn't exist
      if (!item) {
        return null;
      }
  
      // Check if the item has expired
      if (Date.now() > item.expiry) {
        this.remove(key, { storage });
        return null;
      }
  
      return item.data;
    },
  
    /**
     * Remove an item from the cache
     * 
     * @param key - Cache key
     * @param options - Cache options
     */
    remove(key: string, options: CacheOptions = {}): void {
      const { storage = DEFAULT_STORAGE } = options;
  
      if (storage === 'local') {
        try {
          localStorage.removeItem(`cache:${key}`);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      } else {
        memoryCache.delete(key);
      }
    },
  
    /**
     * Clear all items from the cache
     * 
     * @param options - Cache options
     */
    clear(options: CacheOptions = {}): void {
      const { storage = DEFAULT_STORAGE } = options;
  
      if (storage === 'local') {
        try {
          // Only clear keys that start with 'cache:'
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cache:')) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          console.error('Error clearing localStorage:', error);
        }
      } else {
        memoryCache.clear();
      }
    },
  
    /**
     * Check if the cache has a valid (non-expired) item
     * 
     * @param key - Cache key
     * @param options - Cache options
     * @returns True if the cache has a valid item
     */
    has(key: string, options: CacheOptions = {}): boolean {
      return this.get(key, options) !== null;
    },
  
    /**
     * Get an item from the cache, or fetch it if not found
     * 
     * @param key - Cache key
     * @param fetchFn - Function to fetch the data if not found in cache
     * @param options - Cache options
     * @returns The cached or fetched data
     */
    async getOrFetch<T>(
      key: string,
      fetchFn: () => Promise<T>,
      options: CacheOptions = {}
    ): Promise<T> {
      // Try to get from cache first
      const cachedData = this.get<T>(key, options);
      if (cachedData !== null) {
        return cachedData;
      }
  
      // Fetch the data
      const data = await fetchFn();
  
      // Cache the result
      this.set(key, data, options);
  
      return data;
    },
  
    /**
     * Purge expired items from the cache
     * 
     * @param options - Cache options
     */
    purgeExpired(options: CacheOptions = {}): void {
      const { storage = DEFAULT_STORAGE } = options;
      const now = Date.now();
  
      if (storage === 'local') {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cache:')) {
              const storedItem = localStorage.getItem(key);
              if (storedItem) {
                const item = JSON.parse(storedItem) as CacheItem<unknown>;
                if (now > item.expiry) {
                  localStorage.removeItem(key);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error purging expired localStorage items:', error);
        }
      } else {
        memoryCache.forEach((item, key) => {
          if (now > item.expiry) {
            memoryCache.delete(key);
          }
        });
      }
    }
  };
  
  // Auto-purge expired items every minute
  if (typeof window !== 'undefined') {
    setInterval(() => {
      cacheService.purgeExpired({ storage: 'memory' });
      cacheService.purgeExpired({ storage: 'local' });
    }, 60 * 1000);
  }