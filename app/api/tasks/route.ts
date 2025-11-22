import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { taskSchema } from '@/validation/TaskSchema';
import { taskQuerySchema } from '@/validation/TaskQuerySchema';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/lib/generated/prisma';
import { TaskPriority, TaskStatus } from '@/lib/generated/prisma/client';
import { getLocaleFromRequest } from '@/lib/api-locale';
import { getTranslations } from 'next-intl/server';
import {
  invalidateCacheKeys,
  cacheKeys,
  getCached,
  CACHE_TTL,
} from '@/lib/cache';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    const locale = await getLocaleFromRequest();
    const t = await getTranslations({ locale, namespace: 'ApiErrors' });
    return NextResponse.json({ error: t('notAuthenticated') }, { status: 401 });
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
    const locale = await getLocaleFromRequest();
    const t = await getTranslations({ locale, namespace: 'Errors' });
    return NextResponse.json(
      {
        error: t('invalidQueryParams'),
        details: parseResult.error.issues,
      },
      { status: 400 },
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

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    const locale = await getLocaleFromRequest();
    const t = await getTranslations({ locale, namespace: 'ApiErrors' });
    return NextResponse.json({ error: t('notAuthenticated') }, { status: 401 });
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

    return NextResponse.json({ task });
  } catch (error) {
    console.error(error);
    const locale = await getLocaleFromRequest();
    const t = await getTranslations({ locale, namespace: 'Errors' });
    return NextResponse.json({ error: t('creatingTask') }, { status: 500 });
  }
}
