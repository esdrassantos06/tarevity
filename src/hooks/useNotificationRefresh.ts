'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useTodosQuery } from './useTodosQuery'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

/**
 * A hook that provides automatic background refreshing of notifications
 * This ensures notifications stay current with changing dates
 */
export function useNotificationRefresh() {
  const { status, data: session } = useSession()
  const { data: todos = [] } = useTodosQuery()
  const queryClient = useQueryClient()
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshNotifications = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user?.id || isRefreshing) {
      return
    }

    // Only refresh once per hour maximum
    if (
      lastRefresh &&
      new Date().getTime() - lastRefresh.getTime() < 60 * 60 * 1000
    ) {
      return
    }

    setIsRefreshing(true)

    try {
      // Filter only active todos with due dates
      const relevantTodos = todos.filter(
        (todo) => !todo.is_completed && todo.due_date
      )

      if (relevantTodos.length === 0) {
        setIsRefreshing(false)
        setLastRefresh(new Date())
        return
      }

      // Process each todo to potentially update its notifications
      const notifications = []

      for (const todo of relevantTodos) {
        const dueDate = new Date(todo.due_date!)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dueDate.setHours(0, 0, 0, 0)

        // Calculate days until due
        const diffTime = dueDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // Handle overdue tasks
        if (diffDays < 0) {
          notifications.push({
            todo_id: todo.id,
            notification_type: 'danger',
            title: 'Overdue Task',
            message: `"${todo.title}" is overdue by ${Math.abs(diffDays)} day${
              Math.abs(diffDays) !== 1 ? 's' : ''
            }`,
            due_date: todo.due_date,
            origin_id: `danger-${todo.id}`,
          })
        }
        // Handle due today
        else if (diffDays === 0) {
          notifications.push({
            todo_id: todo.id,
            notification_type: 'danger',
            title: 'Due Today',
            message: `"${todo.title}" is due today`,
            due_date: todo.due_date,
            origin_id: `danger-${todo.id}`,
          })
        }
        // Handle due tomorrow
        else if (diffDays === 1) {
          notifications.push({
            todo_id: todo.id,
            notification_type: 'warning',
            title: 'Due Tomorrow',
            message: `"${todo.title}" is due tomorrow`,
            due_date: todo.due_date,
            origin_id: `warning-${todo.id}`,
          })
        }
        // Handle upcoming (2-4 days)
        else if (diffDays >= 2 && diffDays <= 4) {
          notifications.push({
            todo_id: todo.id,
            notification_type: 'info',
            title: 'Upcoming Deadline',
            message: `"${todo.title}" is due in ${diffDays} days`,
            due_date: todo.due_date,
            origin_id: `info-${todo.id}`,
          })
        }
      }

      if (notifications.length > 0) {
        await axios.post('/api/notifications', { notifications })
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error)
    } finally {
      setIsRefreshing(false)
      setLastRefresh(new Date())
    }
  }, [status, session, todos, lastRefresh, isRefreshing, queryClient])

  // Refresh on initial load
  useEffect(() => {
    if (status === 'authenticated' && !lastRefresh) {
      refreshNotifications()
    }
  }, [status, refreshNotifications, lastRefresh])

  // Refresh every day at midnight
  useEffect(() => {
    if (status !== 'authenticated') return

    // Set timeout for midnight
    const now = new Date()
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0
    )
    const msUntilMidnight = night.getTime() - now.getTime()

    const timer = setTimeout(() => {
      refreshNotifications()
    }, msUntilMidnight)

    return () => clearTimeout(timer)
  }, [status, refreshNotifications, lastRefresh])

  return { refreshNotifications }
}