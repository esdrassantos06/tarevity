import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getLocaleFromRequest } from '@/lib/api-locale';
import { getTranslations } from 'next-intl/server';
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

  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

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

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(parseInt(year), parseInt(month), 1);
      endDate.setHours(0, 0, 0, 0);
      where.dueDate.gte = startDate;
      where.dueDate.lt = endDate;
    }

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

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching calendar tasks:', error);
    const locale = await getLocaleFromRequest();
    const t = await getTranslations({ locale, namespace: 'Errors' });
    return NextResponse.json(
      { error: t('fetchingCalendarTasks') },
      { status: 500 },
    );
  }
}
