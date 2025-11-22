'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { cache } from 'react';
import { Prisma } from '@/lib/generated/prisma';
import { TaskPriority, TaskStatus } from '@/lib/generated/prisma/client';
import { getCached, cacheKeys, CACHE_TTL } from '@/lib/cache';
import { getTranslations } from 'next-intl/server';

export const getTasks = cache(
  async (
    page: number = 1,
    limit: number = 6,
    search?: string,
    status?: string,
    priority?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) => {
    const t = await getTranslations('ServerActions');
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      throw new Error(t('unauthorized'));
    }

    const filters = JSON.stringify({
      status,
      priority,
      search,
      sortBy,
      sortOrder,
    });
    const cacheKey = cacheKeys.tasks(session.user.id, page, filters);

    return getCached(
      cacheKey,
      async () => {
        const where: Prisma.TaskWhereInput = {
          userId: session.user.id,
        };

        if (status && status !== 'ALL') {
          where.status = {
            equals: status as TaskStatus,
          };
        }

        if (priority && priority !== 'ALL') {
          where.priority = {
            equals: priority as TaskPriority,
          };
        }

        if (search && search.trim()) {
          where.OR = [
            {
              title: {
                contains: search.trim(),
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: search.trim(),
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
          },
        });

        return {
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
  },
);
