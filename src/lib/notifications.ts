import { supabaseAdmin } from './supabaseAdmin'
import {
  parseISO,
  formatDistanceToNow,
  isPast,
  isToday,
  isTomorrow,
} from 'date-fns'
import { permanentlyDismissTodoNotifications } from './notification-updater'
import { getTranslations } from 'next-intl/server'

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
      const { muteNotificationsForTodo } = await import(
        './notification-preferences'
      )

      if (id) {
        const { data: notification } = await supabaseAdmin
          .from('notifications')
          .select('todo_id')
          .eq('id', id)
          .eq('user_id', userId)
          .single()

        if (notification) {
          await muteNotificationsForTodo(userId, notification.todo_id)
        }

        const { error } = await supabaseAdmin
          .from('notifications')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) throw error
        return { success: true, count: 1 }
      } else if (todoId) {
        await muteNotificationsForTodo(userId, todoId)

        const { error, count } = await supabaseAdmin
          .from('notifications')
          .delete()
          .eq('user_id', userId)
          .eq('todo_id', todoId)

        if (error) throw error
        return { success: true, count: count || 0 }
      } else if (all) {
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
      await permanentlyDismissTodoNotifications(userId, todoId)

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
  async formatNotificationMessage(
    title: string,
    dueDate: Date,
  ): Promise<string> {
    const t = await getTranslations('NotificationPhrases')

    if (isPast(dueDate) && !isToday(dueDate)) {
      return t('expiredSuffix', {
        title: `"${title}"`,
        timeAgo: formatDistanceToNow(dueDate, { addSuffix: true }),
      })
    } else if (isToday(dueDate)) {
      return t('expiresTodaySuffix', { title: `"${title}"` })
    } else if (isTomorrow(dueDate)) {
      return t('expiresTomorrowSuffix', { title: `"${title}"` })
    } else {
      return t('expiresInSuffix', {
        title: `"${title}"`,
        timeAgo: formatDistanceToNow(dueDate, { addSuffix: true }),
      })
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

    const daysDiff = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    )

    if (daysDiff <= 2) {
      return 'warning'
    }

    return 'info'
  },

  /**
   * Creates appropriate notification title based on due date
   */
  async getNotificationTitle(dueDate: Date): Promise<string> {
    const t = await getTranslations('NotificationTitles')

    if (isPast(dueDate) && !isToday(dueDate)) {
      return t('overdueTask')
    } else if (isToday(dueDate)) {
      return t('expirestoday')
    } else if (isTomorrow(dueDate)) {
      return t('expiresTomorrow')
    } else {
      const daysDiff = Math.ceil(
        (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      )
      return daysDiff <= 2 ? t('deadlineApproaching') : t('futureTask')
    }
  },

  /**
   * Create or update notifications for a todo based on due date
   */
  async processNotifications(
    userId: string,
    notifications: NotificationRequest[],
  ) {
    const tErrors = await getTranslations('NotificationErrors')
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
          error: tErrors('missingFields'),
        })
        continue
      }

      if (
        !['danger', 'warning', 'info'].includes(notification.notification_type)
      ) {
        results.push({
          status: 'error',
          error: tErrors('invalidType'),
        })
        continue
      }

      try {
        const recentlyDismissed = await supabaseAdmin
          .from('notifications')
          .select('origin_id')
          .eq('user_id', userId)
          .eq('todo_id', notification.todo_id)
          .eq('dismissed', true)
          .ilike('origin_id', '%donotrecreate%')
          .order('updated_at', { ascending: false })
          .limit(1)

        if (recentlyDismissed.data && recentlyDismissed.data.length > 0) {
          const doNotRecreateType =
            recentlyDismissed.data[0].origin_id.split('-')[0]
          if (doNotRecreateType === notification.notification_type) {
            results.push({
              status: 'skipped',
              message: tErrors('skippedDismissed'),
            })
            continue
          }
        }

        const { data: existing } = await supabaseAdmin
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('todo_id', notification.todo_id)
          .eq('notification_type', notification.notification_type)
          .eq('dismissed', false)

        if (existing && existing.length > 0) {
          let message = notification.message
          let title = notification.title

          if (!notification.due_date) {
            results.push({
              status: 'skipped',
              message: tErrors('missingDueDate'),
            })
            continue
          }

          let dueDate: Date
          try {
            dueDate = parseISO(notification.due_date)
            if (isNaN(dueDate.getTime())) {
              results.push({
                status: 'error',
                error: tErrors('invalidDateFormat'),
              })
              continue
            }
          } catch (error) {
            console.error('Error parsing due date:', error)
            results.push({
              status: 'error',
              error: tErrors('errorParsingDate'),
            })
            continue
          }

          title = await this.getNotificationTitle(dueDate)
          message = await this.formatNotificationMessage(
            notification.title.replace(/^"|"$/g, '').replace(/"/g, ''),
            dueDate,
          )

          const { data, error } = await supabaseAdmin
            .from('notifications')
            .update({
              title: title,
              message: message,
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
            message: tErrors('missingDueDate'),
          })
          continue
        }

        let dueDate: Date
        try {
          dueDate = parseISO(notification.due_date)
          if (isNaN(dueDate.getTime())) {
            results.push({
              status: 'error',
              error: tErrors('invalidDateFormat'),
            })
            continue
          }
        } catch (error) {
          console.error('Error parsing due date:', error)
          results.push({
            status: 'error',
            error: tErrors('errorParsingDate'),
          })
          continue
        }

        const currentType = this.getNotificationTypeFromDueDate(dueDate)
        const currentTitle = await this.getNotificationTitle(dueDate)

        let message = notification.message
        if (
          notification.message.includes('"') &&
          (notification.message.includes('due') ||
            notification.message.includes('expire'))
        ) {
          const titleMatch = notification.message.match(/"([^"]+)"/)
          if (titleMatch && titleMatch[1]) {
            message = await this.formatNotificationMessage(
              titleMatch[1],
              dueDate,
            )
          }
        }

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

    try {
      const { cleanupDuplicateNotifications } = await import(
        './notification-updater'
      )
      await cleanupDuplicateNotifications()
    } catch (error) {
      console.error('Error cleaning up duplicates after processing:', error)
    }

    return results
  },

  /**
   * Generate notifications for a todo
   */
  async generateTodoNotifications(todo: {
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
      const title = await this.getNotificationTitle(dueDate)
      const message = await this.formatNotificationMessage(todo.title, dueDate)

      return [
        {
          todo_id: todo.id,
          notification_type: type,
          title: title,
          message: message,
          due_date: todo.due_date,
          origin_id: `${type}-${todo.id}-${Date.now()}`,
        },
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
      const t = await getTranslations('NotificationErrors')
      console.error('Error fetching notification:', error)
      return {
        data: null,
        error:
          error instanceof Error
            ? error
            : new Error(t('errorFetchingNotification')),
      }
    }
  },
}
