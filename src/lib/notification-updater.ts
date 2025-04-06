import { formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns'
import { Todo } from './api'

export interface NotificationUpdate {
  id: string
  notification_type: 'danger' | 'warning' | 'info'
  title: string
  message: string
  updated_at: string
}

const isServer = typeof window === 'undefined'

const notificationCache = new Map<
  string,
  { count: number; timestamp: number }
>()

/**
 * Processes and updates notifications based on current date and due dates
 * @returns Number of updated notifications
 */
export async function processDynamicNotificationUpdates(): Promise<number> {
  const cacheKey = 'notifications-update'
  const cachedResult = notificationCache.get(cacheKey)

  if (cachedResult && Date.now() - cachedResult.timestamp < 60000) {
    return cachedResult.count
  }

  if (!isServer) {
    console.error(
      'processDynamicNotificationUpdates can only be called on the server',
    )
    return 0
  }

  try {
    const { supabaseAdmin } = await import('./supabaseAdmin')
    const { getTranslations } = await import('next-intl/server')
    const t = await getTranslations('notificationsUpdater')

    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('todo_id, id, notification_type, title, message')
      .eq('dismissed', false)

    if (error) {
      console.error('Error fetching notifications for update:', error)
      return 0
    }

    if (!notifications || notifications.length === 0) {
      return 0
    }

    const todoIds = [...new Set(notifications.map((n) => n.todo_id))]
    const { data: todos, error: todosError } = await supabaseAdmin
      .from('todos')
      .select('id, title, due_date, is_completed')
      .in('id', todoIds)

    if (todosError) {
      console.error('Error fetching todos for notification update:', todosError)
      return 0
    }

    const todosMap = new Map()
    todos?.forEach((todo) => {
      todosMap.set(todo.id, todo)
    })

    const updates: NotificationUpdate[] = []
    const now = new Date()

    for (const notification of notifications) {
      const todo = todosMap.get(notification.todo_id)

      if (!todo || todo.is_completed) {
        if (todo?.is_completed) {
          await supabaseAdmin
            .from('notifications')
            .update({ dismissed: true })
            .eq('id', notification.id)
        }
        continue
      }

      if (!todo.due_date) continue

      const dueDate = new Date(todo.due_date)
      let newType = notification.notification_type as
        | 'danger'
        | 'warning'
        | 'info'
      let newTitle = notification.title
      let newMessage = notification.message
      let shouldUpdate = false

      if (isPast(dueDate) && !isToday(dueDate)) {
        if (notification.notification_type !== 'danger') {
          newType = 'danger'
          newTitle = t('overdueTask')
          shouldUpdate = true
        }

        const formattedTimeAgo = formatDistanceToNow(dueDate, {
          addSuffix: true,
        })
        const newMsg = t('expiredTaskMessage', {
          title: todo.title,
          timeAgo: formattedTimeAgo,
        })

        if (newMessage !== newMsg) {
          newMessage = newMsg
          shouldUpdate = true
        }
      } else if (isToday(dueDate)) {
        if (notification.notification_type !== 'danger') {
          newType = 'danger'
          newTitle = t('dueToday')
          shouldUpdate = true
        }

        const newMsg = t('dueTodayMessage', { title: todo.title })

        if (newMessage !== newMsg) {
          newMessage = newMsg
          shouldUpdate = true
        }
      } else if (isTomorrow(dueDate)) {
        if (notification.notification_type !== 'warning') {
          newType = 'warning'
          newTitle = t('dueTomorrow')
          shouldUpdate = true
        }

        const newMsg = t('dueTomorrowMessage', { title: todo.title })

        if (newMessage !== newMsg) {
          newMessage = newMsg
          shouldUpdate = true
        }
      } else {
        const daysDiff = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        )

        if (daysDiff <= 2) {
          if (notification.notification_type !== 'warning') {
            newType = 'warning'
            newTitle = t('deadlineApproaching')
            shouldUpdate = true
          }

          const formattedTimeUntil = formatDistanceToNow(dueDate, {
            addSuffix: true,
          })
          const newMsg = t('upcomingDeadlineMessage', {
            title: todo.title,
            timeUntil: formattedTimeUntil,
          })

          if (newMessage !== newMsg) {
            newMessage = newMsg
            shouldUpdate = true
          }
        } else if (daysDiff <= 7) {
          if (notification.notification_type !== 'info') {
            newType = 'info'
            newTitle = t('futureTask')
            shouldUpdate = true
          }

          const formattedTimeUntil = formatDistanceToNow(dueDate, {
            addSuffix: true,
          })
          const newMsg = t('futureTaskMessage', {
            title: todo.title,
            timeUntil: formattedTimeUntil,
          })

          if (newMessage !== newMsg) {
            newMessage = newMsg
            shouldUpdate = true
          }
        }
      }

      if (shouldUpdate) {
        updates.push({
          id: notification.id,
          notification_type: newType,
          title: newTitle,
          message: newMessage,
          updated_at: new Date().toISOString(),
        })
      }
    }

    if (updates.length > 0) {
      for (const update of updates) {
        await supabaseAdmin
          .from('notifications')
          .update({
            notification_type: update.notification_type,
            title: update.title,
            message: update.message,
            updated_at: update.updated_at,
          })
          .eq('id', update.id)
      }
    }

    await cleanupDuplicateNotifications()

    notificationCache.set(cacheKey, {
      count: updates.length,
      timestamp: Date.now(),
    })

    return updates.length
  } catch (error) {
    console.error('Error updating notifications dynamically:', error)
    return 0
  }
}

