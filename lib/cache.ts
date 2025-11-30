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
 * Invalidate all task-related cache keys for a user
 * This includes all pages and filter combinations
 * matching keys, then deletes them in batches to avoid hitting rate limits.
 */
export async function invalidateUserTasksCache(userId: string): Promise<void> {
  try {
    const pattern = `tasks:${userId}:*`;

    const keys = await redis.keys(pattern);

    if (Array.isArray(keys) && keys.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize);
        await redis.del(...batch);
      }
    }
  } catch (error) {
    console.error('Cache invalidation error for user tasks:', error);
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
