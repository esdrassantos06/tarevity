'use client';

import { useTranslations } from 'next-intl';
import { UsersDataTable } from './users-data-table';
import { ListUsersAction } from '@/actions/admin-actions';
import type { ListUsersResult } from '@/types/Admin';
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
      <header>
        <h2 className='text-lg font-bold'>{t('title')}</h2>
        <p className='text-muted-foreground text-sm'>{t('description')}</p>
      </header>

      <section className='flex flex-col gap-4'>
        {isLoading || (isFetching && !usersData?.users) ? (
          <div className='flex flex-col gap-4'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-64 w-full' />
          </div>
        ) : error ? (
          <div className='text-destructive text-sm'>{error?.message}</div>
        ) : (
          <UsersDataTable data={usersData?.users || []} />
        )}
      </section>
    </>
  );
}
