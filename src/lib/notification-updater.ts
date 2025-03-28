import { formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns'
import { Todo } from './api'

export interface NotificationUpdate {
  id: string
  notification_type: 'danger' | 'warning' | 'info'
  title: string
  message: string
  updated_at: string
}

// This line checks if the code is running on the server
// If it is not the server, the functions below will export versions that throw errors
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

  // Return 0 or throw error if not on the server
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

    // Fetch all non-dismissed notifications with due dates
    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('dismissed', false)

    if (error) {
      console.error('Error fetching notifications for update:', error)
      return 0
    }

    if (!notifications || notifications.length === 0) {
      return 0
    }

    // Fetch corresponding todo data to ensure accurate information
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

      // Skip if todo doesn't exist anymore or is completed
      if (!todo || todo.is_completed) {
        // Mark notification as dismissed if todo is completed
        if (todo?.is_completed) {
          await supabaseAdmin
            .from('notifications')
            .update({ dismissed: true })
            .eq('id', notification.id)
        }
        continue
      }

      // Skip if due date doesn't exist
      if (!todo.due_date) continue

      const dueDate = new Date(todo.due_date)
      let newType = notification.notification_type as
        | 'danger'
        | 'warning'
        | 'info'
      let newTitle = notification.title
      let newMessage = notification.message
      let shouldUpdate = false

      // Determine the correct notification type and message based on the due date
      if (isPast(dueDate) && !isToday(dueDate)) {
        // Due date has passed
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
        // Due today
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
        // Due tomorrow
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
        // Due in the future
        const daysDiff = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        )

        if (daysDiff <= 2) {
          // Due in 2 days or less
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
          // Due in a week or less
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

    // Batch update notifications
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

    // Clear duplicate notifications
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
    // Import preference check function
    const { areNotificationsMutedForTodo } = await import(
      './notification-preferences'
    )

    // Import supabaseAdmin dynamically to avoid client errors
    const { supabaseAdmin } = await import('./supabaseAdmin')
    // Import getTranslations from next-intl
    const { getTranslations } = await import('next-intl/server')
    const t = await getTranslations('notificationsUpdater')

    // Get all incomplete todos with due dates
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

    // Get ALL notifications (active and dismissed) to avoid recreating recently dismissed ones
    const todoIds = todos.map((todo) => todo.id)
    const { data: allNotifications, error: notificationError } =
      await supabaseAdmin
        .from('notifications')
        .select('*')
        .in('todo_id', todoIds)

    if (notificationError) {
      console.error('Error fetching existing notifications:', notificationError)
      return 0
    }

    // Create map for active notifications
    const notificationMap = new Map() // Map<todoId, notificationTypes[]>

    allNotifications?.forEach((notification) => {
      const todoId = notification.todo_id

      if (!notification.dismissed) {
        // Active notification
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

      // IMPORTANT: Check if notifications are muted for this task
      const isMuted = await areNotificationsMutedForTodo(userId, todo.id)
      if (isMuted) {
        // Skip this task if it's muted
        continue
      }

      // Skip if this todo already has notifications
      if (existingTypes.length > 0) {
        continue
      }

      // Skip if the due date is more than 7 days away
      const daysDiff = Math.ceil(
        (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      )
      if (daysDiff > 7) continue

      // Create just ONE notification for the todo based on its due date status
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
        // More than 7 days, skip
        continue
      }

      // Add notification to creation list
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

    // Insert new notifications in batches
    if (newNotifications.length > 0) {
      // Process in batches of 10 to avoid potential size limitations
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

  try {
    const { supabaseAdmin } = await import('./supabaseAdmin')
    const { getTranslations } = await import('next-intl/server')
    const t = await getTranslations('notificationsUpdater')

    if (todo.is_completed) {
      await supabaseAdmin
        .from('notifications')
        .update({ dismissed: true })
        .eq('todo_id', todo.id)
        .eq('dismissed', false)
      return
    }

    // If there's no due date, nothing to do
    if (!todo.due_date) return

    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('todo_id', todo.id)
      .eq('dismissed', false)

    if (error) {
      console.error('Error fetching notifications for message update:', error)
      return
    }

    if (!notifications || notifications.length === 0) {
      // Only try to create a notification if due_date exists
      if (todo.due_date) {
        const newNotification = await generateNewNotification(todo)
        if (newNotification) {
          await supabaseAdmin.from('notifications').insert(newNotification)
        }
      }
      return
    }

    const dueDate = new Date(todo.due_date)
    const updates = []

    for (const notification of notifications) {
      let newMessage = ''
      let newTitle = ''
      let newType: 'danger' | 'warning' | 'info' =
        notification.notification_type

      if (isPast(dueDate) && !isToday(dueDate)) {
        newMessage = t('expiredTaskMessage', {
          title: todo.title,
          timeAgo: formatDistanceToNow(dueDate, { addSuffix: true }),
        })
        newTitle = t('overdueTask')
        newType = 'danger'
      } else if (isToday(dueDate)) {
        newMessage = t('dueTodayMessage', { title: todo.title })
        newTitle = t('dueToday')
        newType = 'danger'
      } else if (isTomorrow(dueDate)) {
        newMessage = t('dueTomorrowMessage', { title: todo.title })
        newTitle = t('dueTomorrow')
        newType = 'warning'
      } else {
        const daysDiff = Math.ceil(
          (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        )

        if (daysDiff <= 2) {
          newMessage = t('upcomingDeadlineMessage', {
            title: todo.title,
            timeUntil: formatDistanceToNow(dueDate, { addSuffix: true }),
          })
          newTitle = t('deadlineApproaching')
          newType = 'warning'
        } else if (daysDiff <= 7) {
          newMessage = t('futureTaskMessage', {
            title: todo.title,
            timeUntil: formatDistanceToNow(dueDate, { addSuffix: true }),
          })
          newTitle = t('futureTask')
          newType = 'info'
        }
      }

      updates.push({
        id: notification.id,
        message: newMessage,
        title: newTitle,
        notification_type: newType,
        updated_at: new Date().toISOString(),
      })
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

async function generateNewNotification(todo: Todo) {
  if (!todo.due_date) return null

  // Import getTranslations from next-intl
  const { getTranslations } = await import('next-intl/server')
  const t = await getTranslations('notificationsUpdater')

  const dueDate = new Date(todo.due_date)
  let notificationType: 'danger' | 'warning' | 'info'
  let notificationTitle: string
  let notificationMessage: string

  if (isPast(dueDate) && !isToday(dueDate)) {
    notificationType = 'danger'
    notificationTitle = t('overdueTask')
    notificationMessage = t('expiredTaskMessage', {
      title: todo.title,
      timeAgo: formatDistanceToNow(dueDate, { addSuffix: true }),
    })
  } else if (isToday(dueDate)) {
    notificationType = 'danger'
    notificationTitle = t('dueToday')
    notificationMessage = t('dueTodayMessage', { title: todo.title })
  } else if (isTomorrow(dueDate)) {
    notificationType = 'warning'
    notificationTitle = t('dueTomorrow')
    notificationMessage = t('dueTomorrowMessage', { title: todo.title })
  } else {
    const daysDiff = Math.ceil(
      (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    )

    if (daysDiff <= 2) {
      notificationType = 'warning'
      notificationTitle = t('deadlineApproaching')
      notificationMessage = t('upcomingDeadlineMessage', {
        title: todo.title,
        timeUntil: formatDistanceToNow(dueDate, { addSuffix: true }),
      })
    } else if (daysDiff <= 7) {
      notificationType = 'info'
      notificationTitle = t('futureTask')
      notificationMessage = t('futureTaskMessage', {
        title: todo.title,
        timeUntil: formatDistanceToNow(dueDate, { addSuffix: true }),
      })
    } else {
      return null
    }
  }

  return {
    todo_id: todo.id,
    user_id: todo.user_id,
    notification_type: notificationType,
    title: notificationTitle,
    message: notificationMessage,
    due_date: todo.due_date,
    read: false,
    dismissed: false,
    origin_id: `${notificationType}-${todo.id}-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    // Dynamically import supabaseAdmin to avoid client-side errors
    const { supabaseAdmin } = await import('./supabaseAdmin')

    // Get all active notifications
    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('dismissed', false)

    if (error || !notifications || notifications.length === 0) {
      return 0
    }

    // Group by user_id, todo_id, and notification_type to find duplicates

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

    // For each group, keep only the most recently updated notification
    for (const [key, group] of notificationGroups.entries()) {
      if (group.length <= 1) continue

      // Sort by updated_at descending (newest first)
      const sortedGroup = [...group].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )

      // Keep the first one (most recent), delete the rest
      const toDelete = sortedGroup.slice(1)

      if (toDelete.length > 0) {
        const idsToDelete = toDelete.map((n) => n.id)

        // DELETE the duplicates (not just mark as dismissed)
        const { error, count } = await supabaseAdmin
          .from('notifications')
          .delete()
          .in('id', idsToDelete)

        if (!error && count) {
          removedCount += count
          console.log(`Deleted ${count} duplicate notifications for key ${key}`)
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
    // Import supabaseAdmin dynamically to avoid errors on client
    const { supabaseAdmin } = await import('./supabaseAdmin')

    // Mark all notifications as dismissed
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

    // For every notification, we update individually with a flag on origin_id
    let success = true

    for (const notification of activeNotifications || []) {
      // Create a "do not recreate" flag in the origin_id
      // Extract the type from the origin_id or use the notification_type
      const type =
        notification.notification_type || notification.origin_id.split('-')[0]

      // Make sure the type is valid
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
