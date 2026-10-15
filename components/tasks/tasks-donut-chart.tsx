'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { CACHE_TTL } from '@/lib/cache-constants';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TasksDonutChartProps {
  userId?: string;
}

type TaskStats = {
  active: number;
  review: number;
  completed: number;
  total: number;
};

const rows = [
  { status: 'ACTIVE', key: 'active', bar: 'bg-print' },
  { status: 'REVIEW', key: 'review', bar: 'bg-stamp-violet' },
  { status: 'COMPLETED', key: 'completed', bar: 'bg-stamp-green' },
] as const;

export function TasksDonutChart({ userId }: TasksDonutChartProps) {
  const tForms = useTranslations('Forms');
  const t = useTranslations('TasksLedger');

  const {
    data: stats,
    isLoading,
    isFetching,
  } = useQuery<TaskStats>({
    queryKey: ['tasks-stats'],
    queryFn: async () => {
      const res = await fetch('/api/tasks/stats');
      if (!res.ok) throw new Error('Failed to fetch task stats');
      const json = await res.json();
      return json.data;
    },
    staleTime: CACHE_TTL.MEDIUM,
    enabled: !!userId,
  });

  if (isLoading || (isFetching && !stats)) {
    return (
      <div className='flex w-full flex-col'>
        {rows.map((row) => (
          <div
            key={row.key}
            className='border-rule flex items-center gap-3 border-b py-2.5'
          >
            <Skeleton className='h-3 w-20' />
            <Skeleton className='h-2 flex-1' />
            <Skeleton className='h-4 w-8' />
          </div>
        ))}
        <div className='flex items-center justify-between py-2.5'>
          <Skeleton className='h-3 w-12' />
          <Skeleton className='h-4 w-8' />
        </div>
      </div>
    );
  }

  const total = stats?.total ?? 0;

  return (
    <div className='flex w-full flex-col'>
      {rows.map((row, index) => {
        const value = stats?.[row.key] ?? 0;
        const percent = total > 0 ? (value / total) * 100 : 0;
        return (
          <div
            key={row.key}
            className={cn(
              'border-rule grid grid-cols-[6.5rem_1fr_3rem] items-center gap-3 py-2.5',
              index < rows.length - 1 && 'border-b',
            )}
          >
            <span className='field-label'>
              {tForms(`status.${row.status}`)}
            </span>
            <span className='bg-accent h-2' aria-hidden='true'>
              <span
                className={cn('block h-full', row.bar)}
                style={{ width: `${percent}%` }}
              />
            </span>
            <span className='typed text-right text-base tabular-nums'>
              {value}
            </span>
          </div>
        );
      })}
      <div className='border-rule grid grid-cols-[6.5rem_1fr_3rem] items-center gap-3 border-t-[3px] border-double py-2.5'>
        <span className='field-label text-foreground'>{t('total')}</span>
        <span aria-hidden='true' />
        <span className='typed text-right text-base font-bold tabular-nums'>
          {total}
        </span>
      </div>
    </div>
  );
}
