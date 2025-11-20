'use client';

import { memo } from 'react';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Icon } from '@iconify/react';
import { useFormatter, useTranslations } from 'next-intl';
import type { Task } from '@/lib/generated/prisma/client';
import { translatePriority } from '@/utils/text';
import { CompleteTaskCheckbox } from './complete-task-checkbox';
import { DeleteTaskButton } from './delete-task-button';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard = memo(function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: TaskCardProps) {
  const format = useFormatter();
  const t = useTranslations('DashboardPage');
  const tForm = useTranslations('EditTaskPage.form');

  return (
    <Card
      className={`flex h-70 flex-col justify-between pb-2 dark:bg-[#1d1929] ${
        task.status === 'REVIEW' && 'border-l-6 border-l-yellow-500'
      }`}
    >
      <CardContent className='flex h-full justify-between'>
        <Link
          href={`/tasks/${task.id}`}
          className='flex h-full flex-col justify-between'
        >
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <div
                className={`size-4 rounded-full ${
                  task.priority === 'HIGH'
                    ? 'bg-red-500'
                    : task.priority === 'MEDIUM'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
              />
              <h2
                className={`font-semibold ${
                  task.status === 'COMPLETED' && 'text-gray-500 line-through'
                }`}
              >
                {task.title.length > 20
                  ? `${task.title.slice(0, 20)}...`
                  : task.title}
              </h2>
            </div>
            <p className='text-sm text-gray-500'>
              {task.description
                ? `${task.description?.slice(0, 20)} ${
                    task.description?.length > 20 ? '...' : ''
                  }`
                : t('task.noDescription')}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <span className='flex items-center gap-1 text-xs text-gray-500'>
              <Icon
                icon={'mdi:flag'}
                className={`size-4 ${
                  task.priority === 'HIGH'
                    ? 'text-red-500'
                    : task.priority === 'MEDIUM'
                      ? 'text-yellow-500'
                      : 'text-green-500'
                }`}
              />
              {t('task.priority')} {translatePriority(task.priority, tForm)}
            </span>
            {task.dueDate && (
              <p className='flex items-center gap-1 text-xs text-gray-500'>
                {t('task.dueDate')}{' '}
                {format.dateTime(new Date(task.dueDate), {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </Link>
        <div className='flex items-start'>
          <CompleteTaskCheckbox
            taskId={task.id}
            currentStatus={task.status}
            onStatusChange={onStatusChange}
          />
        </div>
      </CardContent>
      <div>
        <Separator />
        <CardFooter className='flex items-center justify-end gap-2 pt-2'>
          <Link
            className='text-blue-accent hover:text-blue-accent/80 flex items-center justify-center gap-2 transition-all duration-300'
            href={`/tasks/${task.id}/edit`}
          >
            <Icon icon={'uil:edit'} className='size-4.5' />
          </Link>
          <div className='flex items-center'>
            <DeleteTaskButton
              iconSize='size-4.5'
              className='cursor-pointer bg-transparent text-red-500 hover:bg-transparent hover:text-red-500/80'
              variant='default'
              taskId={task.id}
              onDelete={() => onDelete(task.id)}
            />
          </div>
        </CardFooter>
      </div>
    </Card>
  );
});
