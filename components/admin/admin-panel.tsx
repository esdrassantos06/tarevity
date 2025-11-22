'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { UsersDataTable } from './users-data-table';
import { ListUsersAction } from '@/actions/admin-actions';
import type { AdminUser } from '@/types/Admin';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function AdminPanel() {
  const t = useTranslations('SettingsPage.admin');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await ListUsersAction();
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result.data) {
        setUsers(result.data.users);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('loadError');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <header>
        <h2 className='text-lg font-bold'>{t('title')}</h2>
        <p className='text-muted-foreground text-sm'>{t('description')}</p>
      </header>

      <section className='flex flex-col gap-4'>
        {isLoading ? (
          <div className='flex flex-col gap-4'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-64 w-full' />
          </div>
        ) : error ? (
          <div className='text-destructive text-sm'>{error}</div>
        ) : (
          <UsersDataTable data={users} />
        )}
      </section>
    </>
  );
}
