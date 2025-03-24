import { supabaseAdmin } from './supabaseAdmin'
import { notificationsService } from './notifications'
import { 
  isBefore, 
  isToday, 
  isTomorrow, 
  differenceInDays,
  formatDistanceToNow
} from 'date-fns'

interface Todo {
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

interface Notification {
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

/**
 * Service to handle notification status updates based on dates
 */
export const notificationUpdateService = {
  /**
   * Updates notifications for all tasks that have crossed date thresholds
   */
  async updateAllNotifications(): Promise<{ 
    success: boolean, 
    message: string, 
    updates: number
  }> {
    try {
      // 1. Get all non-completed todos with due dates
      const { data: todos, error: todosError } = await supabaseAdmin
        .from('todos')
        .select('*')
        .eq('is_completed', false)
        .not('due_date', 'is', null)
      
      if (todosError) {
        throw new Error(`Error fetching todos: ${todosError.message}`)
      }
      
      if (!todos || todos.length === 0) {
        return { success: true, message: 'No tasks with due dates found', updates: 0 }
      }
      
      // 2. Group todos by user_id for batch processing
      const todosByUser: Record<string, Todo[]> = {}
      todos.forEach(todo => {
        if (!todosByUser[todo.user_id]) {
          todosByUser[todo.user_id] = []
        }
        todosByUser[todo.user_id].push(todo)
      })
      
      // 3. Process notifications for each user
      let totalUpdates = 0
      
      for (const [userId, userTodos] of Object.entries(todosByUser)) {
        // Get current notifications for this user's todos
        const { data: userNotifications, error: notifError } = await supabaseAdmin
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .eq('dismissed', false)
        
        if (notifError) {
          console.error(`Error fetching notifications for user ${userId}:`, notifError)
          continue
        }
        
        // Generate updated notifications
        const notificationsToProcess = this.generateUpdatedNotifications(
          userTodos,
          userNotifications || []
        )
        
        if (notificationsToProcess.length > 0) {
          const results = await notificationsService.processNotifications(
            userId,
            notificationsToProcess
          )
          
          // Count successful updates
          const successCount = results.filter(r => 
            r.status === 'created' || r.status === 'updated'
          ).length
          
          totalUpdates += successCount
        }
      }
      
      return { 
        success: true, 
        message: 'Notifications updated successfully', 
        updates: totalUpdates 
      }
    } catch (error) {
      console.error('Error in notification update service:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error updating notifications',
        updates: 0
      }
    }
  },
  
 /**
 * Generate updated notifications based on current dates for a set of todos
 */
generateUpdatedNotifications(
    todos: Todo[], 
    existingNotifications: Notification[]
  ): Array<{
    todo_id: string;
    title: string;
    message: string;
    notification_type: 'warning' | 'danger' | 'info';
    due_date: string;
    origin_id: string;
  }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const notificationsToUpdate = []
    
    for (const todo of todos) {
      if (!todo.due_date) continue
      
      const dueDate = new Date(todo.due_date)
      dueDate.setHours(0, 0, 0, 0)
      
      // Get existing notifications for this todo
      const todoNotifications = existingNotifications.filter(n => 
        n.todo_id === todo.id && !n.dismissed
      )
      
      // Calculate date relationship - use exact calculations
      const isPastDue = isBefore(dueDate, today)
      const isDueToday = isToday(dueDate)
      const isDueTomorrow = isTomorrow(dueDate)
      const daysUntilDue = differenceInDays(dueDate, today)
      
      // IMPORTANTE: Garanta prioridade para evitar notificações duplicadas
      // Ordem de prioridade: Atrasado > Para hoje > Para amanhã > Futuros
      
      // 1. Para tarefas atrasadas (prioridade mais alta)
      if (isPastDue) {
        const existingDanger = todoNotifications.find(n => 
          n.notification_type === 'danger'
        )
        
        const message = `"${todo.title}" is overdue by ${formatDistanceToNow(dueDate)}`
        
        if (!existingDanger || existingDanger.message !== message) {
          notificationsToUpdate.push({
            todo_id: todo.id,
            notification_type: 'danger',
            title: 'Overdue Task',
            message,
            due_date: todo.due_date,
            origin_id: `danger-${todo.id}`,
          })
        }
        
        // Se é atrasado, remove qualquer outra notificação de warning ou info
        this.cleanupOtherNotifications(todoNotifications, notificationsToUpdate, todo, ['warning', 'info'])
      }
      // 2. Para tarefas de hoje
      else if (isDueToday) {
        const existingWarning = todoNotifications.find(n => 
          n.notification_type === 'warning' || n.notification_type === 'danger'
        )
        
        const message = `"${todo.title}" is due today`
        
        if (!existingWarning || existingWarning.message !== message) {
          notificationsToUpdate.push({
            todo_id: todo.id,
            notification_type: 'danger', // Usamos danger para "hoje" para destacar urgência
            title: 'Due Today',
            message,
            due_date: todo.due_date,
            origin_id: `danger-${todo.id}`,
          })
        }
        
        // Se é para hoje, remove qualquer outra notificação de warning ou info
        this.cleanupOtherNotifications(todoNotifications, notificationsToUpdate, todo, ['warning', 'info'])
      }
      // 3. Para tarefas de amanhã (exatamente 1 dia)
      else if (isDueTomorrow) {
        const existingWarning = todoNotifications.find(n => 
          n.notification_type === 'warning'
        )
        
        const message = `"${todo.title}" is due tomorrow`
        
        if (!existingWarning || existingWarning.message !== message) {
          notificationsToUpdate.push({
            todo_id: todo.id,
            notification_type: 'warning',
            title: 'Due Tomorrow',
            message,
            due_date: todo.due_date,
            origin_id: `warning-${todo.id}`,
          })
        }
        
        // Se é para amanhã, remove qualquer outra notificação de info
        this.cleanupOtherNotifications(todoNotifications, notificationsToUpdate, todo, ['info'])
      }
      // 4. Para tarefas futuras (2-4 dias)
      else if (daysUntilDue >= 2 && daysUntilDue <= 4) {
        const existingInfo = todoNotifications.find(n => 
          n.notification_type === 'info'
        )
        
        const message = `"${todo.title}" is due in ${daysUntilDue} days`
        
        if (!existingInfo || existingInfo.message !== message) {
          notificationsToUpdate.push({
            todo_id: todo.id,
            notification_type: 'info',
            title: 'Upcoming Deadline',
            message,
            due_date: todo.due_date,
            origin_id: `info-${todo.id}`,
          })
        }
      }
    }
    
    return notificationsToUpdate
  },
  
  
  /**
   * Cleanup helper to remove notifications of specific types for a todo
   */
  cleanupOtherNotifications(
    existingNotifications: Notification[],
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notificationsToUpdate: any[],
    todo: Todo,
    typesToRemove: ('danger' | 'warning' | 'info')[]
  ) {
    for (const type of typesToRemove) {
      const notification = existingNotifications.find(n => 
        n.notification_type === type && !n.dismissed
      )
      
      if (notification) {
        // Add a dismiss instruction for this notification
        notificationsToUpdate.push({
          todo_id: todo.id,
          notification_type: type,
          title: 'TO_BE_REMOVED', // Special marker for backend to know this should be dismissed
          message: 'This notification should be dismissed',
          due_date: todo.due_date,
          origin_id: `${type}-${todo.id}`,
          to_dismiss: true // Special flag to signal dismissal
        })
      }
    }
  }
}