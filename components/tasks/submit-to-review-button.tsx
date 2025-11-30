'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import { TaskStatus } from '@/lib/generated/prisma';
import { useUpdateTaskStatus } from '@/hooks/use-tasks';
import { useRouter } from '@/i18n/navigation';

interface SubmitReviewButtonProps {
  taskId: string;
  currentStatus: string;
}

export const SubmitReviewButton = ({
  taskId,
  currentStatus,
}: SubmitReviewButtonProps) => {
  const t = useTranslations('SubmitReviewButton');
  const updateTaskStatusMutation = useUpdateTaskStatus();
  const router = useRouter();
  const handleSubmitReview = async () => {
    const newStatus =
      currentStatus === 'REVIEW' ? TaskStatus.ACTIVE : TaskStatus.REVIEW;

    try {
      await updateTaskStatusMutation.mutateAsync({
        taskId,
        status: newStatus,
      });

      toast.success(
        currentStatus === 'REVIEW' ? t('toast.returned') : t('toast.submitted'),
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
    : currentStatus === 'REVIEW'
      ? t('buttonText.cancelReview')
      : t('buttonText.submitReview');

  const ariaLabel =
    currentStatus === 'REVIEW'
      ? t('ariaLabel.cancel', { taskId })
      : t('ariaLabel.submit', { taskId });

  return (
    <Button
      onClick={handleSubmitReview}
      disabled={isLoading || currentStatus === 'COMPLETED'}
      variant={currentStatus === 'REVIEW' ? 'outline' : 'default'}
      className={
        currentStatus === 'REVIEW'
          ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/20'
          : 'bg-yellow-500 text-white hover:bg-yellow-600'
      }
      aria-label={ariaLabel}
      title={buttonText}
      type='button'
      aria-disabled={isLoading || currentStatus === 'COMPLETED'}
    >
      <Icon
        icon={
          currentStatus === 'REVIEW'
            ? 'mdi:arrow-left-bold'
            : 'mdi:file-document-check'
        }
        className='mr-2 size-4'
        aria-hidden='true'
      />
      {isLoading ? <span aria-live='polite'>{buttonText}</span> : buttonText}
    </Button>
  );
};
