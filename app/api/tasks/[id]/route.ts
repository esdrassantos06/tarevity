import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { taskSchema } from '@/validation/TaskSchema';
import { z } from 'zod';
import { getLocaleFromRequest } from '@/lib/api-locale';
import { getTranslations } from 'next-intl/server';
import { invalidateCacheKeys, cacheKeys } from '@/lib/cache';

type EditTaskProps = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: EditTaskProps) {
  const session = await auth.api.getSession({ headers: req.headers });

  const { id } = await params;

  if (!session) {
    const locale = getLocaleFromRequest(req);
    const t = await getTranslations({ locale, namespace: 'ApiErrors' });
    return NextResponse.json({ error: t('notAuthenticated') }, { status: 401 });
  }

  const locale = getLocaleFromRequest(req);
  const t = await getTranslations({ locale, namespace: 'ApiErrors' });

  const task = await prisma.task.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!task) {
    return NextResponse.json({ error: t('taskNotFound') }, { status: 404 });
  }

  return NextResponse.json({ task });
}

export async function PATCH(req: NextRequest, { params }: EditTaskProps) {
  const session = await auth.api.getSession({ headers: req.headers });
  const { id } = await params;

  if (!session) {
    const locale = getLocaleFromRequest(req);
    const t = await getTranslations({ locale, namespace: 'ApiErrors' });
    return NextResponse.json({ error: t('notAuthenticated') }, { status: 401 });
  }

  const locale = getLocaleFromRequest(req);
  const t = await getTranslations({ locale, namespace: 'ApiErrors' });

  try {
    const body = await req.json();
    const parsed = taskSchema.partial().parse(body);

    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: t('taskNotFound') }, { status: 404 });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: parsed.title ?? existing.title,
        description: parsed.description ?? existing.description,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : existing.dueDate,
        priority: parsed.priority ?? existing.priority,
        status: parsed.status ?? existing.status,
      },
    });

    await invalidateCacheKeys([
      cacheKeys.userStats(session.user.id),
      cacheKeys.notifications(session.user.id),
      cacheKeys.taskStats(session.user.id),
    ]);

    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error(error);
    const errorLocale = getLocaleFromRequest(req);
    const tError = await getTranslations({
      locale: errorLocale,
      namespace: 'Errors',
    });
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: tError('updatingTask') },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: EditTaskProps) {
  const session = await auth.api.getSession({ headers: req.headers });

  const { id } = await params;

  if (!session) {
    const locale = getLocaleFromRequest(req);
    const t = await getTranslations({ locale, namespace: 'ApiErrors' });
    return NextResponse.json({ error: t('notAuthenticated') }, { status: 401 });
  }

  const locale = getLocaleFromRequest(req);
  const t = await getTranslations({ locale, namespace: 'ApiErrors' });

  const existing = await prisma.task.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: t('taskNotFound') }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });

  await invalidateCacheKeys([
    cacheKeys.userStats(session.user.id),
    cacheKeys.notifications(session.user.id),
    cacheKeys.taskStats(session.user.id),
  ]);

  return NextResponse.json({ success: true });
}
