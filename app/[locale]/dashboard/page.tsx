'use client';

import Footer from '@/components/footer';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { Icon } from '@iconify/react';
import { Link, useRouter } from '@/i18n/navigation';
import { useEffect, useState, useCallback } from 'react';
import { TaskPriority, TaskStatus } from '@/lib/generated/prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskCard } from '@/components/tasks/task-card';
import SearchComponent from '@/components/search-component';
import { TasksDonutChart } from '@/components/tasks/tasks-donut-chart';
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
import { Separator } from '@/components/ui/separator';
import { useTasks } from '@/hooks/use-tasks';

type FilterStatus = 'ALL' | keyof typeof TaskStatus;
type FilterPriority = 'ALL' | keyof typeof TaskPriority;
type SortBy = 'createdAt' | 'dueDate';
type SortOrder = 'asc' | 'desc';

export default function Dashboard() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const t = useTranslations('DashboardPage');

  const [filter, setFilterState] = useState<FilterStatus>('ALL');
  const [priorityFilter, setPriorityFilterState] =
    useState<FilterPriority>('ALL');
  const [sortBy, setSortByState] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrderState] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQueryState] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);

  const {
    data: tasksData,
    isLoading,
    isFetching,
    error,
  } = useTasks({
    page: currentPage,
    pageSize,
    searchQuery,
    filter,
    priorityFilter,
    sortBy,
    sortOrder,
    enabled: !!session && !isPending,
  });

  useEffect(() => {
    if (!session && !isPending) {
      router.push('/auth/login');
    }
  }, [session, isPending, router]);

  const setFilter = useCallback((value: FilterStatus) => {
    setFilterState(value);
    setCurrentPage(1);
  }, []);

  const setPriorityFilter = useCallback((value: FilterPriority) => {
    setPriorityFilterState(value);
    setCurrentPage(1);
  }, []);

  const setSortBy = useCallback((value: SortBy) => {
    setSortByState(value);
    setCurrentPage(1);
  }, []);

  const setSortOrder = useCallback((value: SortOrder) => {
    setSortOrderState(value);
    setCurrentPage(1);
  }, []);

  const setSearchQuery = useCallback((value: string) => {
    setSearchQueryState(value);
    setCurrentPage(1);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) =>
      Math.min(tasksData?.pagination?.totalPages || 1, prev + 1),
    );
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, [tasksData?.pagination?.totalPages]);

  const handleResetFilters = useCallback(() => {
    setFilter('ALL');
    setPriorityFilter('ALL');
    setSortBy('createdAt');
    setSortOrder('desc');
    setSearchQuery('');
  }, [setFilter, setPriorityFilter, setSortBy, setSortOrder, setSearchQuery]);

  return (
    <>
      <Header />
      <main className='flex min-h-screen w-full flex-1 flex-col items-center px-4 py-20 sm:px-6 lg:px-8'>
        <nav className='flex w-full flex-col items-center justify-center gap-4 py-4 sm:gap-6'>
          <div className='flex w-full max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
            <h1 className='text-2xl font-bold sm:text-3xl md:text-4xl'>
              {t('title')}
            </h1>
            <div className='flex w-full items-center justify-center gap-2 sm:w-auto'>
              <Button
                asChild
                className='bg-blue-accent hover:bg-blue-accent/80 flex-1 sm:flex-initial dark:text-white'
              >
                <Link href={'/tasks/new'}>
                  <Icon icon={'material-symbols:add'} className='size-5' />
                  <span className='hidden sm:inline'>{t('createTask')}</span>
                  <span className='sm:hidden'>{t('create')}</span>
                </Link>
              </Button>
              <SearchComponent value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
          <div className='flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-2 sm:pb-0'>
              <Button
                variant='ghost'
                onClick={() => setFilter('ALL')}
                className={`shrink-0 cursor-pointer gap-2 text-xs whitespace-nowrap sm:text-sm md:text-base ${
                  filter === 'ALL'
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/70 dark:text-white dark:hover:bg-blue-800/50'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <div className='bg-blue-accent size-2 shrink-0 rounded-full' />
                {t('filters.all')}
              </Button>

              <div className='hidden h-6 border-r border-gray-300 sm:block dark:border-slate-700' />

              <Button
                variant={'ghost'}
                className={`shrink-0 cursor-pointer gap-2 text-xs whitespace-nowrap sm:text-sm md:text-base ${
                  filter === 'ACTIVE'
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
                onClick={() => setFilter('ACTIVE')}
              >
                <div className='size-1 shrink-0 cursor-pointer rounded-full bg-blue-400' />
                {t('filters.active')}
              </Button>

              <Button
                variant={'ghost'}
                className={`shrink-0 cursor-pointer gap-2 text-xs whitespace-nowrap sm:text-sm md:text-base ${
                  filter === 'COMPLETED'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-500 dark:hover:bg-green-900/30'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
                onClick={() => setFilter('COMPLETED')}
              >
                <div className='size-1 shrink-0 cursor-pointer rounded-full bg-green-500' />
                {t('filters.completed')}
              </Button>

              <Button
                variant={'ghost'}
                className={`shrink-0 cursor-pointer gap-2 text-xs whitespace-nowrap sm:text-sm md:text-base ${
                  filter === 'REVIEW'
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-500 dark:hover:bg-yellow-900/30'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
                onClick={() => setFilter('REVIEW')}
              >
                <div className='size-1 shrink-0 cursor-pointer rounded-full bg-yellow-500' />
                {t('filters.review')}
              </Button>
            </div>
            <div className='flex shrink-0'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={'outline'} className='w-full sm:w-auto'>
                    <Icon
                      icon={'mdi:filter-outline'}
                      className='size-4 sm:size-5'
                    />
                    <span className='ml-2 sm:ml-0'>{t('filters.open')}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  sideOffset={4}
                  className='w-[calc(100vw-2rem)] max-w-[20rem] rounded-md border border-gray-200 bg-white p-4 shadow-lg sm:w-auto dark:border-gray-700 dark:bg-[#1d1929]'
                >
                  <div className='flex flex-col gap-4'>
                    <div className='flex flex-col gap-2'>
                      <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        {t('priority.label')}
                      </label>
                      <Select
                        value={priorityFilter}
                        onValueChange={(value) =>
                          setPriorityFilter(value as FilterPriority)
                        }
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder={t('priority.label')} />
                        </SelectTrigger>
                        <SelectContent className='dark:bg-[#1d1929]'>
                          <SelectItem value='ALL'>
                            {t('priority.all')}
                          </SelectItem>
                          <SelectItem value='HIGH'>
                            {t('priority.high')}
                          </SelectItem>
                          <SelectItem value='MEDIUM'>
                            {t('priority.medium')}
                          </SelectItem>
                          <SelectItem value='LOW'>
                            {t('priority.low')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='flex flex-col gap-2'>
                      <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        {t('sortBy')}
                      </label>
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
                          title={
                            sortOrder === 'asc' ? 'Ascending' : 'Descending'
                          }
                        >
                          <Icon
                            icon={
                              sortOrder === 'asc'
                                ? 'mdi:sort-ascending'
                                : 'mdi:sort-descending'
                            }
                            className='size-4'
                          />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleResetFilters}
                      className='w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
                    >
                      <Icon icon='mdi:refresh' className='mr-2 size-4' />
                      {t('reset')}
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>
        <div className='w-full max-w-7xl py-4'>
          {session?.user?.id && !isPending ? (
            <TasksDonutChart userId={session.user.id} />
          ) : !isPending ? null : (
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
          )}
        </div>
        <section className='w-full max-w-7xl py-10 sm:py-16 md:py-20'>
          {isPending || isLoading || (isFetching && !tasksData) ? (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {[...Array(2)].map((_, i) => (
                <Card
                  key={i}
                  className='flex h-70 flex-col justify-between pb-2 dark:bg-[#1d1929]'
                >
                  <CardContent className='flex h-full flex-col justify-between'>
                    <div className='flex flex-col gap-2'>
                      <div className='flex items-center gap-2'>
                        <Skeleton className='size-4 rounded-full' />
                        <Skeleton className='h-6 w-3/4' />
                      </div>
                      <Skeleton className='h-4 w-1/2' />
                      <Skeleton className='mt-2 h-4 w-full' />
                      <Skeleton className='mt-2 h-4 w-2/3' />
                    </div>
                    <div className='mt-4'>
                      <Skeleton className='h-3 w-24' />
                    </div>
                  </CardContent>
                  <div>
                    <Separator />
                    <CardFooter className='flex items-center justify-end gap-2 pt-2'>
                      <Skeleton className='h-4 w-6' />
                      <Skeleton className='h-4 w-6' />
                    </CardFooter>
                  </div>
                </Card>
              ))}
            </div>
          ) : !isPending && error ? (
            <div className='flex flex-col items-center justify-center gap-4'>
              <div className='flex size-15 items-center justify-center rounded-full bg-red-800 p-2'>
                <Icon
                  icon={'material-symbols:error-outline'}
                  className='size-8 text-red-400'
                />
              </div>
              <div className='flex flex-col items-center justify-center gap-1'>
                <h3 className='font-semibold'>{t('error.title')}</h3>
                <p className='text-sm text-gray-400'>
                  {error instanceof Error
                    ? error.message
                    : t('error.description')}
                </p>
              </div>
            </div>
          ) : !isPending && (!tasksData || tasksData.tasks.length === 0) ? (
            <div className='flex flex-col items-center justify-center gap-4'>
              <div className='flex size-15 items-center justify-center rounded-full bg-gray-800 p-2'>
                <Icon
                  icon={'material-symbols:folder-outline'}
                  className='size-8 text-gray-400'
                />
              </div>
              <div className='flex flex-col items-center justify-center gap-1'>
                <h3 className='font-semibold'>{t('noTasks.title')}</h3>
                <p className='text-sm text-gray-400'>
                  {t('noTasks.description')}
                </p>
              </div>
              <Button
                asChild
                className='bg-blue-accent dark:bg-blue-accent/80 flex items-center dark:text-white'
              >
                <Link href={'/tasks/new'}>
                  <Icon icon={'material-symbols:add'} className='size-5' />
                  {t('noTasks.button')}
                </Link>
              </Button>
            </div>
          ) : tasksData ? (
            <>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {tasksData.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}

                {(!tasksData.pagination ||
                  tasksData.pagination.totalPages <= 1 ||
                  currentPage === tasksData.pagination.totalPages) && (
                  <Card className='hover:border-blue-accent flex h-70 items-center justify-center border-2 border-dashed transition-all duration-300 dark:bg-[#1d1929]'>
                    <Link
                      href={`/tasks/new`}
                      className='flex size-full items-center justify-center'
                    >
                      <CardContent className='flex w-full flex-col items-center'>
                        <Icon
                          icon={'mdi:plus'}
                          className='size-5 text-gray-500'
                        />
                        <p className='text-sm text-gray-500'>
                          {t('addNewTask')}
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                )}
              </div>
              {tasksData.pagination && tasksData.pagination.totalPages > 1 && (
                <div className='mt-8 flex items-center justify-center'>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <Icon
                        icon='material-symbols:chevron-left'
                        className='size-4'
                      />
                      {t('pagination.previous')}
                    </Button>
                    <div className='flex items-center gap-1 px-4'>
                      <span className='text-center text-sm text-gray-600 dark:text-gray-400'>
                        {t('pagination.page', {
                          current: tasksData.pagination.page,
                          total: tasksData.pagination.totalPages,
                        })}
                      </span>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleNextPage}
                      disabled={currentPage === tasksData.pagination.totalPages}
                    >
                      {t('pagination.next')}
                      <Icon
                        icon='material-symbols:chevron-right'
                        className='size-4'
                      />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </section>
      </main>
      <Footer />
    </>
  );
}
