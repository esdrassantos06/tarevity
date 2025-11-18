export type NotificationUrgency = 'overdue' | 'high' | 'medium';

export interface Notification {
  taskId: string;
  title: string;
  dueDate: string;
  urgency: NotificationUrgency;
  daysUntil: number;
}
