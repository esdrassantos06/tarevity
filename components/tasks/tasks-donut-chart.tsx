'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useMemo, useEffect, useState } from 'react';
import { translateStatus } from '@/utils/text';
import { useTranslations } from 'next-intl';

interface TasksDonutChartProps {
  userId?: string;
}

interface TaskStats {
  active: number;
  completed: number;
  review: number;
  total: number;
}

const COLORS = {
  ACTIVE: '#3b82f6',
  COMPLETED: '#22c55e',
  REVIEW: '#eab308',
  TOTAL: '#6b7280',
};

export function TasksDonutChart({ userId }: TasksDonutChartProps) {
  const t = useTranslations('EditTaskPage.form');
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!userId) return;
      try {
        const res = await fetch('/api/tasks/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch task stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [userId]);

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

  if (loading || !stats) {
    return null;
  }

  return (
    <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6'>
      <div className='flex-shrink-0'>
        <ResponsiveContainer
          style={{ outline: 'none' }}
          width={160}
          height={160}
        >
          <PieChart style={{ outline: 'none' }}>
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
