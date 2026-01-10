import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getLocaleFromRequest } from '@/lib/api-locale';
import { getTranslations } from 'next-intl/server';
import { getCached, CACHE_TTL, cacheKeys } from '@/lib/cache';
import { headers } from 'next/headers';

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
    return NextResponse.json({ error: t('notAuthenticated') }, { status: 401 });
  }

  const cacheKey = cacheKeys.userStats(session.user.id);

  const counts = await getCached(
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

  return NextResponse.json(counts);
}
