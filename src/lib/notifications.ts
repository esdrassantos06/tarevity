import { supabaseAdmin } from './supabaseAdmin'
import { parseISO, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns'

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
   * Formats a more human-friendly message based on due date
   */
  formatNotificationMessage(title: string, dueDate: Date): string {
    if (isPast(dueDate) && !isToday(dueDate)) {
      return `"${title}" was due ${formatDistanceToNow(dueDate, { addSuffix: true })}`
    } else if (isToday(dueDate)) {
      return `"${title}" is due today!`
    } else if (isTomorrow(dueDate)) {
      return `"${title}" is due tomorrow`  
    } else {
      return `"${title}" is due ${formatDistanceToNow(dueDate, { addSuffix: true })}`
    }
  },

  /**
   * Determines the appropriate notification type based on due date
   */
  getNotificationTypeFromDueDate(dueDate: Date): 'danger' | 'warning' | 'info' {
    const now = new Date()
    
    if (isPast(dueDate) || isToday(dueDate)) {
      return 'danger'
    }
    
    if (isTomorrow(dueDate)) {
      return 'warning'
    }
    
    const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff <= 2) {
      return 'warning'
    }
    
    return 'info'
  },

  /**
   * Creates appropriate notification title based on due date
   */
  getNotificationTitle(dueDate: Date): string {
    if (isPast(dueDate) && !isToday(dueDate)) {
      return 'Overdue Task'
    } else if (isToday(dueDate)) {
      return 'Due Today'
    } else if (isTomorrow(dueDate)) {
      return 'Due Tomorrow'
    } else {
      const daysDiff = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff <= 2 ? 'Upcoming Deadline' : 'Upcoming Task'
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data: existingNotifications, error: findError } =
          await supabaseAdmin
            .from('notifications')
            .select('id, dismissed, read')
            .eq('user_id', userId)
            .eq('origin_id', notification.origin_id)

        if (findError && findError.code !== 'PGRST116') {
          throw findError
        }

        const existingNotification = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('todo_id', notification.todo_id)
        .eq('notification_type', notification.notification_type)
        .eq('dismissed', false)
        .single();
      
      if (existingNotification.data) {
        await supabaseAdmin
          .from('notifications')
          .update({
            title: notification.title,
            message: notification.message,
            due_date: notification.due_date,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingNotification.data.id);
        
        continue;
      }

        if (!notification.due_date) {
          results.push({
            status: 'skipped',
            message: 'Missing due date',
          })
          continue
        }

        // Parse the due date
        let dueDate: Date
        try {
          dueDate = parseISO(notification.due_date)
          if (isNaN(dueDate.getTime())) {
            results.push({
              status: 'error',
              error: 'Invalid due date format',
            })
            continue
          }
        } catch (error) {
          console.error('Error parsing due date:', error)
          results.push({
            status: 'error',
            error: 'Error parsing due date',
          })
          continue
        }

        // Always update notification type based on current date
        const currentType = this.getNotificationTypeFromDueDate(dueDate)
        const currentTitle = this.getNotificationTitle(dueDate)
        
        // Format a fresh message with the latest date information
        let message = notification.message
        if (notification.message.includes('"') && notification.message.includes('due')) {
          // Likely already a formatted message, let's just update it
          // Extract the task title from the message
          const titleMatch = notification.message.match(/"([^"]+)"/)
          if (titleMatch && titleMatch[1]) {
            message = this.formatNotificationMessage(titleMatch[1], dueDate)
          }
        }

        if (existingNotification) {
          const { data, error } = await supabaseAdmin
            .from('notifications')
            .update({
              title: currentTitle,
              message: message,
              notification_type: currentType,
              due_date: notification.due_date,
              dismissed: false,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingNotification.data.id)
            .select()

          if (error) {
            results.push({ status: 'error', error })
          } else {
            results.push({ status: 'updated', notification: data?.[0] })
          }
        } else {
          const newNotification = {
            ...notification,
            title: currentTitle,
            message: message,
            notification_type: currentType,
            user_id: userId,
            read: false,
            dismissed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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
        }
      } catch (error) {
        results.push({ status: 'error', error })
      }
    }
    return results
  },

  /**
   * Generate notifications for a todo
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
      
      if (isNaN(dueDate.getTime())) {
        console.error('Invalid due date format:', todo.due_date)
        return []
      }
      
      const type = this.getNotificationTypeFromDueDate(dueDate)
      const title = this.getNotificationTitle(dueDate)
      const message = this.formatNotificationMessage(todo.title, dueDate)

      return [
        {
          todo_id: todo.id,
          notification_type: type,
          title: title,
          message: message,
          due_date: todo.due_date,
          origin_id: `${type}-${todo.id}`,
        }
      ]
    } catch (error) {
      console.error('Error generating todo notifications:', error)
      return []
    }
  },
}