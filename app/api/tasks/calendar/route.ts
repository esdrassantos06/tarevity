import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { getLocaleFromRequest } from '@/lib/api-locale';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import {
  getCached,
  cacheKeys,
  CACHE_TTL,
  registerTaskCacheKey,
} from '@/lib/cache';
import { logger } from '@/lib/logger';
import { createErrorResponse } from '@/lib/error-handler';
import { errorResponse, successResponse } from '@/lib/api-response';
import {
  rateLimiters,
  getRateLimitIdentifier,
  checkRateLimit,
  getRateLimitIp,
} from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(req: NextRequest) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  const locale = await getLocaleFromRequest();

  if (!session) {
    const t = await getTranslations({ locale, namespace: 'ApiErrors' });
    return errorResponse(t('notAuthenticated'), 401, 'AUTHENTICATION_ERROR');
  }

  const ip = getRateLimitIp(req);
  const identifier = getRateLimitIdentifier(ip, session.user.id);
  const rateLimitResult = await checkRateLimit(
    rateLimiters.calendar,
    identifier,
  );

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
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const monthNum = month ? parseInt(month) : new Date().getMonth() + 1;
    const yearNum = year ? parseInt(year) : new Date().getFullYear();

    const cacheKey = cacheKeys.calendar(session.user.id, monthNum, yearNum);

    const result = await getCached(
      cacheKey,
      async () => {
        const where: {
          userId: string;
          dueDate: {
            not: null;
            gte?: Date;
            lt?: Date;
          };
        } = {
          userId: session.user.id,
          dueDate: { not: null },
        };

        const startDate = new Date(yearNum, monthNum - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(yearNum, monthNum, 1);
        endDate.setHours(0, 0, 0, 0);
        where.dueDate.gte = startDate;
        where.dueDate.lt = endDate;

        const tasks = await prisma.task.findMany({
          where,
          select: {
            id: true,
            title: true,
            dueDate: true,
            priority: true,
            status: true,
          },
          orderBy: { dueDate: 'asc' },
        });

        return { tasks };
      },
      CACHE_TTL.MEDIUM,
    );

    await registerTaskCacheKey(session.user.id, cacheKey);

    return successResponse(result);
  } catch (error) {
    const errorRes = createErrorResponse(error, {
      userId: session.user.id,
    });
    logger.error(
      'Error fetching calendar tasks',
      error instanceof Error ? error : new Error(String(error)),
      {
        userId: session.user.id,
      },
    );
    const t = await getTranslations({ locale, namespace: 'Errors' });
    return errorResponse(
      errorRes.error || t('fetchingCalendarTasks'),
      errorRes.statusCode,
      errorRes.code,
      errorRes.details,
    );
  }
}
