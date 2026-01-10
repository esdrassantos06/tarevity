import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import {
  rateLimiters,
  getRateLimitIdentifier,
  checkRateLimit,
} from './rate-limit';
import { errorResponse } from './api-response';
import type { ErrorResponse } from '@/types/AppErrors';

/**
 * Helper function to check rate limit and return error response if exceeded
 * Reduces code duplication across API routes
 */
export async function checkAndHandleRateLimit(
  req: NextRequest,
  userId: string | undefined,
  limiter: typeof rateLimiters.tasks,
): Promise<NextResponse<ErrorResponse> | null> {
  const headersList = await headers();
  const ip =
    req.headers.get('x-forwarded-for') ||
    headersList.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    headersList.get('x-real-ip') ||
    'unknown';
  const identifier = getRateLimitIdentifier(ip, userId);
  const rateLimitResult = await checkRateLimit(limiter, identifier);

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
    const response: NextResponse<ErrorResponse> = errorResponse(
      'Rate limit exceeded. Please try again later.',
      429,
      'RATE_LIMIT_ERROR',
    );
    response.headers.set('Retry-After', retryAfter.toString());
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set(
      'X-RateLimit-Remaining',
      rateLimitResult.remaining.toString(),
    );
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());
    return response;
  }

  return null;
}
