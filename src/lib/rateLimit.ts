import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { getToken } from 'next-auth/jwt'

const redis = new Redis({
  url: process.env.REDIS_URL || '',
  token: process.env.REDIS_TOKEN || '',
})

export async function rateLimiter(
  req: NextRequest,
  options: {
    limit: number;
    window: number;
    identifier?: string;
  }
) {
  const { limit, window, identifier } = options;

  // Get basic identifiers
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
  const path = req.nextUrl.pathname;
  
  // Get authenticated user ID if available
  let userId = 'unauthenticated';
  try {
    const token = await getToken({ req });
    if (token?.id) {
      userId = token.id;
    }
  } catch (error) {
    console.error('Error getting user token for rate limiting:', error);
  }
  
  // Create composite key with user ID and IP
  const id = identifier || `${userId}:${ip}`;
  const key = `rate-limit:${path}:${id}`;

  // Try to get current count
  let count = 0;
  try {
    count = ((await redis.get(key)) as number) || 0;
  } catch (error) {
    console.error('Redis error in rate limiting:', error);
    // Fail open if Redis is down - better to allow the request than block everything
    return null;
  }

  if (count >= limit) {
    // Add exponential backoff for repeated violations
    const multiplier = count > limit ? Math.min(Math.floor((count - limit) / 5) + 1, 5) : 1;
    const retryAfter = window * multiplier;
    
    // Increment the count anyway to continue exponential backoff
    try {
      await redis.incr(key);
    } catch (error) {
      console.error('Error incrementing rate limit count:', error);
    }
    
    return NextResponse.json(
      { 
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${Math.ceil(retryAfter/60)} minute(s).`,
        retryAfter 
      },
      { 
        status: 429, 
        headers: { 
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.floor(Date.now() / 1000 + retryAfter).toString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        } 
      }
    );
  }

  // Update the count
  try {
    if (count === 0) {
      await redis.set(key, 1, { ex: window });
    } else {
      await redis.incr(key);
      // Make sure to refresh expiration on increment
      await redis.expire(key, window);
    }
  } catch (error) {
    console.error('Error updating rate limit count:', error);
    // Still let the request through if we can't update Redis
  }

  return null;
}