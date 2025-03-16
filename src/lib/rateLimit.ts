import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { getToken } from 'next-auth/jwt'

let redis: Redis | null = null;
try {
  if (process.env.REDIS_URL && process.env.REDIS_TOKEN) {
    redis = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    });
  } else {
    console.warn('Redis configuration missing - rate limiting will be disabled');
  }
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
}

export async function rateLimiter(
  req: NextRequest,
  options: {
    limit: number;
    window: number;
    identifier?: string;
  }
) {
  if (!redis) {
    console.warn('Rate limiting unavailable - Redis client not initialized');
    return null;
  }

  const { limit, window, identifier } = options;


  const ipHeader = req.headers.get('x-forwarded-for');
  const clientIp = ipHeader 
    ? ipHeader.split(',')[0].trim() 
    : (req.headers.get('x-real-ip') || 'unknown-ip');
  

    const ipHashSeed = process.env.IP_HASH_SEED || 'tarevity-salt';
    const ipIdentifier = `${clientIp}:${ipHashSeed}`;
  
  const path = req.nextUrl.pathname;
  
  let userId = 'unauthenticated';
  try {
    const token = await getToken({ req });
    if (token?.id) {
      userId = token.id;
    }
  } catch (error) {
    console.error('Error getting user token for rate limiting:', error);
  }
  
  const id = identifier || `${userId}:${ipIdentifier}`;
  const key = `rate-limit:${path}:${id}`;

  let count = 0;
  try {
    const result = await redis.get(key);
    count = typeof result === 'number' ? result : 0;
  } catch (error) {
    console.error('Redis error in rate limiting:', error);
    
    if (path.includes('/auth/') || path.includes('/admin/') || path.includes('/account/delete')) {
      return NextResponse.json(
        { 
          error: 'Service temporarily unavailable',
          message: 'Please try again later.'
        },
        { status: 503 }
      );
    }
    
    return null;
  }

  if (count >= limit) {
    const multiplier = count > limit ? Math.min(Math.floor((count - limit) / 5) + 1, 5) : 1;
    const retryAfter = window * multiplier;

    try {
      await redis.incr(key);
      await redis.expire(key, window * multiplier);
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

  try {
    if (count === 0) {
      await redis.set(key, 1, { ex: window });
    } else {
      await redis.incr(key);
      await redis.expire(key, window);
    }
  } catch (error) {
    console.error('Error updating rate limit count:', error);
  }

  return null;
}