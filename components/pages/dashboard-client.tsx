'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskCard } from '@/components/tasks/task-card';
import SearchComponent from '@/components/search-component';
import { useTasks, useUpdateTaskStatus } from '@/hooks/use-tasks';
import type { Task } from '@/lib/generated/prisma/browser';
import { TaskPriority, TaskStatus } from '@/lib/generated/prisma/enums';
import { SessionWithUser } from '@/lib/auth';
import { BOARD_STATUSES, groupByStatus } from '@/utils/board';
import { cn } from '@/lib/utils';

type FilterPriority = 'ALL' | keyof typeof TaskPriority;
type SortBy = 'createdAt' | 'dueDate';
type SortOrder = 'asc' | 'desc';

const BOARD_LIMIT = 100;

const trayClass: Record<TaskStatus, string> = {
  ACTIVE: 'bg-via-white',
  REVIEW: 'bg-via-canary',
  COMPLETED: 'bg-via-pink',
};

export function DashboardClient({ session }: { session: SessionWithUser }) {
  const router = useRouter();
  const t = useTranslations('DashboardPage');
  const tForms = useTranslations('Forms');

  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);
  const [stampedId, setStampedId] = useState<string | null>(null);

  const { data, isLoading, error } = useTasks({
    page: 1,
    pageSize: BOARD_LIMIT,
    searchQuery,
    filter: 'ALL',
    priorityFilter,
    sortBy,
    sortOrder,
    enabled: !!session,
  });
  const updateStatus = useUpdateTaskStatus();

  useEffect(() => {
    if (!session) router.push('/auth/login');
  }, [session, router]);

  const tasks = useMemo(() => data?.tasks ?? [], [data]);
  const columns = useMemo(() => groupByStatus(tasks), [tasks]);
  const filtersActive =
    priorityFilter !== 'ALL' || sortBy !== 'createdAt' || sortOrder !== 'desc';

  const moveTask = useCallback(
    (task: Task, status: TaskStatus) => {
      if (task.status === status) return;
      setStampedId(task.id);
      updateStatus.mutate(
        { taskId: task.id, status },
        {
          onSuccess: () =>
            toast.success(
              t('board.moved', { tray: tForms(`trays.${status}`) }),
            ),
          onError: () => toast.error(t('board.moveError')),
        },
      );
    },
    [updateStatus, t, tForms],
  );

  const handleDrop = (event: React.DragEvent, status: TaskStatus) => {
    event.preventDefault();
    setDragOver(null);
    const id = event.dataTransfer.getData('text/task-id');
    const task = tasks.find((item) => item.id === id);
    if (task) moveTask(task, status);
  };

  const resetFilters = () => {
    setPriorityFilter('ALL');
    setSortBy('createdAt');
    setSortOrder('desc');
    setSearchQuery('');
  };

  return (
    <main
      id='main-content'
      className='mx-auto flex w-full max-w-360 flex-1 flex-col px-4 py-8 sm:px-6 lg:px-10 lg:py-10'
    >
      <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <h1
            className='font-display text-[clamp(2rem,3.4vw,3rem)] leading-none font-extrabold tracking-[-0.02em]'
            style={{ fontStretch: '80%' }}
          >
            {t('board.title')}
          </h1>
          <p className='typed text-muted-foreground mt-2 text-sm'>
            {t('board.registry', { count: data?.pagination.total ?? 0 })}
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <SearchComponent value={searchQuery} onChange={setSearchQuery} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='relative'>
                <Icon icon='tabler:adjustments-horizontal' aria-hidden='true' />
                {t('filters.open')}
                {filtersActive && (
                  <span className='bg-print absolute -top-1 -right-1 size-2.5' />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              sideOffset={6}
              className='w-[calc(100vw-2rem)] max-w-80 p-4'
            >
              <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-1.5'>
                  <label className='field-label'>{t('priority.label')}</label>
                  <Select
                    value={priorityFilter}
                    onValueChange={(value) =>
                      setPriorityFilter(value as FilterPriority)
                    }
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder={t('priority.label')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ALL'>{t('priority.all')}</SelectItem>
                      <SelectItem value='HIGH'>{t('priority.high')}</SelectItem>
                      <SelectItem value='MEDIUM'>
                        {t('priority.medium')}
                      </SelectItem>
                      <SelectItem value='LOW'>{t('priority.low')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <label className='field-label'>{t('sortBy')}</label>
                  <div className='flex gap-2'>
                    <Select
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value as SortBy)}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder={t('sortBy')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='createdAt'>
                          {t('sortOptions.createdAt')}
                        </SelectItem>
                        <SelectItem value='dueDate'>
                          {t('sortOptions.dueDate')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() =>
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      }
                      aria-label={
                        sortOrder === 'asc' ? 'Ascending' : 'Descending'
                      }
                    >
                      <Icon
                        icon={
                          sortOrder === 'asc'
                            ? 'tabler:sort-ascending'
                            : 'tabler:sort-descending'
                        }
                        aria-hidden='true'
                      />
                    </Button>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={resetFilters}
                  className='text-stamp-red hover:text-stamp-red justify-start'
                >
                  <Icon icon='tabler:refresh' aria-hidden='true' />
                  {t('reset')}
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild>
            <Link href='/tasks/new'>
              <Icon
                icon='tabler:file-plus'
                className='size-4'
                aria-hidden='true'
              />
              {t('board.newForm')}
            </Link>
          </Button>
        </div>
      </div>

      {error ? (
        <div className='sheet mt-8 flex flex-col items-start gap-2 p-6'>
          <p className='text-stamp-red flex items-center gap-2 font-semibold'>
            <Icon
              icon='tabler:alert-circle'
              className='size-5'
              aria-hidden='true'
            />
            {t('error.title')}
          </p>
          <p className='text-muted-foreground text-sm'>
            {error instanceof Error ? error.message : t('error.description')}
          </p>
        </div>
      ) : !isLoading &&
        tasks.length === 0 &&
        !searchQuery &&
        priorityFilter === 'ALL' ? (
        <div className='sheet mt-8 grid max-w-2xl gap-0'>
          <div className='border-print border-b-2 px-6 py-3'>
            <span className='field-label'>{tForms('formNumber')} 000001</span>
          </div>
          <div className='ruled px-6 py-6'>
            <span className='field-label'>{tForms('subject')}</span>
            <p className='typed mt-2 text-2xl font-bold'>
              {t('board.emptyTitle')}
            </p>
          </div>
          <div className='flex flex-col items-start gap-4 px-6 py-6'>
            <p className='text-muted-foreground'>{t('board.emptyBody')}</p>
            <Button asChild size='lg'>
              <Link href='/tasks/new'>{t('board.emptyAction')}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className='-mx-4 mt-8 flex flex-1 snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0'>
          {BOARD_STATUSES.map((status) => (
            <section
              key={status}
              aria-labelledby={`tray-${status}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(status);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node))
                  setDragOver(null);
              }}
              onDrop={(event) => handleDrop(event, status)}
              className={cn(
                'border-rule flex min-h-112 w-[85vw] max-w-md shrink-0 snap-start flex-col border transition-[outline-color] duration-150 lg:w-auto lg:max-w-none',
                trayClass[status],
                dragOver === status
                  ? 'outline-print outline-2 outline-offset-2 outline-dashed'
                  : 'outline-transparent',
              )}
            >
              <header className='border-print flex items-baseline justify-between gap-3 border-b-2 px-4 pt-4 pb-3'>
                <div>
                  <h2
                    id={`tray-${status}`}
                    className='font-display text-xl leading-none font-bold'
                    style={{ fontStretch: '85%' }}
                  >
                    {tForms(`trays.${status}`)}
                  </h2>
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {tForms(`trayHint.${status}`)}
                  </p>
                </div>
                <span className='typed text-print text-2xl font-bold tabular-nums'>
                  {isLoading
                    ? '··'
                    : String(columns[status].length).padStart(2, '0')}
                </span>
              </header>
              <ul className='flex flex-1 flex-col gap-3 p-3'>
                {isLoading ? (
                  [0, 1].map((i) => (
                    <li key={i}>
                      <Skeleton className='h-36 w-full' />
                    </li>
                  ))
                ) : columns[status].length === 0 ? (
                  <li className='border-rule text-muted-foreground grid flex-1 place-items-center border border-dashed p-6 text-center text-sm'>
                    {dragOver ? tForms('dropHere') : tForms('emptyTray')}
                  </li>
                ) : (
                  columns[status].map((task) => (
                    <li key={task.id}>
                      <TaskCard
                        task={task}
                        draggable
                        onMove={moveTask}
                        justStamped={stampedId === task.id}
                      />
                    </li>
                  ))
                )}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
