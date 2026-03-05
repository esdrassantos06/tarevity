import { Ratelimit } from '@upstash/ratelimit';
import { isDevelopment } from '@/utils/variables';
import { redis } from './redis';
import { NextRequest } from 'next/server';

type Duration = `${number} s` | `${number} m` | `${number} h`;

function createRateLimiter(requests: number, window: Duration, prefix: string) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: !isDevelopment,
    prefix,
  });
}

export const rateLimiters = {
  general: createRateLimiter(100, '1 m', 'api'),
  tasks: createRateLimiter(30, '1 m', 'tasks'),
  taskCreate: createRateLimiter(10, '1 m', 'tasks:create'),
  taskUpdate: createRateLimiter(20, '1 m', 'tasks:update'),
  notifications: createRateLimiter(20, '1 m', 'notifications'),
  calendar: createRateLimiter(30, '1 m', 'calendar'),
  stats: createRateLimiter(20, '1 m', 'stats'),
};

/**
 * Extract IP address from request headers
 * Handles both NextRequest and Headers objects
 */
export function getRateLimitIp(req: NextRequest | Headers): string {
  if (req instanceof Headers) {
    return req.get('x-forwarded-for') || req.get('x-real-ip') || 'unknown';
  }

  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');

  // x-forwarded-for can contain multiple IPs, take the first one
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return realIp || 'unknown';
}

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
export function getRateLimitIdentifier(
  ip: string | null,
  userId?: string,
): string {
  // Use user ID if available, otherwise use IP
  return userId || ip || 'anonymous';
}

/**
 * Check rate limit and return result
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string,
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  try {
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch {
    // If rate limiting fails, allow the request (fail open)
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }
}
