import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { showSuccess, showError } from '@/lib/toast'
import { Notification } from '@/lib/notifications'
import { useEffect, useCallback } from 'react'

interface QueryOptions {
  enabled?: boolean
  [key: string]: unknown
}

export function useNotificationsQuery(options: QueryOptions = {}) {
  const queryClient = useQueryClient()
  
  // Function to refresh notifications from the server
  const refreshNotifications = useCallback(async () => {
    try {
      await axios.post('/api/notifications/refresh')
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    } catch (error) {
      console.error('Failed to refresh notifications:', error)
    }
  }, [queryClient])

  // Run the refresh when the component mounts and notifications are enabled
  useEffect(() => {
    if (options.enabled !== false) {
      refreshNotifications()
    }
    
    // Set up periodic refresh (every 5 minutes)
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshNotifications()
      }
    }, 5 * 60 * 1000)
    
    // Also refresh when the tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshNotifications()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshNotifications, options.enabled])

  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axios.get<Notification[]>('/api/notifications')
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 3 * 60 * 1000, // 3 minutes
    refetchIntervalInBackground: false,
    retry: 1,
    ...options,
  })
}

export function useCreateNotificationsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notifications: unknown[]) => {
      return axios.post('/api/notifications', { notifications })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => {
      console.error('Error creating notifications:', error)
    },
  })
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      all,
      markAsUnread,
    }: {
      id?: string
      all?: boolean
      markAsUnread?: boolean
    }) => {
      return axios.post('/api/notifications/mark-read', {
        id,
        all,
        markAsUnread,
      })
    },
    onSuccess: (response) => {
      const { message } = response.data
      showSuccess(message || 'Notification read status updated')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => {
      console.error('Error updating notification read status:', error)
      showError('Failed to update notification read status')
    },
  })
}

export function useDismissNotificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      all,
      todoId,
    }: {
      id?: string
      all?: boolean
      todoId?: string
    }) => {
      if (todoId) {
        return axios.post('/api/notifications/dismiss-for-todo', { todoId })
      }
      return axios.post('/api/notifications/dismiss', { id, all })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => {
      console.error('Error dismissing notification:', error)
      showError('Failed to dismiss notification')
    },
  })
}

export function useDeleteNotificationsForTodoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (todoId: string) => {
      return axios.delete(`/api/notifications/delete-for-todo/${todoId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => {
      console.error('Error deleting notifications for todo:', error)
      showError('Failed to delete notifications')
    },
  })
}