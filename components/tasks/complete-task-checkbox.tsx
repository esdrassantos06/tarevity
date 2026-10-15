'use client';

import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskStatus } from '@/lib/generated/prisma/enums';
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
      className='border-print data-[state=checked]:border-print data-[state=checked]:bg-print dark:data-[state=checked]:bg-print data-[state=checked]:text-primary-foreground rounded-[3px] border-2 bg-transparent shadow-none dark:bg-transparent'
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
