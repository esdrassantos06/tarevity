import { redis } from './redis'
import { NextResponse } from 'next/server'

type RateLimitConfig = {
  limit: number
  windowInSeconds: number
  identifier?: string
}

// Default values
const DEFAULT_LIMIT = 20
const DEFAULT_WINDOW_IN_SECONDS = 60
const DEFAULT_PENALTY_DURATION = 60 * 5 // 5 minutes

/**
 * Middleware to implement rate limiting
 * 
 * @param request - The incoming request
 * @param handler - The original handler function
 * @param config - Rate limit configuration options
 * @returns NextResponse, possibly with a 429 Too Many Requests status
 */
export async function withRateLimit(
  request: Request,
  handler: () => Promise<NextResponse>,
  config: RateLimitConfig = { limit: DEFAULT_LIMIT, windowInSeconds: DEFAULT_WINDOW_IN_SECONDS }
) {
  const { limit, windowInSeconds } = config

  // Get client IP
  const ip = getClientIp(request) || 'unknown'
  
  // Get request path
  const url = new URL(request.url)
  const path = url.pathname
  
  // Create rate limit key
  const identifier = config.identifier || `${ip}:${path}`
  const key = `rate-limit:${identifier}`
  
  try {
    // Get current count for this IP and endpoint
    const currentCount = await getRequestCount(key)
    
    // Check for penalty (if IP is temporarily blocked)
    const penaltyKey = `rate-limit-penalty:${identifier}`
    const hasPenalty = await redis.exists(penaltyKey)
    
    if (hasPenalty) {
      // Get remaining time for the penalty
      const ttl = await redis.ttl(penaltyKey)
      
      return NextResponse.json(
        { 
          message: 'Too many requests, please try again later',
          retryAfter: ttl 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(ttl),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + ttl)
          }
        }
      )
    }
    
    // Check if limit is reached
    if (currentCount >= limit) {
      // Apply penalty for repeated violations
      await redis.set(penaltyKey, '1', {
        ex: DEFAULT_PENALTY_DURATION
      })
      
      return NextResponse.json(
        { 
          message: 'Too many requests, please try again later',
          retryAfter: DEFAULT_PENALTY_DURATION 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(DEFAULT_PENALTY_DURATION),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + DEFAULT_PENALTY_DURATION)
          }
        }
      )
    }
    
    // Increment the counter
    await incrementRequestCount(key, windowInSeconds)
    
    // Calculate remaining requests
    const remaining = Math.max(0, limit - (currentCount + 1))
    
    // Execute the original handler
    const response = await handler()
    
    // Add rate limit headers to the response
    response.headers.set('X-RateLimit-Limit', String(limit))
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(Date.now() / 1000) + windowInSeconds))
    
    return response
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Continue with the original handler on error
    return handler()
  }
}

/**
 * Get the client IP address from the request
 */
function getClientIp(request: Request): string | null {
  // Try to get IP from headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  // Try to get IP from other common headers
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  // Return null if no IP found
  return null
}

/**
 * Get the current request count for a key
 */
async function getRequestCount(key: string): Promise<number> {
  const count = await redis.get(key)
  return count ? parseInt(count as string, 10) : 0
}

/**
 * Increment the request count for a key
 */
async function incrementRequestCount(key: string, windowInSeconds: number): Promise<void> {
  const count = await getRequestCount(key)
  
  if (count === 0) {
    // Set the key with expiration
    await redis.set(key, '1', { ex: windowInSeconds })
  } else {
    // Increment the existing key
    await redis.incr(key)
  }
}