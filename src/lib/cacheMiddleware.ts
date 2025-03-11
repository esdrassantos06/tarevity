import { NextResponse } from 'next/server'
import { redis } from './redis'

interface CacheMetrics {
  hits: number
  misses: number
  ratio: number
}

const cacheMetrics: Record<string, CacheMetrics> = {}

type CacheOptions = {
  ttl: number // Time to live in seconds
  keyPrefix?: string
  skipCache?: boolean // Flag to skip caching (useful for authenticated routes)
}

const DEFAULT_TTL = 60 * 5 // 5 minutes default TTL

async function updateMetricsInRedis() {
  await redis.set('cache:metrics', JSON.stringify(cacheMetrics))
}


/**
 * Middleware to cache GET responses using Redis
 *
 * @param request - The incoming request
 * @param handler - The original handler function
 * @param options - Cache configuration options
 * @returns NextResponse with appropriate cache headers
 */
export async function withCache(
  request: Request,
  handler: () => Promise<NextResponse>,
  options: CacheOptions = { ttl: DEFAULT_TTL },
) {
  const { ttl = DEFAULT_TTL, keyPrefix = '', skipCache = false } = options

  // Skip caching for non-GET requests or when explicitly requested
  if (request.method !== 'GET' || skipCache) {
    return await handler()
  }

  const url = new URL(request.url)
  const cacheKey = `cache:${keyPrefix}:${url.pathname}${url.search}`

  const cacheCategory = keyPrefix.split(':')[0] || 'default'

  if (!cacheMetrics[cacheCategory]) {
    cacheMetrics[cacheCategory] = { hits: 0, misses: 0, ratio: 0 }
  }

  // Try to get from cache
  try {
    const cachedResponse = await redis.get(cacheKey)

    if (cachedResponse) {
      // Update cache hit metrics
      cacheMetrics[cacheCategory].hits++

      const total =
        cacheMetrics[cacheCategory].hits + cacheMetrics[cacheCategory].misses
      cacheMetrics[cacheCategory].ratio =
        total > 0 ? cacheMetrics[cacheCategory].hits / total : 0

      if ((cacheMetrics[cacheCategory].hits + cacheMetrics[cacheCategory].misses) % 10 === 0) {
        updateMetricsInRedis().catch(console.error)
      }

      // Safely parse the cached response
      let data: { body: unknown; status: number; headers?: Record<string, string> }
      
      if (typeof cachedResponse === 'string') {
        try {
          data = JSON.parse(cachedResponse)
        } catch (parseError) {
          console.error('Error parsing cached response:', parseError)
          throw new Error('Invalid cache format')
        }
      } else if (typeof cachedResponse === 'object' && cachedResponse !== null) {
        data = cachedResponse as { body: unknown; status: number; headers?: Record<string, string> }
      } else {
        throw new Error(`Unexpected cached response type: ${typeof cachedResponse}`)
      }

      const response = NextResponse.json(data.body, {
        status: data.status,
        headers: {
          'x-cache': 'HIT',
          'cache-control': `public, max-age=${ttl}, stale-while-revalidate=${ttl * 2}`,
        },
      })

      // Copy any additional headers from the cached response
      if (data.headers) {
        Object.entries(data.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            response.headers.set(key, value)
          }
        })
      }

      return response
    }

    // Update cache miss metrics
    cacheMetrics[cacheCategory].misses++

    const total =
      cacheMetrics[cacheCategory].hits + cacheMetrics[cacheCategory].misses
    cacheMetrics[cacheCategory].ratio =
      total > 0 ? cacheMetrics[cacheCategory].hits / total : 0

    if ((cacheMetrics[cacheCategory].hits + cacheMetrics[cacheCategory].misses) % 10 === 0) {
      updateMetricsInRedis().catch(console.error)
    }
  } catch (error) {
    console.warn('Cache read error:', error)
    // Continue with normal request on cache error
  }

  // Cache miss, execute handler
  const response = await handler()

  // Only cache successful responses
  if (response.status >= 200 && response.status < 300) {
    try {
      // Clone and get the response body
      const clonedResponse = response.clone()
      let body: unknown
      
      try {
        body = await clonedResponse.json()
      } catch (jsonError) {
        console.warn('Response is not JSON, skipping cache:', jsonError)
        return response
      }

      // Extract headers to cache
      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      // Store in cache - always use JSON.stringify for consistency
      const cacheData = JSON.stringify({
        body,
        status: response.status,
        headers,
      })
      
      await redis.set(cacheKey, cacheData, { ex: ttl })

      // Add cache status header
      response.headers.set('x-cache', 'MISS')
      response.headers.set(
        'cache-control',
        `public, max-age=${ttl}, stale-while-revalidate=${ttl * 2}`,
      )
    } catch (error) {
      console.warn('Cache write error:', error)
      // Continue with normal response on cache error
    }
  }

  return response
}

/**
 * Invalidates all Redis cache keys matching a specific pattern
 *
 * @param pattern - Pattern for the keys to invalidate
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    // Find all keys matching the pattern
    const keys = await redis.keys(pattern)

    if (keys.length > 0) {
      await redis.del(keys[0], ...keys.slice(1))
      console.log(
        `Invalidated ${keys.length} cache entries matching: ${pattern}`,
      )
    }
  } catch (error) {
    console.error('Error invalidating cache:', error)
  }
}


/**
 * Invalidates only the cached todos for a user
 */
export const invalidateUserTodosCache = (userId: string) =>
  invalidateCache(`cache:user:${userId}:todos*`)

/**
 * Invalidates only the cached statistics for a user
 */
export const invalidateUserStatsCache = (userId: string) =>
  invalidateCache(`cache:user:${userId}:stats*`)

/**
 * Invalidates only the cached profile for a user
 */
export const invalidateUserProfileCache = (userId: string) =>
  invalidateCache(`cache:user:${userId}:profile*`)

/**
 * Creates a cache key prefix with the user ID
 */
export const getUserCachePrefix = (userId: string, resource: string) =>
  `user:${userId}:${resource}`

/**
 * Invalidates multiple cache entries in batch for a user
 * More efficient than calling multiple invalidate functions
 */
export async function invalidateUserCaches(userId: string): Promise<number> {
  try {
    const keys = await redis.keys(`cache:user:${userId}:*`)

    if (keys.length === 0) {
      return 0
    }

    await redis.del(keys[0], ...keys.slice(1))

    console.log(`Invalidated ${keys.length} cache entries for user ${userId}`)
    return keys.length
  } catch (error) {
    console.error('Error batch invalidating cache:', error)
    return 0
  }
}