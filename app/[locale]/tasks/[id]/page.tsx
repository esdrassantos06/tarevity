import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { getFormatter, getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import { DeleteTaskButton } from '@/components/tasks/delete-task-button';
import { Separator } from '@/components/ui/separator';
import { translatePriority, translateStatus } from '@/utils/text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CompleteTaskButton } from '@/components/tasks/complete-task-button';
import { SubmitReviewButton } from '@/components/tasks/submit-to-review-button';
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

  const session = await auth.api.getSession({
    headers: await headers(),
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
      url: `https://tarevity.pt/tasks/${id}`,
    },
    twitter: {
      card: 'summary',
      title: ogTitle,
      description,
    },
  };
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { id, locale } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
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
  const tForm = await getTranslations({
    locale,
    namespace: 'EditTaskPage.form',
  });

  return (
    <>
      <Header />
      <main className='flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-20'>
        <div className='flex w-full max-w-7xl items-center justify-between gap-3 py-4'>
          <Button asChild variant={'ghost'} className='justify-start'>
            <Link
              className='flex items-center justify-center gap-2'
              href={'/dashboard'}
              aria-label={t('backToDashboard')}
              title={t('backToDashboard')}
            >
              <Icon
                icon={'tabler:arrow-left'}
                className='size-4 sm:size-5'
                aria-hidden='true'
              />
              <span className='text-sm sm:text-base'>
                {t('backToDashboard')}
              </span>
            </Link>
          </Button>
          <div className='flex items-center gap-2'>
            <Button
              asChild
              size={'icon-sm'}
              variant={'default'}
              className='bg-blue-accent hover:bg-blue-accent/80 dark:text-white'
            >
              <Link
                className='flex items-center justify-center gap-2'
                href={`/tasks/${id}/edit`}
                aria-label={t('editTask')}
                title={t('editTask')}
              >
                <Icon icon={'uil:edit'} className='size-4' aria-hidden='true' />
              </Link>
            </Button>
            <DeleteTaskButton taskId={id} />
          </div>
        </div>
        <Card
          className={`w-full max-w-7xl ${
            task.status === 'REVIEW' &&
            'border-l-4 border-l-yellow-500 sm:border-l-6'
          } bg-white dark:bg-[#1d1929]`}
        >
          <CardHeader className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div className='flex items-start gap-3 sm:gap-4'>
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg sm:size-12 ${
                  task.priority === 'HIGH'
                    ? 'bg-red-500'
                    : task.priority === 'MEDIUM'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
              >
                <Icon
                  icon={'material-symbols:flag-rounded'}
                  className='size-4 text-white sm:size-5'
                />
              </div>

              <div className='flex min-w-0 flex-1 flex-col gap-1'>
                <CardTitle
                  className={`text-xl font-bold break-words sm:text-2xl ${
                    task.status === 'COMPLETED' && 'line-through'
                  }`}
                >
                  {task.title}
                </CardTitle>
                <CardDescription className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm'>
                  <div className='flex min-w-0 items-center gap-1'>
                    <Icon
                      icon={'mdi:clock'}
                      className='size-3 shrink-0 sm:size-4'
                      aria-hidden='true'
                    />
                    <span className='hidden shrink-0 sm:inline'>
                      {t('created')}{' '}
                    </span>
                    <span className='min-w-0 break-words'>
                      {format.dateTime(task.createdAt, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className='flex shrink-0 items-center gap-1 whitespace-nowrap'>
                    <Icon
                      icon={'mdi:flag'}
                      className={`size-3 shrink-0 sm:size-4 ${
                        task.priority === 'HIGH'
                          ? 'text-red-500'
                          : task.priority === 'MEDIUM'
                            ? 'text-yellow-500'
                            : 'text-green-500'
                      }`}
                      aria-hidden='true'
                    />
                    <span className='hidden sm:inline'>
                      {translatePriority(task.priority, tForm)} {t('priority')}
                    </span>
                    <span className='sm:hidden'>
                      {translatePriority(task.priority, tForm)}
                    </span>
                  </div>
                  <div
                    className={`flex shrink-0 items-center gap-1 whitespace-nowrap ${
                      task.status === 'ACTIVE'
                        ? 'text-blue-500'
                        : task.status === 'REVIEW'
                          ? 'text-yellow-500'
                          : 'text-green-500'
                    }`}
                  >
                    <Icon
                      icon={'material-symbols:check-rounded'}
                      className='size-3 shrink-0 sm:size-4'
                      aria-hidden='true'
                    />
                    {translateStatus(task.status, tForm)}
                  </div>
                </CardDescription>
              </div>
            </div>

            <div className='flex justify-end sm:shrink-0'>
              <CompleteTaskButton
                taskId={task.id}
                currentStatus={task.status}
              />
            </div>
          </CardHeader>
          <Separator />

          <CardContent className='space-y-4 p-4 sm:p-6'>
            <h3 className='text-base font-semibold sm:text-lg'>
              {t('description')}
            </h3>
            {task.description ? (
              <div className='flex flex-col gap-4'>
                <p className='text-muted-foreground text-sm break-words sm:text-base'>
                  {task.description}
                </p>
              </div>
            ) : (
              <p className='text-muted-foreground text-xs italic sm:text-sm'>
                {t('noDescription')}
              </p>
            )}

            {task.status === 'REVIEW' && (
              <div className='flex w-full items-start gap-2 rounded-md bg-yellow-200/80 p-3 sm:p-4 dark:bg-yellow-800/20'>
                <Icon
                  icon={'material-symbols:info-rounded'}
                  className='size-4 shrink-0 self-center text-yellow-600 sm:size-5 dark:text-yellow-500'
                  aria-hidden='true'
                />
                <div className='flex min-w-0 flex-1 flex-col items-start gap-2'>
                  <h4 className='text-xs font-semibold text-yellow-700 sm:text-sm dark:text-yellow-300'>
                    {t('review.title')}
                  </h4>
                  <p className='text-xs break-words text-yellow-600 sm:text-sm dark:text-yellow-400'>
                    {t('review.message')}
                  </p>
                </div>
              </div>
            )}

            <div className='flex flex-col gap-4'>
              <h3 className='text-base font-semibold sm:text-lg'>
                {t('details')}
              </h3>
              <div className='grid w-full grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2'>
                <div className='flex flex-col justify-center gap-2 rounded-lg p-3 shadow sm:p-4 dark:bg-gray-800'>
                  <h4 className='text-xs text-gray-400 sm:text-sm'>
                    {t('status')}
                  </h4>
                  <div className='flex items-center gap-2 text-xs sm:text-sm'>
                    <div
                      className={`size-2 shrink-0 rounded-full sm:size-3 ${
                        task.status === 'ACTIVE'
                          ? 'bg-blue-500'
                          : task.status === 'REVIEW'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      aria-hidden='true'
                    />
                    <span className='truncate'>
                      {translateStatus(task.status, tForm)}
                    </span>
                  </div>
                </div>

                <div className='flex flex-col justify-center gap-2 rounded-lg p-3 shadow sm:p-4 dark:bg-gray-800'>
                  <h4 className='text-xs text-gray-400 sm:text-sm'>
                    {t('lastUpdated')}
                  </h4>
                  <div className='flex items-center gap-2 text-xs sm:text-sm'>
                    <span className='break-words'>
                      {format.dateTime(task.updatedAt, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className='flex flex-col justify-center gap-2 rounded-lg p-3 shadow sm:p-4 dark:bg-gray-800'>
                  <h4 className='text-xs text-gray-400 sm:text-sm'>
                    {t('dueDate')}
                  </h4>

                  {task.dueDate ? (
                    <p className='text-xs break-words sm:text-sm'>
                      {format.dateTime(new Date(task.dueDate), {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  ) : (
                    <p className='text-xs sm:text-sm'>{t('noDueDate')}</p>
                  )}
                </div>

                <div className='flex flex-col justify-center gap-2 rounded-lg p-3 shadow sm:p-4 dark:bg-gray-800'>
                  <h4 className='text-xs text-gray-400 sm:text-sm'>
                    {t('assignedTo')}
                  </h4>
                  <div className='flex items-center gap-2 text-xs sm:text-sm'>
                    <Avatar className='size-6 shrink-0 sm:size-8'>
                      <AvatarImage src={task.user.image ?? undefined} />
                      <AvatarFallback className='text-xs select-none sm:text-sm'>
                        {task.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className='truncate'>{task.user.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <Separator />
          <CardFooter className='p-4 sm:p-6'>
            <SubmitReviewButton taskId={task.id} currentStatus={task.status} />
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </>
  );
}
