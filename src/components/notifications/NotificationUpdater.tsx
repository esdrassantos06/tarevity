'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useNotificationsQuery } from '@/hooks/useNotificationsQuery'
import { useTodosQuery } from '@/hooks/useTodosQuery'
import axios from 'axios'
import { useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow, isToday, isTomorrow, addDays } from 'date-fns'

/**
 * A component that automatically updates notification statuses based on due dates
 * This will run whenever notifications are loaded in the app
 */
export default function NotificationUpdater() {
  const { status } = useSession()
  const { data: notifications = [] } = useNotificationsQuery({
    enabled: status === 'authenticated',
  })
  const { data: todos = [] } = useTodosQuery()
  const queryClient = useQueryClient()
  
  // Function to check if this is the user's first session of the day
  const isFirstSessionOfDay = () => {
    const lastSession = localStorage.getItem('last_notification_check')
    if (!lastSession) return true
    
    const lastDate = new Date(parseInt(lastSession, 10))
    const today = new Date()
    
    // Check if the last session was on a different day
    return lastDate.getDate() !== today.getDate() || 
           lastDate.getMonth() !== today.getMonth() || 
           lastDate.getFullYear() !== today.getFullYear()
  }

  useEffect(() => {
    if (status !== 'authenticated' || !todos.length) {
      return
    }
    
    // Store the current date to track daily checks
    localStorage.setItem('last_notification_check', Date.now().toString())
    
    // Always check for notifications that need updating
    const notificationsToUpdate = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
  
    // Check each active task with a due date
    for (const todo of todos) {
      if (todo.is_completed || !todo.due_date) continue
  
      // Find associated notifications for this todo
      const todoNotifications = notifications.filter(
        (n) => n.todo_id === todo.id && !n.dismissed
      )
  
      const dueDate = new Date(todo.due_date)
      dueDate.setHours(0, 0, 0, 0)
  
      // Check date relationships
      const isPastDue = dueDate < today
      const isDueToday = isToday(dueDate)
      const isDueTomorrow = isTomorrow(dueDate)
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
  
      // Lógica baseada na mesma prioridade que usamos no serviço
      // 1. Tarefas atrasadas (maior prioridade)
      if (isPastDue) {
        const dangerNotification = todoNotifications.find(
          (n) => n.notification_type === 'danger'
        )
        
        const updatedMessage = `"${todo.title}" is overdue by ${formatDistanceToNow(dueDate)}`
        
        if (!dangerNotification || dangerNotification.message !== updatedMessage) {
          notificationsToUpdate.push({
            todo_id: todo.id,
            notification_type: 'danger',
            title: 'Overdue Task',
            message: updatedMessage,
            due_date: todo.due_date,
            origin_id: `danger-${todo.id}`,
          })
        }
        
        // Limpa notificações de warning e info
        const warningNotification = todoNotifications.find(
          (n) => n.notification_type === 'warning'
        )
        const infoNotification = todoNotifications.find(
          (n) => n.notification_type === 'info'
        )
        
        if (warningNotification) {
          notificationsToUpdate.push({
            todo_id: todo.id,
            notification_type: 'warning',
            title: 'TO_BE_REMOVED',
            message: 'This notification should be dismissed',
            due_date: todo.due_date,
            origin_id: `warning-${todo.id}`,
            to_dismiss: true
          })
        }
        
        if (infoNotification) {
          notificationsToUpdate.push({
            todo_id: todo.id,
            notification_type: 'info',
            title: 'TO_BE_REMOVED',
            message: 'This notification should be dismissed',
            due_date: todo.due_date,
            origin_id: `info-${todo.id}`,
            to_dismiss: true
          })
        }
      }
      // 2. Tarefas de hoje
      else if (isDueToday) {
        const dangerNotification = todoNotifications.find(
          (n) => n.notification_type === 'danger'
        )
        
        const updatedMessage = `"${todo.title}" is due today`
        
        if (!dangerNotification || dangerNotification.message !== updatedMessage) {
          notificationsToUpdate.push({
            todo_id: todo.id,
            notification_type: 'danger',
            title: 'Due Today',
            message: updatedMessage,
            due_date: todo.due_date,
            origin_id: `danger-${todo.id}`,
          })
        }
        
        // Limpa notificações de warning e info
        const warningNotification = todoNotifications.find(
          (n) => n.notification_type === 'warning'
        )
        const infoNotification = todoNotifications.find(
          (n) => n.notification_type === 'info'
        )
        
        if (warningNotification) {
          notificationsToUpdate.push({
            todo_id: todo.id,
            notification_type: 'warning',
            title: 'TO_BE_REMOVED',
            message: 'This notification should be dismissed',
            due_date: todo.due_date,
            origin_id: `warning-${todo.id}`,
            to_dismiss: true
          })
        }
        
        if (infoNotification) {
          notificationsToUpdate.push({
            todo_id: todo.id,
            notification_type: 'info',
            title: 'TO_BE_REMOVED',
            message: 'This notification should be dismissed',
            due_date: todo.due_date,
            origin_id: `info-${todo.id}`,
            to_dismiss: true
          })
        }
      }
      // 3. Tarefas de amanhã
      else if (isDueTomorrow) {
        const warningNotification = todoNotifications.find(
          (n) => n.notification_type === 'warning'
        )
        
        const updatedMessage = `"${todo.title}" is due tomorrow`
        
        if (!warningNotification || warningNotification.message !== updatedMessage) {
          notificationsToUpdate.push({
            todo_id: todo.id,
            notification_type: 'warning',
            title: 'Due Tomorrow',
            message: updatedMessage,
            due_date: todo.due_date,
            origin_id: `warning-${todo.id}`,
          })
        }
        
        // Limpa notificações de info
        const infoNotification = todoNotifications.find(
          (n) => n.notification_type === 'info'
        )
        
        if (infoNotification) {
          notificationsToUpdate.push({
            todo_id: todo.id,
            notification_type: 'info',
            title: 'TO_BE_REMOVED',
            message: 'This notification should be dismissed',
            due_date: todo.due_date,
            origin_id: `info-${todo.id}`,
            to_dismiss: true
          })
        }
      }
      // 4. Tarefas futuras (2-4 dias)
      else if (daysUntilDue >= 2 && daysUntilDue <= 4) {
        const infoNotification = todoNotifications.find(
          (n) => n.notification_type === 'info'
        )
        
        const updatedMessage = `"${todo.title}" is due in ${daysUntilDue} days`
        
        if (!infoNotification || infoNotification.message !== updatedMessage) {
          notificationsToUpdate.push({
            todo_id: todo.id,
            notification_type: 'info',
            title: 'Upcoming Deadline',
            message: updatedMessage,
            due_date: todo.due_date,
            origin_id: `info-${todo.id}`,
          })
        }
      }
    }
  
    // If we have notifications to update, send them to the server
    if (notificationsToUpdate.length > 0) {
      console.log('Updating notifications:', notificationsToUpdate)
      
      axios
        .post('/api/notifications', { notifications: notificationsToUpdate })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        })
        .catch((error) => {
          console.error('Error updating notifications:', error)
        })
    }
  }, [status, notifications, todos, queryClient])
  
  // Run a daily check for tasks crossing date thresholds
  useEffect(() => {
    if (status !== 'authenticated' || !todos.length) {
      return
    }
    
    // Check if this is the first session of the day
    if (isFirstSessionOfDay()) {
      // Set up midnight updates for the next day
      const now = new Date()
      const tomorrow = addDays(now, 1)
      tomorrow.setHours(0, 0, 1) // Just after midnight
      
      const timeUntilMidnight = tomorrow.getTime() - now.getTime()
      
      // Schedule a refresher for midnight
      const midnightTimer = setTimeout(() => {
        // Force a complete refresh of notifications
        axios
          .post('/api/notifications/refresh', {})
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            localStorage.setItem('last_notification_check', Date.now().toString())
          })
          .catch(error => {
            console.error('Failed to refresh notifications at midnight:', error)
          })
      }, timeUntilMidnight)
      
      return () => clearTimeout(midnightTimer)
    }
  }, [status, todos, queryClient])

  // This is a utility component that doesn't render anything
  return null
}