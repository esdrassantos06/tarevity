import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getLocaleFromRequest } from '@/lib/api-locale';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import {
  getCached,
  cacheKeys,
  CACHE_TTL,
  registerTaskCacheKey,
} from '@/lib/cache';

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
    return NextResponse.json({ error: t('notAuthenticated') }, { status: 401 });
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

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching calendar tasks:', error);
    const t = await getTranslations({ locale, namespace: 'Errors' });
    return NextResponse.json(
      { error: t('fetchingCalendarTasks') },
      { status: 500 },
    );
  }
}
