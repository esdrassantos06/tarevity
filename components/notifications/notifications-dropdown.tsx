'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFormatter, useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import { useQuery } from '@tanstack/react-query';
import { NotificationUrgency, Notification } from '@/types/notification';
import { cn } from '@/lib/utils';

export function NotificationsDropdown() {
  const { data: session } = authClient.useSession();
  const format = useFormatter();
  const t = useTranslations('NotificationsDropdown');

  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    isFetching: notificationsFetching,
    refetch,
  } = useQuery<{ notifications: Notification[]; count: number }>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error(t('errors.fetchError'));
      const json = await res.json();
      return json.data;
    },
    enabled: !!session,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const notifications = notificationsData?.notifications || [];

  const getUrgencyMessage = (notification: Notification): string => {
    const days = Math.abs(notification.daysUntil);
    switch (notification.urgency) {
      case 'overdue':
        return t('messages.overdue', { days });
      case 'high':
      case 'medium':
        return t('messages.dueIn', { days });
      default:
        return t('messages.dueDatePassed');
    }
  };

  const urgencyTone: Record<NotificationUrgency, string> = {
    overdue: 'text-stamp-red',
    high: 'text-stamp-violet',
    medium: 'text-print',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          aria-label={t('ariaLabel')}
          aria-haspopup='true'
          aria-expanded='false'
          title={t('title')}
          className='relative overflow-visible'
        >
          <Icon icon='tabler:bell' className='size-5' aria-hidden='true' />
          {notifications.length > 0 && (
            <span className='bg-stamp-red typed dark:text-background absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-[3px] px-0.5 text-[10px] leading-none font-bold text-white select-none'>
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={6}
        className='sheet z-999 w-[calc(100vw-2rem)] max-w-sm overflow-x-hidden rounded-[3px] p-0 md:min-w-80'
        role='menu'
        aria-label={t('menuAriaLabel')}
      >
        <div className='border-rule flex items-center justify-between border-b px-3 py-2'>
          <h2 className='field-label'>{t('header')}</h2>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 text-xs'
            aria-label={t('refreshAriaLabel')}
            title={t('refreshTitle')}
            onClick={(e) => {
              e.stopPropagation();
              refetch();
            }}
            disabled={notificationsFetching}
          >
            <Icon
              icon='tabler:refresh'
              className={cn(notificationsFetching && 'animate-spin')}
              aria-hidden='true'
            />
            {t('refresh')}
          </Button>
        </div>
        {notificationsLoading ||
        (notificationsFetching && notifications.length === 0) ? (
          <div className='flex flex-col'>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className='border-rule flex flex-col gap-2 border-b px-3 py-3 last:border-b-0'
              >
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-3 w-1/2' />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className='flex flex-col items-start gap-1 px-3 py-6'>
            <span className='border-rule block h-px w-full border-b border-dashed' />
            <p className='text-muted-foreground pt-3 text-sm'>{t('empty')}</p>
          </div>
        ) : (
          <div className='max-h-96 overflow-x-hidden overflow-y-auto'>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.taskId}
                asChild
                className='border-rule cursor-pointer rounded-none border-b last:border-b-0'
                role='menuitem'
              >
                <Link
                  href={`/tasks/${notification.taskId}`}
                  className='flex flex-col items-start gap-1 px-3 py-2.5'
                >
                  <div className='flex w-full min-w-0 items-baseline justify-between gap-3'>
                    <h3 className='typed line-clamp-1 min-w-0 flex-1 text-sm'>
                      {notification.title}
                    </h3>
                    <span
                      className={cn(
                        'field-label shrink-0',
                        urgencyTone[notification.urgency],
                      )}
                    >
                      {t(`urgency.${notification.urgency}`)}
                    </span>
                  </div>
                  <p className='text-muted-foreground text-xs wrap-break-word'>
                    {getUrgencyMessage(notification)}
                    {' · '}
                    <span className='typed'>
                      {format.dateTime(new Date(notification.dueDate), {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </p>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
