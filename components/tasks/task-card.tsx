'use client';

import { memo } from 'react';
import { Link } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import { useFormatter, useTranslations } from 'next-intl';
import type { Task } from '@/lib/generated/prisma/browser';
import type { TaskStatus } from '@/lib/generated/prisma/enums';
import { Stamp, statusTone } from '@/components/forms/stamp';
import { BOARD_STATUSES, daysUntil, formNumber } from '@/utils/board';
import { cn } from '@/lib/utils';
import { DeleteTaskButton } from './delete-task-button';

const previousStatus: Record<TaskStatus, TaskStatus | null> = {
  ACTIVE: null,
  REVIEW: 'ACTIVE',
  COMPLETED: 'REVIEW',
};

interface TaskCardProps {
  task: Task;
  justStamped?: boolean;
  onMove?: (task: Task, status: TaskStatus) => void;
  draggable?: boolean;
}

export const TaskCard = memo(function TaskCard({
  task,
  justStamped = false,
  onMove,
  draggable = false,
}: TaskCardProps) {
  const format = useFormatter();
  const t = useTranslations('Forms');
  const tBoard = useTranslations('DashboardPage.board');

  const days = daysUntil(task.dueDate);
  const overdue = days !== null && days < 0 && task.status !== 'COMPLETED';
  const index = BOARD_STATUSES.indexOf(task.status);
  const prev = previousStatus[task.status];
  const neighbours = [BOARD_STATUSES[index - 1], BOARD_STATUSES[index + 1]];

  return (
    <article
      draggable={draggable}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/task-id', task.id);
        event.dataTransfer.effectAllowed = 'move';
      }}
      className={cn(
        'group bg-card border-rule relative flex flex-col border shadow-[0_1px_2px_rgb(27_33_48/0.08)] transition-[box-shadow,transform] duration-200',
        draggable &&
          'cursor-grab hover:-translate-y-px hover:shadow-[0_8px_20px_-10px_rgb(27_33_48/0.35)] active:cursor-grabbing',
      )}
    >
      <header className='border-rule flex min-h-10 items-center gap-2 border-b py-1.5 pr-2 pl-4'>
        <span className='typed text-print text-xs font-bold whitespace-nowrap'>
          Nº {formNumber(task.id)}
        </span>
        <div className='relative z-10 ml-auto flex items-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100'>
          {onMove &&
            neighbours.map((status, i) =>
              status ? (
                <button
                  key={status}
                  type='button'
                  onClick={() => onMove(task, status)}
                  className='text-muted-foreground hover:text-print grid size-7 cursor-pointer place-items-center max-md:size-10'
                  aria-label={t('moveTo', { tray: t(`trays.${status}`) })}
                  title={t('moveTo', { tray: t(`trays.${status}`) })}
                >
                  <Icon
                    icon={i === 0 ? 'tabler:arrow-left' : 'tabler:arrow-right'}
                    className='size-4'
                    aria-hidden='true'
                  />
                </button>
              ) : null,
            )}
          <Link
            href={`/tasks/${task.id}/edit`}
            className='text-muted-foreground hover:text-print grid size-7 place-items-center max-md:size-10'
            aria-label={tBoard('edit')}
            title={tBoard('edit')}
          >
            <Icon icon='tabler:pencil' className='size-4' aria-hidden='true' />
          </Link>
          <DeleteTaskButton
            taskId={task.id}
            variant='ghost'
            size='icon-sm'
            icon='tabler:trash'
            iconSize='size-4'
            className='text-muted-foreground hover:text-stamp-red size-7 hover:bg-transparent max-md:size-10'
          />
        </div>
        {task.priority === 'HIGH' ? (
          <Stamp tone='red' rotate={3} className='text-[0.65rem]'>
            {t('urgent')}
          </Stamp>
        ) : (
          <span className='field-label text-muted-foreground'>
            {t(`priority.${task.priority}`)}
          </span>
        )}
      </header>

      <div className='px-4 pt-3 pb-4'>
        <h3 className='typed text-[1.05rem] leading-snug font-bold'>
          <Link
            href={`/tasks/${task.id}`}
            draggable={false}
            className='hover:text-print after:absolute after:inset-0 focus-visible:outline-none'
          >
            {task.title}
          </Link>
        </h3>
        {task.description && (
          <p className='text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-relaxed'>
            {task.description}
          </p>
        )}
      </div>

      <footer className='border-rule mt-auto flex items-end justify-between gap-3 border-t border-dashed px-4 py-3'>
        <div className='min-w-0'>
          <p className='field-label'>{t('due')}</p>
          {task.dueDate ? (
            <p className='typed mt-0.5 text-sm'>
              {format.dateTime(new Date(task.dueDate), {
                day: '2-digit',
                month: '2-digit',
              })}{' '}
              <span
                className={cn(
                  'text-xs',
                  overdue
                    ? 'text-stamp-red font-bold'
                    : 'text-muted-foreground',
                )}
              >
                {task.status === 'COMPLETED'
                  ? ''
                  : overdue
                    ? t('overdue', { count: Math.abs(days ?? 0) })
                    : t('daysLeft', { count: days ?? 0 })}
              </span>
            </p>
          ) : (
            <p className='typed text-muted-foreground mt-0.5 text-sm'>
              {t('noDue')}
            </p>
          )}
        </div>
        <div className='relative shrink-0 pr-1'>
          {prev && (
            <Stamp
              tone={statusTone[prev]}
              rotate={4}
              className='absolute -top-3 right-6 text-[0.7rem] opacity-20'
            >
              <span className='sr-only'>{t('previous')}: </span>
              {t(`status.${prev}`)}
            </Stamp>
          )}
          <Stamp
            key={`${task.id}-${task.status}`}
            tone={statusTone[task.status]}
            rotate={-7}
            animate={justStamped}
            className='text-sm'
          >
            {t(`status.${task.status}`)}
          </Stamp>
        </div>
      </footer>
    </article>
  );
});
