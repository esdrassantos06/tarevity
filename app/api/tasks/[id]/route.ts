import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { taskSchema } from '@/validation/TaskSchema';
import { z } from 'zod';
import { getLocaleFromRequest } from '@/lib/api-locale';
import { getTranslations } from 'next-intl/server';
import {
  invalidateCacheKeys,
  invalidateUserTasksCache,
  cacheKeys,
  getCached,
  CACHE_TTL,
  registerTaskCacheKey,
} from '@/lib/cache';
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

type EditTaskProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(req: NextRequest, { params }: EditTaskProps) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  const locale = await getLocaleFromRequest();

  const { id } = await params;

  if (!session) {
    const t = await getTranslations({ locale, namespace: 'ApiErrors' });
    return errorResponse(t('notAuthenticated'), 401, 'AUTHENTICATION_ERROR');
  }

  const ip = getRateLimitIp(req);
  const identifier = getRateLimitIdentifier(ip, session.user.id);
  const rateLimitResult = await checkRateLimit(rateLimiters.tasks, identifier);

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

  const t = await getTranslations({ locale, namespace: 'ApiErrors' });

  try {
    const cacheKey = cacheKeys.task(session.user.id, id);

    const result = await getCached(
      cacheKey,
      async () => {
        const task = await prisma.task.findFirst({
          where: {
            id,
            userId: session.user.id,
          },
        });

        if (!task) {
          return null;
        }

        return { task };
      },
      CACHE_TTL.MEDIUM,
    );

    if (!result || !result.task) {
      return errorResponse(t('taskNotFound'), 404, 'NOT_FOUND');
    }

    await registerTaskCacheKey(session.user.id, cacheKey);

    return successResponse(result);
  } catch (error) {
    const errorRes = createErrorResponse(error, {
      userId: session.user.id,
      taskId: id,
    });
    logger.error(
      'Error fetching task',
      error instanceof Error ? error : new Error(String(error)),
      {
        userId: session.user.id,
        taskId: id,
      },
    );
    return errorResponse(
      errorRes.error || t('taskNotFound'),
      errorRes.statusCode,
      errorRes.code,
    );
  }
}

export async function PATCH(req: NextRequest, { params }: EditTaskProps) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  const { id } = await params;
  const locale = await getLocaleFromRequest();

  if (!session) {
    const t = await getTranslations({ locale, namespace: 'ApiErrors' });
    return errorResponse(t('notAuthenticated'), 401, 'AUTHENTICATION_ERROR');
  }

  const ip = getRateLimitIp(req);
  const identifier = getRateLimitIdentifier(ip, session.user.id);
  const rateLimitResult = await checkRateLimit(
    rateLimiters.taskUpdate,
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

  const t = await getTranslations({ locale, namespace: 'ApiErrors' });

  try {
    const body = await req.json();
    const parsed = taskSchema.partial().parse(body);

    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return errorResponse(t('taskNotFound'), 404, 'NOT_FOUND');
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: parsed.title ?? existing.title,
        description: parsed.description ?? existing.description,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : existing.dueDate,
        priority: parsed.priority ?? existing.priority,
        status: parsed.status ?? existing.status,
      },
    });

    await invalidateCacheKeys([
      cacheKeys.userStats(session.user.id),
      cacheKeys.notifications(session.user.id),
      cacheKeys.taskStats(session.user.id),
      cacheKeys.task(session.user.id, id),
    ]);

    await invalidateUserTasksCache(session.user.id);

    return successResponse({ task: updated });
  } catch (error) {
    const errorRes = createErrorResponse(error, {
      userId: session.user.id,
      taskId: id,
    });
    logger.error(
      'Error updating task',
      error instanceof Error ? error : new Error(String(error)),
      {
        userId: session.user.id,
        taskId: id,
      },
    );
    const errorLocale = await getLocaleFromRequest();
    const tError = await getTranslations({
      locale: errorLocale,
      namespace: 'Errors',
    });
    if (error instanceof z.ZodError) {
      return errorResponse(
        tError('invalidQueryParams'),
        400,
        'VALIDATION_ERROR',
        error.issues,
      );
    }
    return errorResponse(
      errorRes.error || tError('updatingTask'),
      errorRes.statusCode,
      errorRes.code,
      errorRes.details,
    );
  }
}

export async function DELETE(req: NextRequest, { params }: EditTaskProps) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  const locale = await getLocaleFromRequest();

  const { id } = await params;

  if (!session) {
    const t = await getTranslations({ locale, namespace: 'ApiErrors' });
    return errorResponse(t('notAuthenticated'), 401, 'AUTHENTICATION_ERROR');
  }

  const t = await getTranslations({ locale, namespace: 'ApiErrors' });

  try {
    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return errorResponse(t('taskNotFound'), 404, 'NOT_FOUND');
    }

    await prisma.task.delete({ where: { id } });

    await invalidateCacheKeys([
      cacheKeys.userStats(session.user.id),
      cacheKeys.notifications(session.user.id),
      cacheKeys.taskStats(session.user.id),
      cacheKeys.task(session.user.id, id),
    ]);

    await invalidateUserTasksCache(session.user.id);

    return successResponse({ success: true });
  } catch (error) {
    const errorRes = createErrorResponse(error, {
      userId: session.user.id,
      taskId: id,
    });
    logger.error(
      'Error deleting task',
      error instanceof Error ? error : new Error(String(error)),
      {
        userId: session.user.id,
        taskId: id,
      },
    );
    return errorResponse(
      errorRes.error || t('taskNotFound'),
      errorRes.statusCode,
      errorRes.code,
    );
  }
}
