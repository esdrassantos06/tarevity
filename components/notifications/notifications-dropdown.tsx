'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFormatter, useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import { useState } from 'react';
import { NotificationUrgency, Notification } from '@/types/Notification';

export function NotificationsDropdown() {
  const { data: session } = authClient.useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const format = useFormatter();
  const t = useTranslations('NotificationsDropdown');

  const fetchNotifications = async () => {
    if (!session) return;

    setNotificationsLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error(t('errors.fetchError'));
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error(t('errors.fetchError'), error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const getUrgencyMessage = (notification: Notification): string => {
    const daysPassed = Math.abs(notification.daysUntil);
    switch (notification.urgency) {
      case 'overdue':
        return t('messages.overdue', { days: daysPassed });
      case 'high':
        return t('messages.dueIn', { days: notification.daysUntil });
      case 'medium':
        return t('messages.dueIn', { days: notification.daysUntil });
      default:
        return t('messages.dueDatePassed');
    }
  };

  const getUrgencyColor = (urgency: NotificationUrgency): string => {
    switch (urgency) {
      case 'overdue':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          size='icon'
          variant='outline'
          aria-label={t('ariaLabel')}
          aria-haspopup='true'
          aria-expanded='false'
          title={t('title')}
          className='relative overflow-visible'
          onClick={() => {
            if (notifications.length === 0 && !notificationsLoading) {
              fetchNotifications();
            }
          }}
        >
          <Icon icon='akar-icons:bell' className='size-5' aria-hidden='true' />
          {notifications.length > 0 && (
            <span className='absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white ring-2 ring-white dark:ring-[#1d1929]'>
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={4}
        className='w-[calc(100vw-2rem)] max-w-sm overflow-x-hidden bg-white md:min-w-80 dark:bg-[#1d1929]'
        role='menu'
        aria-label={t('menuAriaLabel')}
      >
        <div className='flex items-center justify-between p-2'>
          <h2 className='text-sm font-semibold'>{t('header')}</h2>
          <Button
            variant={'ghost'}
            size={'sm'}
            className='group text-xs'
            aria-label={t('refreshAriaLabel')}
            title={t('refreshTitle')}
            onClick={(e) => {
              e.stopPropagation();
              fetchNotifications();
            }}
            disabled={notificationsLoading}
          >
            <Icon
              icon={'material-symbols:refresh'}
              className={`size-5 transition-all duration-1000 ${
                notificationsLoading && 'animate-spin'
              }`}
              aria-hidden='true'
            />
            {t('refresh')}
          </Button>
        </div>
        <DropdownMenuSeparator />
        {notificationsLoading ? (
          <div className='flex flex-col gap-2 p-4'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='flex items-center gap-3'>
                <Skeleton className='size-2 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-3 w-1/2' />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-4 py-8'>
            <div className='flex size-15 items-center justify-center rounded-full bg-gray-800 p-2 dark:bg-gray-700'>
              <Icon
                icon='akar-icons:bell'
                className='size-8 text-gray-400'
                aria-hidden='true'
              />
            </div>
            <div className='flex flex-col items-center justify-center gap-1'>
              <p className='text-sm text-gray-400'>{t('empty')}</p>
            </div>
          </div>
        ) : (
          <div className='max-h-96 overflow-x-hidden overflow-y-auto'>
            {notifications.map((notification, index) => (
              <div key={notification.taskId}>
                <DropdownMenuItem
                  asChild
                  className='cursor-pointer'
                  role='menuitem'
                >
                  <Link
                    href={`/tasks/${notification.taskId}`}
                    className='flex flex-col items-start gap-1 p-3 hover:bg-gray-50 hover:dark:bg-[#1d1915]/80'
                  >
                    <div className='flex w-full min-w-0 items-start justify-between gap-2'>
                      <h3 className='line-clamp-1 min-w-0 flex-1 text-sm font-medium'>
                        {notification.title}
                      </h3>
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getUrgencyColor(
                          notification.urgency,
                        )}`}
                      >
                        {t(`urgency.${notification.urgency}`)}
                      </span>
                    </div>
                    <p className='text-xs break-words text-gray-500 dark:text-gray-400'>
                      {getUrgencyMessage(notification)}
                    </p>
                    <p className='text-xs text-gray-400 dark:text-gray-500'>
                      {format.dateTime(new Date(notification.dueDate), {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </Link>
                </DropdownMenuItem>
                {index < notifications.length - 1 && <DropdownMenuSeparator />}
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
