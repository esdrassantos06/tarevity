import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { checkAndHandleRateLimit } from '@/lib/rate-limit-helper';
import { rateLimiters } from '@/lib/rate-limit';

describe('checkAndHandleRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(new Headers());
  });

  it('should return null when rate limit is not exceeded', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    });

    const req = new NextRequest('http://example.com');
    const result = await checkAndHandleRateLimit(
      req,
      'user-123',
      rateLimiters.tasks,
    );

    expect(result).toBeNull();
  });

  it('should return error response when rate limit is exceeded', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const resetTime = Date.now() + 5000;
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: false,
      limit: 100,
      remaining: 0,
      reset: resetTime,
    });

    const req = new NextRequest('http://example.com', {
      headers: { 'x-forwarded-for': '192.168.1.1' },
    });

    const result = await checkAndHandleRateLimit(
      req,
      'user-123',
      rateLimiters.tasks,
    );

    expect(result).not.toBeNull();
    expect(result?.status).toBe(429);

    const body = await result?.json();
    expect(body).toMatchObject({
      error: 'Rate limit exceeded. Please try again later.',
      code: 'RATE_LIMIT_ERROR',
    });

    expect(result?.headers.get('Retry-After')).toBeDefined();
    expect(result?.headers.get('X-RateLimit-Limit')).toBe('100');
    expect(result?.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('should extract IP from request headers', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    });

    const req = new NextRequest('http://example.com', {
      headers: { 'x-forwarded-for': '10.0.0.1' },
    });

    await checkAndHandleRateLimit(req, undefined, rateLimiters.tasks);

    expect(checkRateLimit).toHaveBeenCalled();
  });

  it('should use userId when provided', async () => {
    const { checkRateLimit, getRateLimitIdentifier } =
      await import('@/lib/rate-limit');
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    });

    const req = new NextRequest('http://example.com');
    await checkAndHandleRateLimit(req, 'user-456', rateLimiters.tasks);

    expect(getRateLimitIdentifier).toHaveBeenCalledWith(
      expect.any(String),
      'user-456',
    );
  });
});
