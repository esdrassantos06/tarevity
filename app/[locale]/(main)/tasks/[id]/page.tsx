import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getFormatter, getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import { DeleteTaskButton } from '@/components/tasks/delete-task-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CompleteTaskButton } from '@/components/tasks/complete-task-button';
import { SubmitReviewButton } from '@/components/tasks/submit-to-review-button';
import { BackButton } from '@/components/back-button';
import { Stamp, statusTone } from '@/components/forms/stamp';
import {
  FormSheet,
  FormSheetHeader,
  StubStrip,
  sheetCell,
} from '@/components/tasks/task-form-sheet';
import { daysUntil, formNumber } from '@/utils/board';
import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/lib/generated/prisma/enums';
import type { Metadata } from 'next';
import { cache } from 'react';

type TaskPageProps = {
  params: Promise<{ id: string; locale: string }>;
};

const getTask = cache(async (id: string, userId: string) => {
  return await prisma.task.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      user: {
        select: { name: true, image: true },
      },
    },
  });
});

export async function generateMetadata({
  params,
}: TaskPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'TaskPage.metadata' });

  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    };
  }

  const task = await getTask(id, session.user.id);

  if (!task) {
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    };
  }

  const description = task.description
    ? task.description.length > 160
      ? `${task.description.substring(0, 157)}...`
      : task.description
    : t('viewDetails', { title: task.title });

  const truncatedTitle =
    task.title.length > 60 ? `${task.title.substring(0, 57)}...` : task.title;

  const ogTitle =
    task.title.length > 70 ? `${task.title.substring(0, 67)}...` : task.title;

  return {
    title: truncatedTitle,
    description,
    openGraph: {
      title: ogTitle,
      description,
      type: 'article',
      url: `https://tarevity.me/tasks/${id}`,
    },
    twitter: {
      card: 'summary',
      title: ogTitle,
      description,
    },
  };
}

const previousStatus: Record<TaskStatus, TaskStatus | null> = {
  ACTIVE: null,
  REVIEW: 'ACTIVE',
  COMPLETED: 'REVIEW',
};

const typedDate = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
} as const;

