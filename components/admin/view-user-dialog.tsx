'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { AdminUser } from '@/actions/admin-actions';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useFormatter } from 'next-intl';

interface ViewUserDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewUserDialog({
  user,
  open,
  onOpenChange,
}: ViewUserDialogProps) {
  const t = useTranslations('SettingsPage.admin.table.viewUserDialog');
  const format = useFormatter();

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='dark:bg-[#1d1929]'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-4 py-4'>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm font-medium'>
                {t('id')}
              </span>
              <span className='font-mono text-xs'>{user.id}</span>
            </div>
            <Separator />
          </div>

          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm font-medium'>
                {t('name')}
              </span>
              <span className='text-sm'>{user.name}</span>
            </div>
            <Separator />
          </div>

          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm font-medium'>
                {t('email')}
              </span>
              <span className='text-sm lowercase'>{user.email}</span>
            </div>
            <Separator />
          </div>

          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm font-medium'>
                {t('tasks')}
              </span>
              <span className='text-sm font-medium'>{user.tasksCount}</span>
            </div>
            <Separator />
          </div>

          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm font-medium'>
                {t('role')}
              </span>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role || t('noRole')}
              </Badge>
            </div>
            <Separator />
          </div>

          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm font-medium'>
                {t('status')}
              </span>
              <Badge variant={user.banned ? 'destructive' : 'default'}>
                {user.banned ? t('banned') : t('active')}
              </Badge>
            </div>
            <Separator />
          </div>

          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm font-medium'>
                {t('createdAt')}
              </span>
              <span className='text-sm'>
                {format.dateTime(new Date(user.createdAt), {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
