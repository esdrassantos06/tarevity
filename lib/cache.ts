import { redis } from './redis';

const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 5 * 60, // 5 minutes
  LONG: 15 * 60, // 15 minutes
} as const;

/**
 * Redis cache utility for application data
 * Uses Redis for distributed caching
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM,
): Promise<T> {
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();

    await redis.set(key, JSON.stringify(data), { ex: ttl });

    return data;
  } catch (error) {
    console.error(`Cache error for key ${key}:`, error);
    // If cache fails, just fetch the data
    return fetcher();
  }
}

/**
 * Invalidate specific cache keys
 */
export async function invalidateCacheKeys(keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  tasks: (userId: string, page: number, filters: string) =>
    `tasks:${userId}:${page}:${filters}`,
  taskCount: (userId: string, status?: string) =>
    status ? `tasks:count:${userId}:${status}` : `tasks:count:${userId}`,
  taskStats: (userId: string) => `tasks:stats:${userId}`,
  notifications: (userId: string) => `notifications:${userId}`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  userStats: (userId: string) => `user:${userId}:stats`,
};

export { CACHE_TTL };
