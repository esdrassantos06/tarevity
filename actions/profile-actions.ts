'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { cache } from 'react';
import { getCached, cacheKeys, CACHE_TTL } from '@/lib/cache';

export const getTaskCounts = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Not authenticated');
  }

  const cacheKey = cacheKeys.userStats(session.user.id);

  return getCached(
    cacheKey,
    async () => {
      const [total, completed] = await Promise.all([
        prisma.task.count({
          where: { userId: session.user.id },
        }),
        prisma.task.count({
          where: {
            userId: session.user.id,
            status: 'COMPLETED',
          },
        }),
      ]);

      return {
        created: total,
        completed,
        pending: total - completed,
      };
    },
    CACHE_TTL.SHORT,
  );
});
