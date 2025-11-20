'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DeleteTaskButtonProps {
  taskId: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm';
  className?: string;
  icon?: string;
  label?: string;
  iconSize?: string;
  onDelete?: () => void;
}

export const DeleteTaskButton = ({
  taskId,
  variant = 'destructive',
  size = 'icon-sm',
  className = '',
  icon = 'bxs:trash',
  label,
  iconSize = 'size-4',
  onDelete,
}: DeleteTaskButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const t = useTranslations('DeleteTaskButton');

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || t('toast.error'));
        return;
      }

      toast.success(t('toast.success'));
      if (onDelete) onDelete();
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(t('toast.errorGeneric'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isDeleting}
          className={className}
          aria-label={label || t('button.ariaLabel', { taskId })}
          title={label || t('button.title')}
          type='button'
        >
          <Icon icon={icon} className={`${iconSize}`} aria-hidden='true' />
          {label && <span className='ml-2'>{label}</span>}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        className='dark:bg-[#1d1929]'
        role='alertdialog'
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
      >
        <AlertDialogTitle className='sr-only'>{t('dialog.title')}</AlertDialogTitle>
        <AlertDialogHeader>
          <AlertDialogTitle id='delete-dialog-title'>
            {t('dialog.title')}
          </AlertDialogTitle>
          <AlertDialogDescription id='delete-dialog-description'>
            {t('dialog.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            aria-label={t('dialog.cancelAriaLabel')}
          >
            {t('dialog.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className='bg-red-500 hover:bg-red-600 dark:text-white'
            aria-label={t('dialog.confirmAriaLabel', { taskId })}
          >
            {isDeleting ? (
              <span aria-live='polite'>{t('dialog.deleting')}</span>
            ) : (
              t('dialog.confirm')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
