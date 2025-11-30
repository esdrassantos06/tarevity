'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { translateStatus } from '@/utils/text';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { CACHE_TTL } from '@/lib/cache';
import { Skeleton } from '@/components/ui/skeleton';

interface TasksDonutChartProps {
  userId?: string;
}

const COLORS = {
  ACTIVE: '#3b82f6',
  COMPLETED: '#22c55e',
  REVIEW: '#eab308',
  TOTAL: '#6b7280',
};

export function TasksDonutChart({ userId }: TasksDonutChartProps) {
  const t = useTranslations('EditTaskPage.form');

  const {
    data: stats,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['tasks-stats'],
    queryFn: async () => {
      const res = await fetch('/api/tasks/stats');
      if (res.ok) return res.json();
      throw new Error('Failed to fetch task stats');
    },
    staleTime: CACHE_TTL.MEDIUM,
    enabled: !!userId,
  });

  const { chartData, totalCount } = useMemo(() => {
    if (!stats) {
      return {
        chartData: [
          {
            name: 'ACTIVE',
            value: 0,
            label: translateStatus('ACTIVE', t),
            color: COLORS.ACTIVE,
          },
          {
            name: 'COMPLETED',
            value: 0,
            label: translateStatus('COMPLETED', t),
            color: COLORS.COMPLETED,
          },
          {
            name: 'REVIEW',
            value: 0,
            label: translateStatus('REVIEW', t),
            color: COLORS.REVIEW,
          },
        ],
        totalCount: 0,
      };
    }

    const data = [
      {
        name: 'ACTIVE',
        value: stats.active,
        label: translateStatus('ACTIVE', t),
        color: COLORS.ACTIVE,
      },
      {
        name: 'COMPLETED',
        value: stats.completed,
        label: translateStatus('COMPLETED', t),
        color: COLORS.COMPLETED,
      },
      {
        name: 'REVIEW',
        value: stats.review,
        label: translateStatus('REVIEW', t),
        color: COLORS.REVIEW,
      },
    ];

    return { chartData: data, totalCount: stats.total };
  }, [stats, t]);

  if (isLoading || (isFetching && !stats)) {
    return (
      <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6'>
        <div className='flex-shrink-0'>
          <Skeleton className='size-40 rounded-full' />
        </div>
        <div className='flex flex-col gap-3'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='flex items-center gap-2'>
              <Skeleton className='size-4 rounded-full' />
              <Skeleton className='h-4 w-24' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasData = totalCount > 0;

  return (
    <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6'>
      <div className='flex-shrink-0'>
        <ResponsiveContainer
          style={{ outline: 'none' }}
          width={160}
          height={160}
        >
          <PieChart style={{ outline: 'none' }}>
            {hasData ? (
              <Pie
                isAnimationActive={false}
                style={{ outline: 'none' }}
                data={chartData}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={65}
                innerRadius={40}
                fill='#8884d8'
                dataKey='value'
              >
                {chartData.map((entry, index) => (
                  <Cell
                    style={{ outline: 'none' }}
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
            ) : (
              <Pie
                isAnimationActive={false}
                style={{ outline: 'none' }}
                data={[{ name: 'empty', value: 1 }]}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={65}
                innerRadius={40}
                fill='#e5e7eb'
                dataKey='value'
              >
                <Cell
                  style={{ outline: 'none' }}
                  fill='#e5e7eb'
                  stroke='#9ca3af'
                  strokeWidth={1}
                />
              </Pie>
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className='flex flex-col gap-3'>
        {chartData.map((entry, index) => (
          <div key={`legend-${index}`} className='flex items-center gap-2'>
            <div
              className='size-4 rounded-full'
              style={{ backgroundColor: entry.color }}
            />
            <span className='text-sm text-gray-700 dark:text-gray-300'>
              {entry.label}: {entry.value}
            </span>
          </div>
        ))}
        <div className='flex items-center gap-2 border-t border-gray-300 pt-2 dark:border-gray-700'>
          <div
            className='size-4 rounded-full'
            style={{ backgroundColor: COLORS.TOTAL }}
          />
          <span className='text-sm text-gray-700 dark:text-gray-300'>
            Total: {totalCount}
          </span>
        </div>
      </div>
    </div>
  );
}
