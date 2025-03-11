import { NextResponse } from 'next/server'
import { redis } from './redis'

type CacheOptions = {
  ttl: number // Time to live in seconds
  keyPrefix?: string
  skipCache?: boolean // Flag to skip caching (useful for authenticated routes)
}

const DEFAULT_TTL = 60 * 5 // 5 minutes default TTL

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
  options: CacheOptions = { ttl: DEFAULT_TTL }
) {
  const { ttl = DEFAULT_TTL, keyPrefix = '', skipCache = false } = options
  
  // Skip caching for non-GET requests or when explicitly requested
  if (request.method !== 'GET' || skipCache) {
    return await handler()
  }

  const url = new URL(request.url)
  const cacheKey = `cache:${keyPrefix}:${url.pathname}${url.search}`

  // Try to get from cache
  try {
    const cachedResponse = await redis.get(cacheKey)
    
    if (cachedResponse) {
      const data = JSON.parse(cachedResponse as string)
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
      const body = await clonedResponse.json()
      
      // Extract headers to cache
      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })
      
      // Store in cache
      await redis.set(
        cacheKey, 
        JSON.stringify({
          body,
          status: response.status,
          headers
        }),
        { ex: ttl }
      )
      
      // Add cache status header
      response.headers.set('x-cache', 'MISS')
      response.headers.set('cache-control', `public, max-age=${ttl}, stale-while-revalidate=${ttl * 2}`)
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
        await redis.del(keys[0], ...keys.slice(1));
        console.log(`Invalidated ${keys.length} cache entries matching: ${pattern}`);
      }
  } catch (error) {
    console.error('Error invalidating cache:', error)
  }
}

// Helper functions for common cache operations

/**
 * Invalidates all cached data for a specific user
 */
export const invalidateUserCache = (userId: string) => 
  invalidateCache(`cache:user:${userId}:*`)

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