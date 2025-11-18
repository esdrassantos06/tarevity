'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';

interface SubmitReviewButtonProps {
  taskId: string;
  currentStatus: string;
}

export const SubmitReviewButton = ({
  taskId,
  currentStatus,
}: SubmitReviewButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('SubmitReviewButton');

  const handleSubmitReview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: currentStatus === 'REVIEW' ? 'ACTIVE' : 'REVIEW',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || t('toast.error'));
        return;
      }

      toast.success(
        currentStatus === 'REVIEW' ? t('toast.returned') : t('toast.submitted'),
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(t('toast.errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  };

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
