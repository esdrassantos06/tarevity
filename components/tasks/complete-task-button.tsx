'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import { translateStatus } from '@/utils/text';

interface CompleteTaskButtonProps {
  taskId: string;
  currentStatus: string;
}

export const CompleteTaskButton = ({
  taskId,
  currentStatus,
}: CompleteTaskButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('CompleteTaskButton');
  const tForm = useTranslations('EditTaskPage.form');

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: currentStatus === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || t('toast.error'));
        return;
      }

      toast.success(
        currentStatus === 'COMPLETED'
          ? t('toast.reactivated')
          : t('toast.completed'),
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
