'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskDatePopover } from '@/components/calendar/task-date-popover';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfToday,
  startOfWeek,
} from 'date-fns';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/generated/prisma/browser';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { SessionWithUser } from '@/lib/auth';

const statusSquare: Record<Task['status'], string> = {
  ACTIVE: 'bg-print',
  REVIEW: 'bg-stamp-violet',
  COMPLETED: 'bg-stamp-green',
};

const MAX_LINES = 3;

function buildMonthGrid(month: Date, weekStartsOn: 0 | 1): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn });
  const days: Date[] = [];
  for (let day = start; !isBefore(end, day); day = addDays(day, 1)) {
    days.push(day);
  }
  return days;
}

export function CalendarClient({ session }: { session: SessionWithUser }) {
  const t = useTranslations('CalendarPage');
  const tErrors = useTranslations('Errors');
  const formatter = useFormatter();
  const locale = useLocale();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const weekStartsOn = locale === 'en' ? 0 : 1;

  const {
    data: tasks,
    isLoading,
    isFetching,
    error,
  } = useQuery<Task[]>({
    queryKey: ['tasks-calendar', currentMonth],
    queryFn: async () => {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const res = await fetch(
        `/api/tasks/calendar?month=${month}&year=${year}`,
      );
      if (!res.ok) throw new Error(tErrors('loadingTasks'));
      const json = await res.json();
      return json.data.tasks;
    },
    enabled: !!session,
  });

  if (error) {
    console.error(error);
  }

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasks?.forEach((task: Task) => {
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

  const days = useMemo(
    () => buildMonthGrid(currentMonth, weekStartsOn),
    [currentMonth, weekStartsOn],
  );

  const monthLabel = formatter.dateTime(currentMonth, {
    month: 'long',
    year: 'numeric',
  });

  const header = (
    <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
      <div className='flex flex-col gap-1'>
        <h1
          className='font-display text-[clamp(2rem,3.4vw,3rem)] leading-none font-extrabold'
          style={{ fontStretch: '80%' }}
        >
          {t('metadata.title')}
        </h1>
        <p className='typed text-muted-foreground text-sm first-letter:uppercase'>
          {monthLabel}
        </p>
      </div>
      <div className='flex items-center gap-1'>
        <Button asChild variant='ghost' size='sm'>
          <Link
            href={'/dashboard'}
            aria-label={t('backToDashboard')}
            title={t('backToDashboard')}
          >
            <Icon icon='tabler:arrow-left' aria-hidden='true' />
            {t('backToDashboard')}
          </Link>
        </Button>
        <Button
          variant='ghost'
          size='icon-sm'
          onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
          aria-label={t('previousMonth')}
          title={t('previousMonth')}
        >
          <Icon icon='tabler:chevron-left' aria-hidden='true' />
        </Button>
        <Button
          onClick={() => setCurrentMonth(new Date())}
          variant='outline'
          size='sm'
          aria-label={t('today')}
          title={t('today')}
        >
          {t('today')}
        </Button>
        <Button
          variant='ghost'
          size='icon-sm'
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          aria-label={t('nextMonth')}
          title={t('nextMonth')}
        >
          <Icon icon='tabler:chevron-right' aria-hidden='true' />
        </Button>
      </div>
    </header>
  );

  const weekdayRow = (
    <div className='border-rule grid grid-cols-7 border-b' aria-hidden='true'>
      {days.slice(0, 7).map((day) => (
        <div key={day.toISOString()} className='field-label px-2 py-2'>
          {formatter.dateTime(day, { weekday: 'short' })}
        </div>
      ))}
    </div>
  );

  if (isLoading || (isFetching && !tasks)) {
    return (
      <main
        id='main-content'
        role='main'
        className='mx-auto flex w-full max-w-360 flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10'
      >
        {header}
        <div className='sheet rounded-[3px]'>
          {weekdayRow}
          <div className='grid grid-cols-7 gap-px p-px'>
            {days.map((day) => (
              <Skeleton key={day.toISOString()} className='h-20 sm:h-28' />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const today = startOfToday();

  return (
    <main
      id='main-content'
      role='main'
      className='mx-auto flex w-full max-w-360 flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10'
    >
      {header}
      <div className='sheet rounded-[3px]'>
        {weekdayRow}
        <div className='grid grid-cols-7'>
          {days.map((day, index) => {
            const dateTasks = tasksByDate[format(day, 'yyyy-MM-dd')] ?? [];
            const inMonth = isSameMonth(day, currentMonth);
            const isPast = isBefore(day, today);

            const cell = (
              <div
                className={cn(
                  'flex h-full min-h-20 flex-col gap-1 p-1.5 sm:min-h-28 sm:p-2',
                  !inMonth && 'bg-accent/40',
                )}
              >
                <span
                  className={cn(
                    'typed text-sm leading-none',
                    !inMonth && 'text-muted-foreground opacity-60',
                    inMonth && isPast && 'text-muted-foreground',
                    isToday(day) && 'text-print font-bold',
                  )}
                >
                  {format(day, 'd')}
                </span>
                {dateTasks.length > 0 && (
                  <ul className='flex min-w-0 flex-col gap-0.5'>
                    {dateTasks.slice(0, MAX_LINES).map((task) => {
                      const overdue =
                        isPast &&
                        task.priority === 'HIGH' &&
                        task.status !== 'COMPLETED';
                      return (
                        <li
                          key={task.id}
                          className={cn(
                            'typed flex min-w-0 items-center gap-1 text-[11px] leading-tight',
                            overdue && 'text-stamp-red',
                            task.status === 'COMPLETED' &&
                              'text-muted-foreground line-through',
                          )}
                        >
                          <span
                            className={cn(
                              'size-1.5 shrink-0',
                              statusSquare[task.status],
                            )}
                            aria-hidden='true'
                          />
                          <span className='hidden truncate sm:inline'>
                            {task.title}
                          </span>
                        </li>
                      );
                    })}
                    {dateTasks.length > MAX_LINES && (
                      <li className='typed text-muted-foreground text-[11px] leading-tight'>
                        <span aria-hidden='true'>
                          +{dateTasks.length - MAX_LINES}
                        </span>
                        <span className='sr-only'>
                          {t('moreTasks', {
                            count: dateTasks.length - MAX_LINES,
                          })}
                        </span>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            );

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'border-rule min-w-0',
                  index % 7 !== 6 && 'border-r',
                  index < days.length - 7 && 'border-b',
                  isToday(day) &&
                    'outline-print relative z-10 outline-2 -outline-offset-1',
                )}
              >
                {dateTasks.length > 0 ? (
                  <TaskDatePopover date={day} tasks={dateTasks}>
                    {cell}
                  </TaskDatePopover>
                ) : (
                  cell
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
