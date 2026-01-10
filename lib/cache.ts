import { redis } from './redis';
import { CACHE_TTL, cacheKeys as cacheKeysConstants } from './cache-constants';
import { logger } from './logger';

export const cacheKeys = cacheKeysConstants;

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
    const cached = await redis.get<unknown>(key);
    if (cached !== null) {
      try {
        if (typeof cached === 'string') {
          return JSON.parse(cached) as T;
        }
        return cached as T;
      } catch (parseError) {
        logger.warn('Failed to parse cached data, invalidating', {
          key,
          error:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        });
        try {
          await redis.del(key);
        } catch {
          // Ignore deletion errors
        }
      }
    }

    const data = await fetcher();

    await redis.set(key, JSON.stringify(data), { ex: ttl });

    return data;
  } catch (error) {
    logger.error(
      'Cache error',
      error instanceof Error ? error : new Error(String(error)),
      {
        key,
      },
    );
    // If cache fails, just fetch the data
    return fetcher();
  }
}

/**
 * Track a cache key for a user's tasks
 * This allows efficient invalidation without using KEYS()
 */
async function trackCacheKey(userId: string, key: string): Promise<void> {
  try {
    const trackingKey = cacheKeys.userTaskKeys(userId);
    await redis.sadd(trackingKey, key);
    // Set expiry on the tracking set to prevent memory leaks
    await redis.expire(trackingKey, CACHE_TTL.LONG * 2);
  } catch (error) {
    logger.warn('Cache key tracking error', {
      userId,
      key,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Register a task cache key for tracking
 */
export async function registerTaskCacheKey(
  userId: string,
  key: string,
): Promise<void> {
  await trackCacheKey(userId, key);
}

/**
 * Invalidate specific cache keys
 */
export async function invalidateCacheKeys(keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize);
        await redis.del(...batch);
      }
    }
  } catch (error) {
    logger.error(
      'Cache invalidation error',
      error instanceof Error ? error : new Error(String(error)),
      {
        keysCount: keys.length,
      },
    );
  }
}

/**
 * Scan Redis keys using SCAN command (non-blocking)
 * This replaces the blocking KEYS() operation
 */
async function scanKeys(pattern: string): Promise<string[]> {
  const keys: string[] = [];
  let cursor = '0';

  try {
    do {
      const result = await redis.scan(cursor, {
        match: pattern,
        count: 100,
      });

      if (Array.isArray(result) && result.length === 2) {
        cursor = String(result[0]);
        const foundKeys = result[1] as string[];
        if (Array.isArray(foundKeys)) {
          keys.push(...foundKeys);
        }
      } else {
        break;
      }
    } while (cursor !== '0');
  } catch (error) {
    logger.error(
      'Redis SCAN error',
      error instanceof Error ? error : new Error(String(error)),
      {
        pattern,
      },
    );
  }

  return keys;
}

/**
 * Invalidate all task-related cache keys for a user
 * Uses SET-based tracking first, falls back to SCAN if tracking fails
 */
export async function invalidateUserTasksCache(userId: string): Promise<void> {
  try {
    const trackingKey = cacheKeys.userTaskKeys(userId);

    try {
      const trackedKeys = await redis.smembers<string[]>(trackingKey);

      if (Array.isArray(trackedKeys) && trackedKeys.length > 0) {
        // Delete all tracked keys in batches
        const batchSize = 100;
        for (let i = 0; i < trackedKeys.length; i += batchSize) {
          const batch = trackedKeys.slice(i, i + batchSize);
          await redis.del(...batch);
        }

        await redis.del(trackingKey);
        return;
      }
    } catch (error) {
      logger.warn('Cache tracking failed, falling back to SCAN', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Fallback to SCAN-based pattern matching (non-blocking)
    const pattern = `tasks:${userId}:*`;
    const keys = await scanKeys(pattern);

    const calendarPattern = `calendar:${userId}:*`;
    const taskPattern = `task:${userId}:*`;
    const additionalKeys = [
      ...(await scanKeys(calendarPattern)),
      ...(await scanKeys(taskPattern)),
    ];

    const allKeys = [...keys, ...additionalKeys];

    if (allKeys.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < allKeys.length; i += batchSize) {
        const batch = allKeys.slice(i, i + batchSize);
        await redis.del(...batch);
      }
    }
  } catch (error) {
    logger.error(
      'Cache invalidation error for user tasks',
      error instanceof Error ? error : new Error(String(error)),
      {
        userId,
      },
    );
  }
}

export { CACHE_TTL };
