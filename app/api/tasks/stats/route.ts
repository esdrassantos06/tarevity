import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getLocaleFromRequest } from '@/lib/api-locale';
import { getTranslations } from 'next-intl/server';
import { getCached, CACHE_TTL, cacheKeys } from '@/lib/cache';
import { headers } from 'next/headers';
import { errorResponse, successResponse } from '@/lib/api-response';
import {
  getRateLimitIp,
  rateLimiters,
  getRateLimitIdentifier,
  checkRateLimit,
} from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  const locale = await getLocaleFromRequest();

  if (!session) {
    const t = await getTranslations({ locale, namespace: 'ApiErrors' });
    return errorResponse(t('notAuthenticated'), 401, 'AUTHENTICATION_ERROR');
  }

  const ip = getRateLimitIp(headersList);
  const identifier = getRateLimitIdentifier(ip, session.user.id);
  const rateLimitResult = await checkRateLimit(rateLimiters.stats, identifier);

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
    const response = errorResponse(
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

  try {
    const cacheKey = cacheKeys.taskStats(session.user.id);

    const stats = await getCached(
      cacheKey,
      async () => {
        const [activeCount, completedCount, reviewCount, totalCount] =
          await Promise.all([
            prisma.task.count({
              where: { userId: session.user.id, status: 'ACTIVE' },
            }),
            prisma.task.count({
              where: { userId: session.user.id, status: 'COMPLETED' },
            }),
            prisma.task.count({
              where: { userId: session.user.id, status: 'REVIEW' },
            }),
            prisma.task.count({
              where: { userId: session.user.id },
            }),
          ]);

        return {
          active: activeCount,
          completed: completedCount,
          review: reviewCount,
          total: totalCount,
        };
      },
      CACHE_TTL.MEDIUM,
    );

    return successResponse(stats);
  } catch {
    const t = await getTranslations({ locale, namespace: 'Errors' });
    return errorResponse(
      t('loadingTasks') || 'Error loading tasks',
      500,
      'INTERNAL_ERROR',
    );
  }
}
