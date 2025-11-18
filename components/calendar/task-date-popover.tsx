'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/generated/prisma/client';

interface TaskDatePopoverProps {
  date: Date;
  tasks: Task[];
  children: React.ReactNode;
}

export function TaskDatePopover({
  date,
  tasks,
  children,
}: TaskDatePopoverProps) {
  const router = useRouter();
  const t = useTranslations('CalendarPage');
  const [isOpen, setIsOpen] = useState(false);
  const format = useFormatter();

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (tasks.length === 0) {
    return <>{children}</>;
  }

  if (tasks.length === 1) {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleTaskClick(tasks[0].id);
    };

    return (
      <div
        className='hover:border-primary/50 active:border-primary active:ring-primary/20 h-full w-full cursor-pointer rounded-md border-2 border-transparent transition-all hover:opacity-80 active:opacity-70 active:ring-2'
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTaskClick(tasks[0].id);
          }
        }}
        role='button'
        tabIndex={0}
        aria-label={t('viewTask', { title: tasks[0].title })}
      >
        {React.isValidElement(children)
          ? React.cloneElement(
              children as React.ReactElement,
              {
                onClick: (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTaskClick(tasks[0].id);
                },
                type: 'button',
                style: { pointerEvents: 'auto' },
              } as React.HTMLAttributes<HTMLElement>,
            )
          : children}
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'relative z-10 h-full w-full cursor-pointer rounded-md border-2 transition-all hover:opacity-80 active:opacity-70',
            isOpen
              ? 'border-primary ring-primary/20 ring-2'
              : 'hover:border-primary/50 border-transparent',
          )}
          role='button'
          tabIndex={0}
          aria-label={t('tasksOnDate', {
            count: tasks.length,
            date: format.dateTime(date, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
          })}
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className='w-80 p-0 dark:bg-[#1d1929]'
        align='start'
        role='dialog'
        aria-label={t('tasksForDate', {
          date: format.dateTime(date, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
        })}
      >
        <div className='p-3'>
          <div className='mb-3 text-sm font-semibold'>
            {format.dateTime(date, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className='space-y-2'>
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className='hover:bg-accent active:bg-accent/80 flex min-h-[44px] w-full items-center gap-3 rounded-md p-3 text-left transition-colors'
                aria-label={t('viewTask', { title: task.title })}
              >
                <div
                  className={cn(
                    'size-2.5 flex-shrink-0 rounded-full',
                    getPriorityColor(task.priority),
                  )}
                  aria-hidden='true'
                />
                <span
                  className={cn(
                    'flex-1 text-sm leading-relaxed',
                    task.status === 'COMPLETED' && 'line-through opacity-60',
                  )}
                >
                  {task.title}
                </span>
                {task.status === 'REVIEW' && (
                  <Icon
                    icon='mdi:clock-outline'
                    className='size-5 flex-shrink-0 text-yellow-500'
                    aria-label={t('underReview')}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
