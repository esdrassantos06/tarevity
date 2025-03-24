import { supabaseAdmin } from './supabaseAdmin'
import { parseISO, differenceInDays, isBefore, isSameDay, formatDistanceToNow } from 'date-fns'

export interface Notification {
  id: string
  todo_id: string
  title: string
  message: string
  notification_type: 'warning' | 'danger' | 'info'
  due_date: string
  read: boolean
  dismissed: boolean
  origin_id: string
  created_at: string
  updated_at: string
  user_id: string
}

interface NotificationRequest {
  todo_id: string
  title: string
  message: string
  notification_type: 'warning' | 'danger' | 'info'
  due_date: string
  origin_id: string
}

export const notificationsService = {
  /**
   * Get all active notifications for a user
   */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('dismissed', false)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch {
      return []
    }
  },

  /**
   * Mark notification as read/unread
   */
  async updateReadStatus({
    id,
    userId,
    all = false,
    markAsUnread = false,
  }: {
    id?: string
    userId: string
    all?: boolean
    markAsUnread?: boolean
  }) {
    try {
      if (all) {
        const { data, error } = await supabaseAdmin
          .from('notifications')
          .update({ read: !markAsUnread })
          .eq('user_id', userId)
          .eq('dismissed', false)
          .select()

        if (error) throw error
        return { success: true, count: data?.length || 0 }
      } else if (id) {
        const { data, error } = await supabaseAdmin
          .from('notifications')
          .update({ read: !markAsUnread })
          .eq('id', id)
          .eq('user_id', userId)
          .select()

        if (error) throw error
        return { success: true, notification: data?.[0] }
      }
      return { success: false, message: 'Invalid parameters' }
    } catch (error) {
      throw error
    }
  },

  /**
   * Delete a notification or all notifications
   */
  async deleteNotifications({
    id,
    userId,
    all = false,
    todoId,
  }: {
    id?: string
    userId: string
    all?: boolean
    todoId?: string
  }) {
    try {
      if (id) {
        const { error } = await supabaseAdmin
          .from('notifications')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) throw error
        return { success: true }
      } else if (todoId) {
        const { error, count } = await supabaseAdmin
          .from('notifications')
          .delete()
          .eq('user_id', userId)
          .eq('todo_id', todoId)

        if (error) throw error
        return { success: true, count }
      } else if (all) {
        const { error, count } = await supabaseAdmin
          .from('notifications')
          .delete()
          .eq('user_id', userId)

        if (error) throw error
        return { success: true, count }
      }
      return { success: false, message: 'Invalid parameters' }
    } catch (error) {
      throw error
    }
  },

  /**
   * Mark notifications for a todo as dismissed
   */
  async dismissTodoNotifications(userId: string, todoId: string) {
    try {
      const { error, count } = await supabaseAdmin
        .from('notifications')
        .update({ dismissed: true })
        .eq('user_id', userId)
        .eq('todo_id', todoId)

      if (error) throw error
      return { success: true, count: count || 0 }
    } catch (error) {
      throw error
    }
  },

  /**
   * Create or update notifications for a todo based on due date
   */
  async processNotifications(
    userId: string,
    notifications: NotificationRequest[],
  ) {
    const results = []

    for (const notification of notifications) {
      if (
        !notification.title ||
        !notification.message ||
        !notification.notification_type ||
        !notification.origin_id
      ) {
        results.push({
          status: 'error',
          error: 'Missing required notification fields',
        })
        continue
      }

      if (
        !['danger', 'warning', 'info'].includes(notification.notification_type)
      ) {
        results.push({
          status: 'error',
          error: 'Invalid notification type',
        })
        continue
      }

      try {
        const { data: existingNotifications, error: findError } =
          await supabaseAdmin
            .from('notifications')
            .select('id, dismissed, read')
            .eq('user_id', userId)
            .eq('origin_id', notification.origin_id)

        if (findError && findError.code !== 'PGRST116') {
          throw findError
        }

        const existingNotification =
          existingNotifications && existingNotifications.length > 0
            ? existingNotifications[0]
            : null

        const shouldShow = this.shouldShowNotification(
          notification.notification_type,
          notification.due_date,
        )

        if (existingNotification) {
          if (shouldShow) {
            const { data, error } = await supabaseAdmin
              .from('notifications')
              .update({
                title: notification.title,
                message: notification.message,
                due_date: notification.due_date,
                dismissed: false,
                // Update the updated_at timestamp to ensure it appears at the top
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingNotification.id)
              .select()

            if (error) {
              results.push({ status: 'error', error })
            } else {
              results.push({ status: 'updated', notification: data?.[0] })
            }
          } else {
            results.push({
              status: 'skipped',
              message: 'Not relevant based on due date',
            })
          }
        } else if (shouldShow) {
          const newNotification = {
            ...notification,
            user_id: userId,
            read: false,
            dismissed: false,
          }

          const { data, error } = await supabaseAdmin
            .from('notifications')
            .insert([newNotification])
            .select()

          if (error) {
            results.push({ status: 'error', error })
          } else {
            results.push({ status: 'created', notification: data?.[0] })
          }
        } else {
          results.push({
            status: 'skipped',
            message: 'Not relevant based on due date',
          })
        }
      } catch (error) {
        results.push({ status: 'error', error })
      }
    }
    return results
  },

  /**
   * Determines if a notification should be shown based on its type and due date
   * Enhanced to be more precise and with better date handling
   */
  shouldShowNotification(type: string, dueDateString: string | null): boolean {
    if (!dueDateString) return false

    try {
      let dueDate: Date
      try {
        dueDate = parseISO(dueDateString)

        if (isNaN(dueDate.getTime())) {
          return false
        }
      } catch {
        return false
      }

      const now = new Date()
      now.setHours(0, 0, 0, 0)

      const dueDay = new Date(dueDate)
      dueDay.setHours(0, 0, 0, 0)

      const diffDays = differenceInDays(dueDay, now)
      const isPast = isBefore(dueDay, now)
      const isToday = isSameDay(dueDay, now)

      switch (type) {
        case 'danger':
          return isPast || isToday // Show for overdue or due today
        case 'warning':
          return isToday || diffDays === 1 // Show for due today or tomorrow
        case 'info':
          return diffDays >= 2 && diffDays <= 4 // Show for 2-4 days ahead
        default:
          return false
      }
    } catch {
      return false
    }
  },

  /**
   * Generate notifications for a todo with updated time-sensitive messaging
   */
  generateTodoNotifications(todo: {
    id: string
    title: string
    due_date: string | null
    is_completed: boolean
  }) {
    if (todo.is_completed || !todo.due_date) {
      return []
    }

    try {
      const dueDate = parseISO(todo.due_date)
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      
      const dueDay = new Date(dueDate)
      dueDay.setHours(0, 0, 0, 0)
      
      const isPast = isBefore(dueDay, now)
      const isToday = isSameDay(dueDay, now)
      const diffDays = differenceInDays(dueDay, now)
      
      const notifications: NotificationRequest[] = []
      
      // Past due or due today
      if (isPast || isToday) {
        const message = isPast 
          ? `"${todo.title}" is overdue by ${formatDistanceToNow(dueDate)}`
          : `"${todo.title}" is due today`
        
        notifications.push({
          todo_id: todo.id,
          notification_type: 'danger',
          title: 'Overdue Task',
          message,
          due_date: todo.due_date,
          origin_id: `danger-${todo.id}`,
        })
      }
      
      // Due tomorrow
      if (diffDays === 1) {
        notifications.push({
          todo_id: todo.id,
          notification_type: 'warning',
          title: 'Due Soon',
          message: `"${todo.title}" is due tomorrow`,
          due_date: todo.due_date,
          origin_id: `warning-${todo.id}`,
        })
      }
      
      // Due in 2-4 days
      if (diffDays >= 2 && diffDays <= 4) {
        notifications.push({
          todo_id: todo.id,
          notification_type: 'info',
          title: 'Upcoming Deadline',
          message: `"${todo.title}" is due in ${diffDays} days`,
          due_date: todo.due_date,
          origin_id: `info-${todo.id}`,
        })
      }
      
      return notifications
    } catch (error) {
      console.error('Error generating todo notifications:', error)
      return []
    }
  },
  
  /**
   * New method: Updates all notifications for a user based on current dates
   */
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async refreshUserNotifications(userId: string, todos: any[]) {
    try {
      
      // For each todo with a due date, generate fresh notifications
      const allNotifications = []
      
      for (const todo of todos) {
        if (!todo.is_completed && todo.due_date) {
          const notifications = this.generateTodoNotifications(todo)
          allNotifications.push(...notifications)
        }
      }
      
      if (allNotifications.length > 0) {
        return await this.processNotifications(userId, allNotifications)
      }
      
      return []
    } catch (error) {
      console.error('Error refreshing notifications:', error)
      return []
    }
  }
}