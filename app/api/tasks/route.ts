import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { taskSchema } from '@/validation/TaskSchema';
import { taskQuerySchema } from '@/validation/TaskQuerySchema';
import { NextRequest } from 'next/server';
import { Prisma } from '@/lib/generated/prisma/client';
import { TaskPriority, TaskStatus } from '@/lib/generated/prisma/client';
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
  getRateLimitIp,
  rateLimiters,
  getRateLimitIdentifier,
  checkRateLimit,
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

  const { searchParams } = new URL(req.url);

  const queryParams = {
    page: searchParams.get('page') || undefined,
    limit: searchParams.get('limit') || undefined,
    search: searchParams.get('search') || undefined,
    status: searchParams.get('status') || undefined,
    priority: searchParams.get('priority') || undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: searchParams.get('sortOrder') || undefined,
  };

  const parseResult = taskQuerySchema.safeParse(queryParams);

  if (!parseResult.success) {
    const t = await getTranslations({ locale, namespace: 'Errors' });
    const errorRes = createErrorResponse(parseResult.error, {
      userId: session.user.id,
    });
    return errorResponse(
      errorRes.error || t('invalidQueryParams'),
      400,
      'VALIDATION_ERROR',
      parseResult.error.issues,
    );
  }

  const { page, limit, search, status, priority, sortBy, sortOrder } =
    parseResult.data;

  const filters = JSON.stringify({
    status,
    priority,
    search,
    sortBy,
    sortOrder,
  });

  const cacheKey = cacheKeys.tasks(session.user.id, page, filters);

  const result = await getCached(
    cacheKey,
    async () => {
      const where: Prisma.TaskWhereInput = {
        userId: session.user.id,
      };

      if (status !== 'ALL') {
        where.status = {
          equals: status as TaskStatus,
        };
      }

      if (priority !== 'ALL') {
        where.priority = {
          equals: priority as TaskPriority,
        };
      }

      if (search) {
        where.OR = [
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ];
      }

      const total = await prisma.task.count({ where });

      const skip = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      const tasks = await prisma.task.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
        },
      });

      return {
        user: {
          id: session.user.id,
          name: session.user.name,
        },
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    },
    CACHE_TTL.MEDIUM,
  );

  await registerTaskCacheKey(session.user.id, cacheKey);

  return successResponse(result);
}

export async function POST(req: NextRequest) {
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
    rateLimiters.taskCreate,
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
    const body = await req.json();
    const parsed = taskSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : undefined,
        priority: parsed.priority,
        userId: session.user.id,
      },
    });

    await invalidateCacheKeys([
      cacheKeys.userStats(session.user.id),
      cacheKeys.notifications(session.user.id),
      cacheKeys.taskStats(session.user.id),
    ]);

    await invalidateUserTasksCache(session.user.id);

    return successResponse({ task }, 201);
  } catch (error) {
    const errorRes = createErrorResponse(error, {
      userId: session.user.id,
    });
    logger.error(
      'Error creating task',
      error instanceof Error ? error : new Error(String(error)),
      {
        userId: session.user.id,
      },
    );
    const t = await getTranslations({ locale, namespace: 'Errors' });
    return errorResponse(
      errorRes.error || t('creatingTask'),
      errorRes.statusCode,
      errorRes.code,
      errorRes.details,
    );
  }
}
