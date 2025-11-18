'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { TaskDatePopover } from '@/components/calendar/task-date-popover';
import { CalendarDayButton } from '@/components/ui/calendar';
import { authClient } from '@/lib/auth-client';
import { Icon } from '@iconify/react';
import { Link, useRouter } from '@/i18n/navigation';
import { startOfToday, isBefore, format } from 'date-fns';
import { DayButton } from 'react-day-picker';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/generated/prisma/client';
import { useTranslations } from 'next-intl';

export default function CalendarPage() {
  const router = useRouter();
  const t = useTranslations('CalendarPage');
  const tErrors = useTranslations('Errors');
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push('/auth/login');
    }
  }, [session, isSessionPending, router]);

  useEffect(() => {
    async function fetchTasks() {
      if (!session) return;
      setLoading(true);
      try {
        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();
        const res = await fetch(
          `/api/tasks/calendar?month=${month}&year=${year}`,
        );
        if (!res.ok) throw new Error(tErrors('loadingTasks'));
        const data = await res.json();
        setTasks(data.tasks || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [session, currentMonth, tErrors]);

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (task.dueDate) {
        const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const getTasksForDate = useCallback(
    (date: Date): Task[] => {
      const dateKey = format(date, 'yyyy-MM-dd');
      return tasksByDate[dateKey] || [];
    },
    [tasksByDate],
  );

  const isPastDate = (date: Date): boolean => {
    return isBefore(date, startOfToday());
  };

  const CustomDayButton = (props: React.ComponentProps<typeof DayButton>) => {
    const { day } = props;
    const dateTasks = getTasksForDate(day.date);
    const hasTasks = dateTasks.length > 0;
    const isPast = isPastDate(day.date);

    const dayButton = (
      <div className={cn('relative size-full', isPast && 'opacity-60')}>
        <CalendarDayButton {...props} />
        {hasTasks && (
          <>
            {dateTasks.length === 1 ? (
              <div className='absolute bottom-0.5 left-1/2 z-10 flex size-full -translate-x-1/2 items-end justify-center gap-1.5 px-1 pb-1'>
                <div
                  className={cn(
                    'size-2 flex-shrink-0 rounded-full',
                    dateTasks[0].priority === 'HIGH'
                      ? 'bg-red-500'
                      : dateTasks[0].priority === 'MEDIUM'
                        ? 'bg-yellow-500'
                        : 'bg-green-500',
                  )}
                  aria-hidden='true'
                />
                <span className='text-foreground truncate text-[10px] leading-tight font-medium'>
                  {dateTasks[0].title}
                </span>
              </div>
            ) : (
              <div className='absolute bottom-1 left-1/2 z-10 flex size-full -translate-x-1/2 items-end justify-center gap-0.5 pb-1'>
                {dateTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'size-1.5 rounded-full',
                      task.priority === 'HIGH'
                        ? 'bg-red-500'
                        : task.priority === 'MEDIUM'
                          ? 'bg-yellow-500'
                          : 'bg-green-500',
                    )}
                    aria-hidden='true'
                  />
                ))}
                {dateTasks.length > 3 && (
                  <div
                    className='size-1.5 rounded-full bg-gray-500'
                    aria-label={t('moreTasks', {
                      count: dateTasks.length - 3,
                    })}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    );

    if (hasTasks) {
      return (
        <TaskDatePopover date={day.date} tasks={dateTasks}>
          {dayButton}
        </TaskDatePopover>
      );
    }

    return dayButton;
  };

  const modifiers = useMemo(() => {
    const modifiersObj: Record<string, (date: Date) => boolean> = {
      hasTasks: (date: Date) => getTasksForDate(date).length > 0,
      pastDate: (date: Date) => isPastDate(date),
    };
    return modifiersObj;
  }, [getTasksForDate]);

  const modifiersClassNames = {
    hasTasks: 'relative',
    pastDate: 'opacity-60 text-muted-foreground',
  };

  const handleGoToToday = () => {
    setCurrentMonth(new Date());
  };

  if (isSessionPending || loading) {
    return (
      <>
        <Header />
        <main className='flex flex-1 flex-col items-center justify-center p-4 py-12 sm:px-6 lg:px-8'>
          <div className='flex w-full max-w-7xl items-center justify-between py-4'>
            <Skeleton className='h-10 w-40' />
            <Skeleton className='h-10 w-24' />
          </div>
          <Card
            className='w-full max-w-7xl bg-white dark:bg-[#1d1929]'
            role='main'
          >
            <CardContent className='p-6'>
              <div className='flex flex-col gap-4'>
                <Skeleton className='mx-auto h-8 w-48' />
                <div className='grid grid-cols-7 gap-2'>
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className='h-16 w-full' />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className='flex flex-1 flex-col items-center justify-center p-4 py-12 sm:px-6 lg:px-8'>
        <div className='flex w-full max-w-7xl items-center justify-between py-4'>
          <Button asChild variant={'ghost'}>
            <Link
              className='flex items-center justify-center gap-2'
              href={'/dashboard'}
              aria-label={t('backToDashboard')}
              title={t('backToDashboard')}
            >
              <Icon icon={'tabler:arrow-left'} aria-hidden='true' />
              {t('backToDashboard')}
            </Link>
          </Button>
          <div className='flex items-center gap-2'>
            <Button
              onClick={handleGoToToday}
              variant='outline'
              aria-label={t('today')}
              title={t('today')}
            >
              <Icon
                icon='material-symbols:calendar-today-rounded'
                className='mr-2 size-4'
              />
              {t('today')}
            </Button>
          </div>
        </div>
        <Card
          className='w-full max-w-7xl bg-white shadow-lg dark:bg-[#1d1929]'
          role='main'
        >
          <CardContent className='p-6 md:p-10 lg:p-12'>
            <div className='flex w-full justify-center'>
              <Calendar
                mode='single'
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                components={{
                  DayButton: CustomDayButton,
                }}
                style={{ '--cell-size': '1rem' } as React.CSSProperties}
                className='w-full'
                classNames={{
                  caption_label: 'text-xl font-bold mt-10',
                  month_caption: 'mb-20 text-center',
                }}
              />
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
