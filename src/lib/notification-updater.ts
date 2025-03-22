// src/lib/notification-updater.ts
import { formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns'
import { Todo } from './api'

export interface NotificationUpdate {
  id: string
  notification_type: 'danger' | 'warning' | 'info'
  title: string
  message: string
  updated_at: string
}

/**
 * Client-side function to refresh notifications before displaying them
 * Can be called from the frontend during user interaction
 */
export async function refreshNotificationsClient(): Promise<void> {
  try {
    await fetch('/api/notifications/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error refreshing notifications:', error)
  }
}

// Esta linha verifica se o código está rodando no servidor
// Se não for o servidor, as funções abaixo exportarão versões que lançam erro
const isServer = typeof window === 'undefined'

// Tempo mínimo (em horas) que deve passar antes de recriar uma notificação para uma tarefa
// após o usuário excluir uma notificação para aquela tarefa
const RECREATION_COOLDOWN_HOURS = 24

/**
 * SERVER-ONLY FUNCTIONS BELOW
 * These functions must only be imported in server components or API routes
 */

/**
 * Processes and updates notifications based on current date and due dates
 * @returns Number of updated notifications
 */
export async function processDynamicNotificationUpdates(): Promise<number> {
  // Retornar 0 ou lançar erro se não estiver no servidor
  if (!isServer) {
    console.error(
      'processDynamicNotificationUpdates can only be called on the server',
    )
    return 0
  }

  try {
    // Importa supabaseAdmin dinamicamente para evitar erros no cliente
    const { supabaseAdmin } = await import('./supabaseAdmin')

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
      let newType = notification.notification_type
      let newTitle = notification.title
      let newMessage = notification.message
      let shouldUpdate = false

      // Determine the correct notification type and message based on the due date
      if (isPast(dueDate) && !isToday(dueDate)) {
        // Due date has passed
        if (notification.notification_type !== 'danger') {
          newType = 'danger'
          newTitle = 'Tarefa Atrasada'
          shouldUpdate = true
        }

        const formattedTimeAgo = formatDistanceToNow(dueDate, {
          addSuffix: true,
        })
        const newMsg = `"${todo.title}" venceu ${formattedTimeAgo}`

        if (newMessage !== newMsg) {
          newMessage = newMsg
          shouldUpdate = true
        }
      } else if (isToday(dueDate)) {
        // Due today
        if (notification.notification_type !== 'danger') {
          newType = 'danger'
          newTitle = 'Vence Hoje'
          shouldUpdate = true
        }

        const newMsg = `"${todo.title}" vence hoje!`

        if (newMessage !== newMsg) {
          newMessage = newMsg
          shouldUpdate = true
        }
      } else if (isTomorrow(dueDate)) {
        // Due tomorrow
        if (notification.notification_type !== 'warning') {
          newType = 'warning'
          newTitle = 'Vence Amanhã'
          shouldUpdate = true
        }

        const newMsg = `"${todo.title}" vence amanhã`

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
            newTitle = 'Prazo se Aproximando'
            shouldUpdate = true
          }

          const formattedTimeUntil = formatDistanceToNow(dueDate, {
            addSuffix: true,
          })
          const newMsg = `"${todo.title}" vence ${formattedTimeUntil}`

          if (newMessage !== newMsg) {
            newMessage = newMsg
            shouldUpdate = true
          }
        } else if (daysDiff <= 7) {
          // Due in a week or less
          if (notification.notification_type !== 'info') {
            newType = 'info'
            newTitle = 'Tarefa Futura'
            shouldUpdate = true
          }

          const formattedTimeUntil = formatDistanceToNow(dueDate, {
            addSuffix: true,
          })
          const newMsg = `"${todo.title}" vence ${formattedTimeUntil}`

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

    // Limpar notificações duplicadas
    await cleanupDuplicateNotifications()

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
    // Importa supabaseAdmin dinamicamente para evitar erros no cliente
    const { supabaseAdmin } = await import('./supabaseAdmin')

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

    // Create maps for active and recently dismissed notifications
    const notificationMap = new Map()
    const recentlyDismissedMap = new Map()
    const now = new Date()

    allNotifications?.forEach((notification) => {
      const todoId = notification.todo_id

      if (!notification.dismissed) {
        // Active notification
        if (!notificationMap.has(todoId)) {
          notificationMap.set(todoId, [])
        }
        notificationMap.get(todoId).push(notification.notification_type)
      } else {
        // Dismissed notification - check if it was dismissed recently
        const dismissedAt = new Date(notification.updated_at)
        const hoursSinceDismissal =
          (now.getTime() - dismissedAt.getTime()) / (1000 * 60 * 60)

        if (hoursSinceDismissal < RECREATION_COOLDOWN_HOURS) {
          if (!recentlyDismissedMap.has(todoId)) {
            recentlyDismissedMap.set(todoId, true)
          }
        }
      }
    })

    const newNotifications = []

    for (const todo of todos) {
      const dueDate = new Date(todo.due_date)
      const existingTypes = notificationMap.get(todo.id) || []

      // Skip if the due date is more than 7 days away
      const daysDiff = Math.ceil(
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      )
      if (daysDiff > 7) continue

      // Skip if notifications for this todo were recently dismissed by the user
      if (recentlyDismissedMap.has(todo.id)) {
        continue
      }

      // Skip if this todo already has at least one active notification
      // This prevents creating multiple notification types for the same todo
      if (existingTypes.length > 0) {
        continue
      }

      // At this point, we'll create just ONE notification for the todo based on its due date status
      let notification = null

      if (isPast(dueDate) && !isToday(dueDate)) {
        // Overdue
        notification = {
          notification_type: 'danger',
          title: 'Tarefa Atrasada',
          message: `"${todo.title}" venceu ${formatDistanceToNow(dueDate, { addSuffix: true })}`,
          origin_id: `danger-${todo.id}-${Date.now()}`,
        }
      } else if (isToday(dueDate)) {
        // Due today
        notification = {
          notification_type: 'danger',
          title: 'Vence Hoje',
          message: `"${todo.title}" vence hoje!`,
          origin_id: `danger-${todo.id}-${Date.now()}`,
        }
      } else if (isTomorrow(dueDate)) {
        // Due tomorrow
        notification = {
          notification_type: 'warning',
          title: 'Vence Amanhã',
          message: `"${todo.title}" vence amanhã`,
          origin_id: `warning-${todo.id}-${Date.now()}`,
        }
      } else if (daysDiff <= 2) {
        // Due in 2 days
        notification = {
          notification_type: 'warning',
          title: 'Prazo se Aproximando',
          message: `"${todo.title}" vence ${formatDistanceToNow(dueDate, { addSuffix: true })}`,
          origin_id: `warning-${todo.id}-${Date.now()}`,
        }
      } else if (daysDiff <= 7) {
        // Due within a week
        notification = {
          notification_type: 'info',
          title: 'Tarefa Futura',
          message: `"${todo.title}" vence ${formatDistanceToNow(dueDate, { addSuffix: true })}`,
          origin_id: `info-${todo.id}-${Date.now()}`,
        }
      }

      // Add notification to creation list if needed
      if (notification) {
        newNotifications.push({
          user_id: todo.user_id,
          todo_id: todo.id,
          notification_type: notification.notification_type,
          title: notification.title,
          message: notification.message,
          due_date: todo.due_date,
          read: false,
          dismissed: false,
          origin_id: notification.origin_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
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
    // Importa supabaseAdmin dinamicamente para evitar erros no cliente
    const { supabaseAdmin } = await import('./supabaseAdmin')

    if (todo.is_completed) {
      // If task is completed, dismiss all notifications
      await supabaseAdmin
        .from('notifications')
        .update({ dismissed: true })
        .eq('todo_id', todo.id)
        .eq('dismissed', false)
      return
    }

    if (!todo.due_date) {
      // If task has no due date, dismiss all notifications
      await supabaseAdmin
        .from('notifications')
        .update({ dismissed: true })
        .eq('todo_id', todo.id)
        .eq('dismissed', false)
      return
    }

    // Get all active notifications for this todo
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
      return
    }

    const dueDate = new Date(todo.due_date)
    const updates = []

    for (const notification of notifications) {
      let newMessage = ''

      if (isPast(dueDate) && !isToday(dueDate)) {
        newMessage = `"${todo.title}" venceu ${formatDistanceToNow(dueDate, { addSuffix: true })}`
      } else if (isToday(dueDate)) {
        newMessage = `"${todo.title}" vence hoje!`
      } else if (isTomorrow(dueDate)) {
        newMessage = `"${todo.title}" vence amanhã`
      } else {
        newMessage = `"${todo.title}" vence ${formatDistanceToNow(dueDate, { addSuffix: true })}`
      }

      if (newMessage !== notification.message) {
        updates.push({
          id: notification.id,
          message: newMessage,
          updated_at: new Date().toISOString(),
        })
      }
    }

    // Update messages in batch
    for (const update of updates) {
      await supabaseAdmin
        .from('notifications')
        .update({
          message: update.message,
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
    // Importa supabaseAdmin dinamicamente para evitar erros no cliente
    const { supabaseAdmin } = await import('./supabaseAdmin')

    // Get all active notifications
    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('dismissed', false)
      .order('created_at', { ascending: false })

    if (error || !notifications || notifications.length === 0) {
      return 0
    }

    // Group notifications by todo_id and notification_type
    const notificationGroups = new Map()

    notifications.forEach((notification) => {
      const groupKey = `${notification.todo_id}_${notification.notification_type}`
      if (!notificationGroups.has(groupKey)) {
        notificationGroups.set(groupKey, [])
      }
      notificationGroups.get(groupKey).push(notification)
    })

    let removedCount = 0

    // For each group, keep only the most recently updated notification
    for (const group of notificationGroups.values()) {
      if (group.length <= 1) continue

      // Sort by updated_at descending
      const sortedGroup = [...group].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )

      // Keep the first one (most recent), dismiss the rest
      const toRemove = sortedGroup.slice(1)

      if (toRemove.length > 0) {
        const idsToRemove = toRemove.map((n) => n.id)

        const { error, count } = await supabaseAdmin
          .from('notifications')
          .update({ dismissed: true, updated_at: new Date().toISOString() })
          .in('id', idsToRemove)

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
    // Import supabaseAdmin dynamically to avoid errors on client
    const { supabaseAdmin } = await import('./supabaseAdmin')

    // Mark all notifications as dismissed
    const { data: activeNotifications, error: fetchError } = await supabaseAdmin
      .from('notifications')
      .select('id, origin_id')
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
      const newOriginId = `${notification.origin_id}-donotrecreate`

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
