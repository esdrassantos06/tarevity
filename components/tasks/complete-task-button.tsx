'use client';

import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import { translateStatus } from '@/utils/text';
import { TaskStatus } from '@/lib/generated/prisma';
import { useUpdateTaskStatus } from '@/hooks/use-tasks';

interface CompleteTaskButtonProps {
  taskId: string;
  currentStatus: string;
}

export const CompleteTaskButton = ({
  taskId,
  currentStatus,
}: CompleteTaskButtonProps) => {
  const router = useRouter();
  const t = useTranslations('CompleteTaskButton');
  const tForm = useTranslations('EditTaskPage.form');
  const updateTaskStatusMutation = useUpdateTaskStatus();

  const handleComplete = async () => {
    const newStatus =
      currentStatus === 'COMPLETED' ? TaskStatus.ACTIVE : TaskStatus.COMPLETED;

    try {
      await updateTaskStatusMutation.mutateAsync({
        taskId,
        status: newStatus,
      });

      toast.success(
        currentStatus === 'COMPLETED'
          ? t('toast.reactivated')
          : t('toast.completed'),
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('toast.errorGeneric'),
      );
    }
  };

  const isLoading = updateTaskStatusMutation.isPending;

  const buttonText = isLoading
    ? t('buttonText.updating')
    : currentStatus === 'COMPLETED'
      ? translateStatus('COMPLETED', tForm)
      : t('buttonText.markComplete');

  const ariaLabel =
    currentStatus === 'COMPLETED'
      ? t('ariaLabel.reactivate', { taskId })
      : t('ariaLabel.markComplete', { taskId });

  return (
    <Button
      onClick={handleComplete}
      disabled={isLoading}
      variant={currentStatus === 'COMPLETED' ? 'outline' : 'default'}
      className={
        currentStatus === 'COMPLETED'
          ? 'border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-500'
          : 'bg-green-500 text-white hover:bg-green-600'
      }
      aria-label={ariaLabel}
      title={buttonText}
      type='button'
    >
      <Icon
        icon={
          currentStatus === 'COMPLETED' ? 'mdi:check-outline' : 'mdi:check-bold'
        }
        className='mr-2 size-4'
        aria-hidden='true'
      />
      {isLoading ? <span aria-live='polite'>{buttonText}</span> : buttonText}
    </Button>
  );
};