export default async function TaskPage({ params }: TaskPageProps) {
  const { id, locale } = await params;

  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return notFound();
  }

  const task = await getTask(id, session.user.id);

  if (!task) {
    return notFound();
  }

  const format = await getFormatter();
  const t = await getTranslations({ locale, namespace: 'TaskPage' });
  const tF = await getTranslations({ locale, namespace: 'Forms' });
  const tDelete = await getTranslations({
    locale,
    namespace: 'DeleteTaskButton',
  });

  const days = task.status === 'COMPLETED' ? null : daysUntil(task.dueDate);
  const daysOpen =
    task.status === 'COMPLETED' ? null : -(daysUntil(task.createdAt) ?? 0);
  const previous = previousStatus[task.status];

  return (
    <main
      id='main-content'
      role='main'
      className='flex flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-12'
    >
      <div className='flex w-full max-w-240 flex-col gap-4'>
        <BackButton
          href='/dashboard'
          translationKey='backToDashboard'
          namespace='TaskPage'
        />
        <FormSheet>
          <FormSheetHeader
            label={`Tarevity · ${tF('formNumber')}`}
            number={formNumber(task.id)}
            date={format.dateTime(task.createdAt, typedDate)}
          />

          <section className={sheetCell}>
            <h2 className='field-label'>{tF('subject')}</h2>
            <h1
              className='typed mt-1 leading-tight font-bold wrap-break-word'
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
            >
              {task.title}
            </h1>
          </section>

          <section className={sheetCell}>
            <h2 className='field-label'>{tF('notes')}</h2>
            <p
              className={cn(
                'mt-1.5 leading-7 wrap-break-word whitespace-pre-line',
                !task.description && 'text-muted-foreground',
              )}
            >
              {task.description || tF('blank')}
            </p>
          </section>

          <dl className='divide-rule ruled grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0'>
            <div className='px-5 py-4 sm:px-8'>
              <dt className='field-label'>{tF('due')}</dt>
              <dd className='mt-1'>
                {task.dueDate ? (
                  <>
                    <span className='typed block text-base'>
                      {format.dateTime(new Date(task.dueDate), typedDate)}
                    </span>
                    {days !== null && (
                      <span
                        className={cn(
                          'text-xs',
                          days < 0
                            ? 'text-stamp-red font-semibold'
                            : 'text-muted-foreground',
                        )}
                      >
                        {days < 0
                          ? tF('overdue', { count: -days })
                          : tF('daysLeft', { count: days })}
                      </span>
                    )}
                  </>
                ) : (
                  <span className='typed text-muted-foreground'>
                    {tF('noDue')}
                  </span>
                )}
              </dd>
            </div>
            <div className='px-5 py-4 sm:px-8'>
              <dt className='field-label'>{t('priority')}</dt>
              <dd className='mt-1 flex items-center gap-3'>
                <span className='typed text-base'>
                  {tF(`priority.${task.priority}`)}
                </span>
                {task.priority === 'HIGH' && (
                  <Stamp tone='red' rotate={-8} className='text-xs'>
                    {tF('urgent')}
                  </Stamp>
                )}
              </dd>
            </div>
            <div className='px-5 py-4 sm:px-8'>
              <dt className='field-label'>{tF('created')}</dt>
              <dd className='typed mt-1 text-base'>
                {format.dateTime(task.createdAt, typedDate)}
              </dd>
              {daysOpen !== null && (
                <p className='text-muted-foreground mt-1 text-xs'>
                  {tF('inProgress', { count: daysOpen })}
                </p>
              )}
            </div>
          </dl>

          <div className='divide-rule ruled grid divide-y sm:grid-cols-[1.4fr_1fr] sm:divide-x sm:divide-y-0'>
            <section className='px-5 py-4 sm:px-8'>
              <h2 className='field-label'>{t('status')}</h2>
              <div className='relative flex min-h-36 items-end justify-center py-4'>
                {previous && (
                  <span
                    className='absolute top-2 left-1/2 -translate-x-[85%] opacity-[0.16]'
                    aria-hidden='true'
                  >
                    <Stamp
                      tone={statusTone[previous]}
                      rotate={5}
                      className='text-xl sm:text-2xl'
                    >
                      {tF(`status.${previous}`)}
                    </Stamp>
                  </span>
                )}
                <Stamp
                  tone={statusTone[task.status]}
                  rotate={-7}
                  animate
                  className='relative text-3xl sm:text-4xl'
                >
                  {tF(`status.${task.status}`)}
                </Stamp>
              </div>
              {task.status === 'REVIEW' && (
                <p className='text-muted-foreground text-xs'>
                  {t('review.message')}
                </p>
              )}
            </section>
            <dl className='divide-rule grid divide-y'>
              <div className='px-5 py-4 sm:px-8'>
                <dt className='field-label'>{t('lastUpdated')}</dt>
                <dd className='typed mt-1 text-base'>
                  {format.dateTime(task.updatedAt, typedDate)}
                </dd>
              </div>
              <div className='px-5 py-4 sm:px-8'>
                <dt className='field-label'>{t('assignedTo')}</dt>
                <dd className='mt-1 flex items-center gap-2'>
                  <Avatar className='size-6 shrink-0'>
                    <AvatarImage src={task.user.image ?? undefined} />
                    <AvatarFallback className='text-xs select-none'>
                      {task.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className='typed truncate text-base'>
                    {task.user.name}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <StubStrip>
            <CompleteTaskButton taskId={task.id} currentStatus={task.status} />
            <SubmitReviewButton taskId={task.id} currentStatus={task.status} />
            <Button asChild variant='outline'>
              <Link
                href={`/tasks/${id}/edit`}
                aria-label={t('editTask')}
                title={t('editTask')}
              >
                <Icon icon='tabler:edit' aria-hidden='true' />
                {t('editTask')}
              </Link>
            </Button>
            <DeleteTaskButton
              taskId={id}
              variant='ghost'
              size='default'
              label={tDelete('button.label')}
              className='text-stamp-red hover:text-stamp-red sm:ml-auto'
            />
          </StubStrip>
        </FormSheet>
      </div>
    </main>
  );
}
