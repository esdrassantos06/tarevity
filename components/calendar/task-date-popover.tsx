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
import type { Task } from '@/lib/generated/prisma/browser';
import { Stamp } from '@/components/forms/stamp';
import { formNumber } from '@/utils/board';

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
  const tF = useTranslations('Forms');
  const [isOpen, setIsOpen] = useState(false);
  const format = useFormatter();

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
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
        className='hover:border-print/50 active:border-print h-full w-full cursor-pointer rounded-[3px] border border-transparent transition-colors'
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
            'relative z-10 h-full w-full cursor-pointer rounded-[3px] border transition-colors',
            isOpen
              ? 'border-print'
              : 'hover:border-print/50 border-transparent',
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
        className='w-80 rounded-[3px] p-0'
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
        <div className='border-print border-b-2 px-3 py-2'>
          <p className='typed text-sm font-bold'>
            {format.dateTime(date, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <ul className='divide-rule divide-y'>
          {tasks.map((task) => (
            <li key={task.id}>
              <button
                onClick={() => handleTaskClick(task.id)}
                className='hover:bg-accent flex min-h-11 w-full items-center gap-3 px-3 py-2.5 text-left transition-colors'
                aria-label={t('viewTask', { title: task.title })}
              >
                <span className='typed text-print shrink-0 text-xs'>
                  {formNumber(task.id)}
                </span>
                <span
                  className={cn(
                    'typed flex-1 text-sm leading-snug',
                    task.status === 'COMPLETED' &&
                      'text-muted-foreground line-through',
                  )}
                >
                  {task.title}
                </span>
                {task.priority === 'HIGH' && (
                  <Stamp tone='red' rotate={-4} className='text-[0.625rem]'>
                    {tF('urgent')}
                  </Stamp>
                )}
                {task.status === 'REVIEW' && (
                  <Icon
                    icon='tabler:rubber-stamp'
                    className='text-stamp-violet size-4 shrink-0'
                    aria-label={t('underReview')}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
