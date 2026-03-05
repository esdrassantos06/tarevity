import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NotificationUrgency, Notification } from '@/types/Notification';
import { getLocaleFromRequest } from '@/lib/api-locale';
import { getTranslations } from 'next-intl/server';
import { getCached, cacheKeys, CACHE_TTL } from '@/lib/cache';
import { cache } from 'react';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';
import { createErrorResponse } from '@/lib/error-handler';
import { errorResponse, successResponse } from '@/lib/api-response';
import {
  rateLimiters,
  getRateLimitIdentifier,
  checkRateLimit,
  getRateLimitIp,
} from '@/lib/rate-limit';

function calculateUrgency(dueDate: Date): {
  urgency: NotificationUrgency;
  daysUntil: number;
} {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - now.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysUntil <= 0) {
    return { urgency: 'overdue', daysUntil };
  } else if (daysUntil <= 3) {
    return { urgency: 'high', daysUntil };
  } else if (daysUntil <= 7) {
    return { urgency: 'medium', daysUntil };
  }

  // Should not reach here as we filter in the query
  return { urgency: 'medium', daysUntil };
}

function sortNotifications(a: Notification, b: Notification): number {
  const urgencyOrder: Record<NotificationUrgency, number> = {
    overdue: 0,
    high: 1,
    medium: 2,
  };

  const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  if (urgencyDiff !== 0) return urgencyDiff;

  return a.daysUntil - b.daysUntil;
}

const getNotificationsCached = cache(async (userId: string) => {
  const cacheKey = cacheKeys.notifications(userId);

  return getCached(
    cacheKey,
    async () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const tasks = await prisma.task.findMany({
        where: {
          userId,
          dueDate: {
            lte: sevenDaysFromNow,
          },
          status: {
            not: 'COMPLETED',
          },
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
        },
        orderBy: {
          dueDate: 'asc',
        },
      });

      const notifications: Notification[] = tasks
        .filter((task) => task.dueDate !== null)
        .map((task) => {
          const { urgency, daysUntil } = calculateUrgency(task.dueDate!);
          return {
            taskId: task.id,
            title: task.title,
            dueDate: task.dueDate!.toISOString(),
            urgency,
            daysUntil,
          };
        })
        .filter((notification) => {
          return notification.daysUntil <= 7;
        })
        .sort(sortNotifications);

      return notifications;
    },
    CACHE_TTL.SHORT,
  );
});

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
  const rateLimitResult = await checkRateLimit(
    rateLimiters.notifications,
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
    const notifications = await getNotificationsCached(session.user.id);

    return successResponse({
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    const errorRes = createErrorResponse(error, {
      userId: session.user.id,
    });
    logger.error(
      'Error fetching notifications',
      error instanceof Error ? error : new Error(String(error)),
      {
        userId: session.user.id,
      },
    );
    const t = await getTranslations({ locale, namespace: 'Errors' });
    return errorResponse(
      errorRes.error || t('fetchingNotifications'),
      errorRes.statusCode,
      errorRes.code,
      errorRes.details,
    );
  }
}
