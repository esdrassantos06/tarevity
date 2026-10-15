'use client';

import { useTranslations } from 'next-intl';
import { UsersDataTable } from './users-data-table';
import { ListUsersAction } from '@/actions/admin-actions';
import type { ListUsersResult } from '@/types/admin';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

export function AdminPanel() {
  const t = useTranslations('SettingsPage.admin');

  const {
    data: usersData,
    isLoading,
    isFetching,
    error,
  } = useQuery<ListUsersResult>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const result = await ListUsersAction();
      if (result.error) throw new Error(result.error);
      if (!result.data) throw new Error(t('loadError'));
      return result.data;
    },
  });

  return (
    <>
      <header className='border-print border-b-2 pb-3 text-left'>
        <h2
          className='font-display text-2xl leading-tight font-bold'
          style={{ fontStretch: '80%' }}
        >
          {t('title')}
        </h2>
        <p className='text-muted-foreground mt-1 text-sm'>{t('description')}</p>
      </header>

      <section className='flex flex-col gap-4'>
        {isLoading || (isFetching && !usersData?.users) ? (
          <div className='flex flex-col gap-3'>
            <Skeleton className='h-10 w-full max-w-sm' />
            <Skeleton className='h-9 w-full' />
            <Skeleton className='h-9 w-full' />
            <Skeleton className='h-9 w-full' />
            <Skeleton className='h-9 w-full' />
          </div>
        ) : error ? (
          <p role='alert' className='text-destructive text-sm'>
            {error?.message}
          </p>
        ) : (
          <UsersDataTable data={usersData?.users || []} />
        )}
      </section>
    </>
  );
}
