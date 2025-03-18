import { supabaseAdmin } from './supabaseAdmin'
import { isPast, isWithinInterval, addDays, parseISO } from 'date-fns'

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
        console.error('Error fetching notifications:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserNotifications:', error)
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
      console.error('Error updating notification read status:', error)
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
      console.error('Error deleting notifications:', error)
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
      console.error('Error dismissing notifications:', error)
      throw error
    }
  },

  /**
   * Create or update notifications for a todo based on due date
   */
  async processNotifications(
    userId: string,
    notifications: NotificationRequest[]
  ) {
    const results = []
  
    for (const notification of notifications) {
      

      if (!notification.title || !notification.message || !notification.notification_type || !notification.origin_id) {
        console.error('NotificationsService: Campos obrigatórios ausentes', notification);
        results.push({ 
          status: 'error', 
          error: 'Missing required notification fields' 
        })
        continue
      }
  
      if (!['danger', 'warning', 'info'].includes(notification.notification_type)) {
        console.error('NotificationsService: Tipo de notificação inválido', notification.notification_type);
        results.push({ 
          status: 'error', 
          error: 'Invalid notification type' 
        })
        continue
      }
  
      try {
        const { data: existingNotification, error: findError } = await supabaseAdmin
          .from('notifications')
          .select('id, dismissed, read')
          .eq('user_id', userId)
          .eq('origin_id', notification.origin_id)
          .single()
  
        if (findError) {
            console.error('NotificationsService: Erro ao buscar notificação existente', findError);
        }
        const shouldShow = this.shouldShowNotification(
          notification.notification_type,
          notification.due_date
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
              })
              .eq('id', existingNotification.id)
              .select()
  
            if (error) {
              console.error('NotificationsService: Erro ao atualizar notificação', error);
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
          };
          
          const { data, error } = await supabaseAdmin
            .from('notifications')
            .insert([newNotification])
            .select()
  
          if (error) {
            console.error('NotificationsService: Erro ao criar notificação', error);
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
        console.error('NotificationsService: Erro ao processar notificação', error);
        results.push({ status: 'error', error })
      }
    }
    return results
  },

  /**
   * Determines if a notification should be shown based on its type and due date
   */
  shouldShowNotification(
    type: string,
    dueDateString: string | null
  ): boolean {
    if (!dueDateString) return false
  
    try {
      let dueDate: Date
      try {
        dueDate = parseISO(dueDateString)
        
        if (isNaN(dueDate.getTime())) {
          console.error('Invalid date format:', dueDateString)
          return false
        }
      } catch (error) {
        console.error('Error parsing date:', error)
        return false
      }
  

  
      const now = new Date()
      const threeDaysFromNow = addDays(now, 3)
  
      switch (type) {
        case 'danger':
          return isPast(dueDate) && dueDate > addDays(now, -7)
        case 'warning':
          return isWithinInterval(dueDate, {
            start: now,
            end: addDays(now, 1),
          })
        case 'info':
          return isWithinInterval(dueDate, {
            start: addDays(now, 1),
            end: threeDaysFromNow,
          })
        default:
          return false
      }
    } catch (error) {
      console.error('Error checking notification date:', error)
      return false
    }
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

    const notifications: NotificationRequest[] = [
      {
        todo_id: todo.id,
        notification_type: 'danger',
        title: 'Overdue Task',
        message: `"${todo.title}" is overdue`,
        due_date: todo.due_date,
        origin_id: `danger-${todo.id}`,
      },
      {
        todo_id: todo.id,
        notification_type: 'warning',
        title: 'Due Soon',
        message: `"${todo.title}" is due soon`,
        due_date: todo.due_date,
        origin_id: `warning-${todo.id}`,
      },
      {
        todo_id: todo.id,
        notification_type: 'info',
        title: 'Upcoming Deadline',
        message: `"${todo.title}" is due in the next few days`,
        due_date: todo.due_date,
        origin_id: `info-${todo.id}`,
      },
    ]

    return notifications
  }
}