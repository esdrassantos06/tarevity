import { differenceInCalendarDays } from 'date-fns';
import type { TaskStatus } from '@/lib/generated/prisma/enums';

export const BOARD_STATUSES = ['ACTIVE', 'REVIEW', 'COMPLETED'] as const;

/** Splits tasks into one bucket per status, in board column order. */
export function groupByStatus<T extends { status: TaskStatus }>(
  tasks: T[],
): Record<TaskStatus, T[]> {
  const buckets = { ACTIVE: [], REVIEW: [], COMPLETED: [] } as Record<
    TaskStatus,
    T[]
  >;
  for (const task of tasks) buckets[task.status].push(task);
  return buckets;
}

/** Calendar days from `now` to `due`; negative when overdue, null without a due date. */
export function daysUntil(
  due: Date | string | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!due) return null;
  return differenceInCalendarDays(new Date(due), now);
}

/** Six-character form number derived from a task id. */
export function formNumber(id: string): string {
  return id.slice(-6).toUpperCase().padStart(6, '0');
}
