'use client';

import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskStatus } from '@/lib/generated/prisma';
import { useTranslations } from 'next-intl';
import { useUpdateTaskStatus } from '@/hooks/use-tasks';

interface CompleteTaskCheckboxProps {
  taskId: string;
  currentStatus: TaskStatus;
}

export const CompleteTaskCheckbox = ({
  taskId,
  currentStatus,
}: CompleteTaskCheckboxProps) => {
  const checked = currentStatus === 'COMPLETED';
  const t = useTranslations('CompleteTaskCheckbox');
  const updateTaskStatusMutation = useUpdateTaskStatus();

  const handleToggle = async (nextChecked: boolean) => {
    const newStatus = nextChecked ? TaskStatus.COMPLETED : TaskStatus.ACTIVE;

    try {
      await updateTaskStatusMutation.mutateAsync({
        taskId,
        status: newStatus,
      });
      toast.success(nextChecked ? t('toast.completed') : t('toast.active'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.error'));
    }
  };

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(val) => handleToggle(!!val)}
      disabled={updateTaskStatusMutation.isPending}
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
