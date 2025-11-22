import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getLocaleFromRequest } from '@/lib/api-locale';
import { getTranslations } from 'next-intl/server';
import { getCached, CACHE_TTL, cacheKeys } from '@/lib/cache';
import { headers } from 'next/headers';

export async function GET() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    const locale = await getLocaleFromRequest();
    const t = await getTranslations({ locale, namespace: 'ApiErrors' });
    return NextResponse.json({ error: t('notAuthenticated') }, { status: 401 });
  }

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

  return NextResponse.json(stats);
}
