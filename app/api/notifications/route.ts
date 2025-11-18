import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { NotificationUrgency, Notification } from '@/types/Notification';
import { getLocaleFromRequest } from '@/lib/api-locale';
import { getTranslations } from 'next-intl/server';

function calculateUrgency(dueDate: Date): {
  urgency: NotificationUrgency;
  daysUntil: number;
} {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - now.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysUntil <= 0) {
    return { urgency: 'overdue', daysUntil };
  } else if (daysUntil <= 3) {
    return { urgency: 'high', daysUntil };
  } else if (daysUntil <= 7) {
    return { urgency: 'medium', daysUntil };
  }

  // Should not reach here as we filter in the query
  return { urgency: 'medium', daysUntil };
}

function sortNotifications(a: Notification, b: Notification): number {
  const urgencyOrder: Record<NotificationUrgency, number> = {
    overdue: 0,
    high: 1,
    medium: 2,
  };

  const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  if (urgencyDiff !== 0) return urgencyDiff;

  return a.daysUntil - b.daysUntil;
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    const locale = getLocaleFromRequest(req);
    const t = await getTranslations({ locale, namespace: 'ApiErrors' });
    return NextResponse.json({ error: t('notAuthenticated') }, { status: 401 });
  }

  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        dueDate: {
          lte: sevenDaysFromNow,
        },
        status: {
          not: 'COMPLETED',
        },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    const notifications: Notification[] = tasks
      .filter((task) => task.dueDate !== null)
      .map((task) => {
        const { urgency, daysUntil } = calculateUrgency(task.dueDate!);
        return {
          taskId: task.id,
          title: task.title,
          dueDate: task.dueDate!.toISOString(),
          urgency,
          daysUntil,
        };
      })
      .filter((notification) => {
        return notification.daysUntil <= 7;
      })
      .sort(sortNotifications);

    return NextResponse.json({
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    const locale = getLocaleFromRequest(req);
    const t = await getTranslations({ locale, namespace: 'Errors' });
    return NextResponse.json(
      { error: t('fetchingNotifications') },
      { status: 500 },
    );
  }
}
