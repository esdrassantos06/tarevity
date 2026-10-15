'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { AdminUser } from '@/types/admin';
import { Stamp } from '@/components/forms/stamp';
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

  const UserRoleMap: Record<string, string> = {
    user: t('roleUser'),
    admin: t('roleAdmin'),
  };

  if (!user) return null;

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t('id'), value: <span className='typed text-xs'>{user.id}</span> },
    { label: t('name'), value: user.name },
    {
      label: t('email'),
      value: <span className='typed lowercase'>{user.email}</span>,
    },
    {
      label: t('tasks'),
      value: <span className='typed'>{user.tasksCount}</span>,
    },
    {
      label: t('role'),
      value:
        user.role === 'admin' ? (
          <Stamp tone='violet' rotate={-3} className='text-[0.7rem]'>
            {UserRoleMap[user.role as keyof typeof UserRoleMap]}
          </Stamp>
        ) : (
          UserRoleMap[user.role as keyof typeof UserRoleMap]
        ),
    },
    {
      label: t('status'),
      value: user.banned ? (
        <Stamp tone='red' rotate={-3} className='text-[0.7rem]'>
          {t('banned')}
        </Stamp>
      ) : (
        <Stamp tone='print' rotate={-3} className='text-[0.7rem]'>
          {t('active')}
        </Stamp>
      ),
    },
    {
      label: t('createdAt'),
      value: (
        <span className='typed'>
          {format.dateTime(new Date(user.createdAt), {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          })}
        </span>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <dl className='flex flex-col'>
          {rows.map(({ label, value }) => (
            <div
              key={label}
              className='border-rule flex items-center justify-between gap-4 border-b py-2.5 last:border-b-0'
            >
              <dt className='field-label'>{label}</dt>
              <dd className='text-right text-sm'>{value}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
