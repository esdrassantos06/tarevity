'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskStatus } from '@/lib/generated/prisma';
import { useTranslations } from 'next-intl';

interface CompleteTaskCheckboxProps {
  taskId: string;
  currentStatus: TaskStatus;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

export const CompleteTaskCheckbox = ({
  taskId,
  currentStatus,
  onStatusChange,
}: CompleteTaskCheckboxProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [checked, setChecked] = useState(currentStatus === 'COMPLETED');
  const t = useTranslations('CompleteTaskCheckbox');

  const handleToggle = async (nextChecked: boolean) => {
    setIsLoading(true);
    const newStatus = nextChecked ? TaskStatus.COMPLETED : TaskStatus.ACTIVE;

    const promise = fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).then(async (response) => {
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('toast.errorGeneric'));
      }
      setChecked(nextChecked);
      onStatusChange?.(taskId, newStatus);
    });

    toast.promise(promise, {
      loading: t('toast.loading'),
      success: nextChecked ? t('toast.completed') : t('toast.active'),
      error: (err) => err.message || t('toast.error'),
    });

    promise.finally(() => setIsLoading(false));
  };

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(val) => handleToggle(!!val)}
      disabled={isLoading}
      className='data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500 dark:data-[state=checked]:bg-green-500'
      aria-label={
        checked
          ? t('ariaLabel.completed', { taskId })
          : t('ariaLabel.active', { taskId })
      }
      aria-describedby={`task-status-${taskId}`}
      title={checked ? t('title.markActive') : t('title.markCompleted')}
    />
  );
};
