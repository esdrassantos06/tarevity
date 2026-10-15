'use client';

import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import { translateStatus } from '@/utils/text';
import { TaskStatus } from '@/lib/generated/prisma/enums';
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
      aria-label={ariaLabel}
      title={buttonText}
      type='button'
    >
      <Icon
        icon={
          currentStatus === 'COMPLETED'
            ? 'tabler:arrow-back-up'
            : 'tabler:check'
        }
        aria-hidden='true'
      />
      {isLoading ? <span aria-live='polite'>{buttonText}</span> : buttonText}
    </Button>
  );
};
