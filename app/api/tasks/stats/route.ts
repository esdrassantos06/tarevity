import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getLocaleFromRequest } from '@/lib/api-locale';
import { getTranslations } from 'next-intl/server';
import { getCached, CACHE_TTL, cacheKeys } from '@/lib/cache';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    const locale = getLocaleFromRequest(req);
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
