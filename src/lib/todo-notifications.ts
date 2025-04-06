import { formatDistanceToNow } from 'date-fns'
import { notificationsService } from '@/lib/notifications'
import { getTranslations } from 'next-intl/server'

export interface Todo {
  id: string
  title: string
  description: string | null
  is_completed: boolean
  priority: number
  due_date: string | null
  created_at: string
  updated_at: string
  status?: 'active' | 'review' | 'completed'
  user_id: string
}

export async function handleTodoNotifications(
  userId: string,
  todo: Todo,
  previousTodo?: Todo,
) {
  const t = await getTranslations('notificationsUpdater')

  if (todo.is_completed) {
    await notificationsService.dismissTodoNotifications(userId, todo.id)
    return
  }

  if (!todo.due_date) {
    await notificationsService.deleteNotifications({
      userId,
      todoId: todo.id,
    })
    return
  }

  const hasDueDateChanged = previousTodo?.due_date !== todo.due_date
  const hasTitleChanged = previousTodo?.title !== todo.title

  if (hasDueDateChanged || hasTitleChanged || !previousTodo) {
    await notificationsService.deleteNotifications({
      userId,
      todoId: todo.id,
    })

    const dueDate = new Date(todo.due_date)
    const timeAgo = formatDistanceToNow(dueDate, { addSuffix: true })

    const notifications = [
      {
        todo_id: todo.id,
        notification_type: 'danger' as const,
        title: t('overdueTask'),
        message: t('expiredTaskMessage', { title: todo.title, timeAgo }),
        due_date: todo.due_date,
        origin_id: `danger-${todo.id}`,
      },
      {
        todo_id: todo.id,
        notification_type: 'warning' as const,
        title: t('deadlineApproaching'),
        message: t('upcomingDeadlineMessage', {
          title: todo.title,
          timeUntil: timeAgo,
        }),
        due_date: todo.due_date,
        origin_id: `warning-${todo.id}`,
      },
      {
        todo_id: todo.id,
        notification_type: 'info' as const,
        title: t('futureTask'),
        message: t('futureTaskMessage', {
          title: todo.title,
          timeUntil: timeAgo,
        }),
        due_date: todo.due_date,
        origin_id: `info-${todo.id}`,
      },
    ]

    await notificationsService.processNotifications(userId, notifications)
  }
}