/**
 * Creates notifications for todos with approaching deadlines that don't have notifications yet
 * SERVER ONLY FUNCTION
 */
export async function createMissingNotifications(): Promise<number> {
  if (!isServer) {
    console.error('createMissingNotifications can only be called on the server')
    return 0
  }

  try {
    const { areNotificationsMutedForTodo } = await import(
      './notification-preferences'
    )

    const { supabaseAdmin } = await import('./supabaseAdmin')
    const { getTranslations } = await import('next-intl/server')
    const t = await getTranslations('notificationsUpdater')

    const { data: todos, error } = await supabaseAdmin
      .from('todos')
      .select('id, user_id, title, due_date')
      .eq('is_completed', false)
      .not('due_date', 'is', null)

    if (error) {
      console.error('Error fetching todos for notification creation:', error)
      return 0
    }

    if (!todos || todos.length === 0) {
      return 0
    }

    const todoIds = todos.map((todo) => todo.id)
    const { data: allNotifications, error: notificationError } =
      await supabaseAdmin
        .from('notifications')
        .select('todo_id, dismissed, notification_type')
        .in('todo_id', todoIds)

    if (notificationError) {
      console.error('Error fetching existing notifications:', notificationError)
      return 0
    }

    const notificationMap = new Map() // Map<todoId, notificationTypes[]>

    allNotifications?.forEach((notification) => {
      const todoId = notification.todo_id

      if (!notification.dismissed) {
        if (!notificationMap.has(todoId)) {
          notificationMap.set(todoId, [])
        }
        notificationMap.get(todoId).push(notification.notification_type)
      }
    })

    const newNotifications = []

    for (const todo of todos) {
      if (!todo.due_date) continue

      const dueDate = new Date(todo.due_date)
      const existingTypes = notificationMap.get(todo.id) || []
      const userId = todo.user_id

      const isMuted = await areNotificationsMutedForTodo(userId, todo.id)
      if (isMuted) {
        continue
      }

      if (existingTypes.length > 0) {
        continue
      }

      const daysDiff = Math.ceil(
        (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      )
      if (daysDiff > 7) continue

      let notificationType: 'danger' | 'warning' | 'info'
      let notificationTitle: string
      let notificationMessage: string

      if (isPast(dueDate) && !isToday(dueDate)) {
        // Overdue
        notificationType = 'danger'
        notificationTitle = t('overdueTask')
        notificationMessage = t('expiredTaskMessage', {
          title: todo.title,
          timeAgo: formatDistanceToNow(dueDate, { addSuffix: true }),
        })
      } else if (isToday(dueDate)) {
        // Due today
        notificationType = 'danger'
        notificationTitle = t('dueToday')
        notificationMessage = t('dueTodayMessage', { title: todo.title })
      } else if (isTomorrow(dueDate)) {
        // Due tomorrow
        notificationType = 'warning'
        notificationTitle = t('dueTomorrow')
        notificationMessage = t('dueTomorrowMessage', { title: todo.title })
      } else if (daysDiff <= 2) {
        // Due in 2 days
        notificationType = 'warning'
        notificationTitle = t('deadlineApproaching')
        notificationMessage = t('upcomingDeadlineMessage', {
          title: todo.title,
          timeUntil: formatDistanceToNow(dueDate, { addSuffix: true }),
        })
      } else if (daysDiff <= 7) {
        // Due within a week
        notificationType = 'info'
        notificationTitle = t('futureTask')
        notificationMessage = t('futureTaskMessage', {
          title: todo.title,
          timeUntil: formatDistanceToNow(dueDate, { addSuffix: true }),
        })
      } else {
        continue
      }

      newNotifications.push({
        user_id: userId,
        todo_id: todo.id,
        notification_type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        due_date: todo.due_date,
        read: false,
        dismissed: false,
        origin_id: `${notificationType}-${todo.id}-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    if (newNotifications.length > 0) {
      const batchSize = 10
      for (let i = 0; i < newNotifications.length; i += batchSize) {
        const batch = newNotifications.slice(i, i + batchSize)
        await supabaseAdmin.from('notifications').insert(batch)
      }
    }

    return newNotifications.length
  } catch (error) {
    console.error('Error creating missing notifications:', error)
    return 0
  }
}

/**
 * Updates notification messages based on current due date status
 * SERVER ONLY FUNCTION
 */
export async function updateNotificationMessages(todo: Todo): Promise<void> {
  if (!isServer) {
    console.error('updateNotificationMessages can only be called on the server')
    return
  }

  if (!todo.due_date) return

  try {
    const { supabaseAdmin } = await import('./supabaseAdmin')
    const { getTranslations } = await import('next-intl/server')
    const t = await getTranslations('notificationsUpdater')

    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('todo_id', todo.id)
      .eq('dismissed', false)

    if (error) {
      console.error('Error fetching notifications for update:', error)
      return
    }

    if (!notifications || notifications.length === 0) return

    const updates = []
    const dueDate = new Date(todo.due_date)
    const daysDiff = Math.ceil(
      (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    )

    for (const notification of notifications) {
      let shouldUpdate = false
      let updatedNotificationType = notification.notification_type
      let updatedTitle = notification.title
      let updatedMessage = notification.message

      // Determine the correct notification type, title and message based on due date
      if (isPast(dueDate) && !isToday(dueDate)) {
        // Overdue task
        if (notification.notification_type !== 'danger') {
          updatedNotificationType = 'danger'
          shouldUpdate = true
        }

        updatedTitle = t('overdueTask')
        updatedMessage = t('expiredTaskMessage', {
          title: todo.title,
          timeAgo: formatDistanceToNow(dueDate, { addSuffix: true }),
        })
        shouldUpdate = true
      } else if (isToday(dueDate)) {
        // Due today
        if (notification.notification_type !== 'danger') {
          updatedNotificationType = 'danger'
          shouldUpdate = true
        }

        updatedTitle = t('dueToday')
        updatedMessage = t('dueTodayMessage', { title: todo.title })
        shouldUpdate = true
      } else if (isTomorrow(dueDate)) {
        // Due tomorrow
        if (notification.notification_type !== 'warning') {
          updatedNotificationType = 'warning'
          shouldUpdate = true
        }

        updatedTitle = t('dueTomorrow')
        updatedMessage = t('dueTomorrowMessage', { title: todo.title })
        shouldUpdate = true
      } else if (daysDiff <= 2) {
        // Due in 2 days
        if (notification.notification_type !== 'warning') {
          updatedNotificationType = 'warning'
          shouldUpdate = true
        }

        updatedTitle = t('deadlineApproaching')
        updatedMessage = t('upcomingDeadlineMessage', {
          title: todo.title,
          timeUntil: formatDistanceToNow(dueDate, { addSuffix: true }),
        })
        shouldUpdate = true
      } else if (daysDiff <= 7) {
        // Due within a week
        if (notification.notification_type !== 'info') {
          updatedNotificationType = 'info'
          shouldUpdate = true
        }

        updatedTitle = t('futureTask')
        updatedMessage = t('futureTaskMessage', {
          title: todo.title,
          timeUntil: formatDistanceToNow(dueDate, { addSuffix: true }),
        })
        shouldUpdate = true
      }

      if (shouldUpdate) {
        updates.push({
          id: notification.id,
          message: updatedMessage,
          title: updatedTitle,
          notification_type: updatedNotificationType,
          updated_at: new Date().toISOString(),
        })
      }
    }

    for (const update of updates) {
      await supabaseAdmin
        .from('notifications')
        .update({
          message: update.message,
          title: update.title,
          notification_type: update.notification_type,
          updated_at: update.updated_at,
        })
        .eq('id', update.id)
    }
  } catch (error) {
    console.error('Error updating notification messages:', error)
  }
}

/**
 * Remove duplicate notifications for the same todo and type
 * SERVER ONLY FUNCTION
 */
export async function cleanupDuplicateNotifications(): Promise<number> {
  if (!isServer) {
    console.error(
      'cleanupDuplicateNotifications can only be called on the server',
    )
    return 0
  }

  try {
    const { supabaseAdmin } = await import('./supabaseAdmin')

    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('notification_type, user_id, todo_id')
      .eq('dismissed', false)

    if (error || !notifications || notifications.length === 0) {
      return 0
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notificationGroups = new Map<string, any[]>()

    notifications.forEach((notification) => {
      const key = `${notification.user_id}:${notification.todo_id}:${notification.notification_type}`
      if (!notificationGroups.has(key)) {
        notificationGroups.set(key, [])
      }
      notificationGroups.get(key)?.push(notification)
    })

    let removedCount = 0

    for (const [, group] of notificationGroups.entries()) {
      if (group.length <= 1) continue

      const sortedGroup = [...group].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )

      const toDelete = sortedGroup.slice(1)

      if (toDelete.length > 0) {
        const idsToDelete = toDelete.map((n) => n.id)

        const { error, count } = await supabaseAdmin
          .from('notifications')
          .delete()
          .in('id', idsToDelete)

        if (!error && count) {
          removedCount += count
        }
      }
    }

    return removedCount
  } catch (error) {
    console.error('Error cleaning up duplicate notifications:', error)
    return 0
  }
}

/**
 * Manually mark all notifications for a todo as dismissed with a "do not recreate" flag
 * This is used when a user explicitly dismisses all notifications for a task
 * SERVER ONLY FUNCTION
 */
export async function permanentlyDismissTodoNotifications(
  todoId: string,
  userId: string,
): Promise<boolean> {
  if (!isServer) {
    console.error(
      'permanentlyDismissTodoNotifications can only be called on the server',
    )
    return false
  }

  try {
    const { supabaseAdmin } = await import('./supabaseAdmin')

    const { data: activeNotifications, error: fetchError } = await supabaseAdmin
      .from('notifications')
      .select('id, origin_id, notification_type')
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .eq('dismissed', false)

    if (fetchError) {
      console.error('Error fetching notifications to dismiss:', fetchError)
      return false
    }

    let success = true

    for (const notification of activeNotifications || []) {
      const type =
        notification.notification_type || notification.origin_id.split('-')[0]

      const validType = ['danger', 'warning', 'info'].includes(type)
        ? type
        : 'info'

      const newOriginId = `${validType}-${todoId}-${Date.now()}-donotrecreate`

      const { error } = await supabaseAdmin
        .from('notifications')
        .update({
          dismissed: true,
          updated_at: new Date().toISOString(),
          origin_id: newOriginId,
        })
        .eq('id', notification.id)

      if (error) {
        console.error(`Error updating notification ${notification.id}:`, error)
        success = false
      }
    }

    return success
  } catch (error) {
    console.error('Error permanently dismissing notifications:', error)
    return false
  }
}
