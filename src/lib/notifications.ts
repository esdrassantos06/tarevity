import { supabaseAdmin } from './supabaseAdmin'
import { parseISO, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns'
import { permanentlyDismissTodoNotifications } from './notification-updater'

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
      // Import notification preference function
      const { muteNotificationsForTodo } = await import('./notification-preferences')
      
      if (id) {
        // Get the task associated with the notification before deleting it
        const { data: notification } = await supabaseAdmin
          .from('notifications')
          .select('todo_id')
          .eq('id', id)
          .eq('user_id', userId)
          .single()
          
        if (notification) {
          // Mute notifications for this task (store permanent preference)
          await muteNotificationsForTodo(userId, notification.todo_id)
        }
        
        // Now delete the notification
        const { error } = await supabaseAdmin
          .from('notifications')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)
  
        if (error) throw error
        return { success: true, count: 1 }
      } else if (todoId) {
        // Mute notifications for this specific task
        await muteNotificationsForTodo(userId, todoId)
        
        // Delete all notifications for this task
        const { error, count } = await supabaseAdmin
          .from('notifications')
          .delete()
          .eq('user_id', userId)
          .eq('todo_id', todoId)
  
        if (error) throw error
        return { success: true, count: count || 0 }
      } else if (all) {
        // For general cleanup, just delete without muting
        const { error, count } = await supabaseAdmin
          .from('notifications')
          .delete()
          .eq('user_id', userId)
  
        if (error) throw error
        return { success: true, count: count || 0 }
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
      // Mark with permanent dismissal flag
      await permanentlyDismissTodoNotifications(userId, todoId)
      
      // Then actually update them to dismissed
      const { error, count } = await supabaseAdmin
        .from('notifications')
        .update({ dismissed: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('todo_id', todoId)
        .eq('dismissed', false)

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
      return `"${title}" expired ${formatDistanceToNow(dueDate, { addSuffix: true })}`
    } else if (isToday(dueDate)) {
      return `"${title}" expires today!`
    } else if (isTomorrow(dueDate)) {
      return `"${title}" expires tomorrow`  
    } else {
      return `"${title}" expires ${formatDistanceToNow(dueDate, { addSuffix: true })}`
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
      return 'Expires today'
    } else if (isTomorrow(dueDate)) {
      return 'Expires tomorrow'
    } else {
      const daysDiff = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff <= 2 ? 'Deadline Approaching' : 'Future Task'
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
        // Check for do-not-recreate flags before creating new notifications
        const { data: recentlyDismissed } = await supabaseAdmin
          .from('notifications')
          .select('origin_id')
          .eq('user_id', userId)
          .eq('todo_id', notification.todo_id)
          .eq('dismissed', true)
          .ilike('origin_id', '%donotrecreate%')
          .order('updated_at', { ascending: false })
          .limit(1)
          
        // Skip if the user has explicitly dismissed this notification type
        if (recentlyDismissed && recentlyDismissed.length > 0) {
          // Check if this notification type was dismissed
          const doNotRecreateType = recentlyDismissed[0].origin_id.split('-')[0]
          if (doNotRecreateType === notification.notification_type) {
            results.push({
              status: 'skipped',
              message: 'User dismissed this notification type',
            })
            continue
          }
        }

        // Check for existing active notifications of same type
        const { data: existing } = await supabaseAdmin
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('todo_id', notification.todo_id)
          .eq('notification_type', notification.notification_type)
          .eq('dismissed', false)
          
        // Skip creation if already exists to prevent duplicates
        if (existing && existing.length > 0) {
          // Update the existing notification instead of creating a new one
          const { data, error } = await supabaseAdmin
            .from('notifications')
            .update({
              title: notification.title,
              message: notification.message,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing[0].id)
            .select()
            
          if (error) {
            results.push({ status: 'error', error })
          } else {
            results.push({ status: 'updated', notification: data?.[0] })
          }
          continue
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

        // Create a new notification
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
      } catch (error) {
        results.push({ status: 'error', error })
      }
    }
    
    // After processing all notifications, clean up any duplicates
    try {
      const { cleanupDuplicateNotifications } = await import('./notification-updater')
      await cleanupDuplicateNotifications()
    } catch (error) {
      console.error('Error cleaning up duplicates after processing:', error)
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

      // Generate a single notification based on due date
      return [
        {
          todo_id: todo.id,
          notification_type: type,
          title: title,
          message: message,
          due_date: todo.due_date,
          origin_id: `${type}-${todo.id}-${Date.now()}`,
        }
      ]
    } catch (error) {
      console.error('Error generating todo notifications:', error)
      return []
    }
  },


  /**
   * Fetches a single notification by ID
   */
  async fetchNotification(id: string, userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error fetching notification:', error)
      return { 
        data: null, 
        error: error instanceof Error 
          ? error 
          : new Error('Unknown error fetching notification') 
      }
    }
  },
}