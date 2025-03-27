import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { showSuccess, showError } from '@/lib/toast'
import { Notification } from '@/lib/notifications'
import { useEffect, useCallback } from 'react'

interface QueryOptions {
  enabled?: boolean
  [key: string]: unknown
}

export async function refreshNotifications(): Promise<void> {
  try {
    await axios.post('/api/notifications/refresh')
  } catch (error) {
    console.error('Error refreshing notifications:', error)
  }
}

export function useNotificationsQuery(options: QueryOptions = {}) {
  const queryClient = useQueryClient()
  const lastRefreshRef = useRef<number>(Date.now())
  const initialLoadDone = useRef<boolean>(false)

  const forceRefreshNotifications = useCallback(async () => {
    try {
      await axios.post('/api/notifications/refresh')
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
      lastRefreshRef.current = Date.now()
      return true
    } catch (error) {
      console.error('Failed to force refresh notifications:', error)
      return false
    }
  }, [queryClient])

  // Function to refresh notifications from the server
  const refreshNotificationsWithThrottling = useCallback(async () => {
    const now = Date.now()

    if (now - lastRefreshRef.current < 60000) {
      return
    }
    try {
      lastRefreshRef.current = now
      await axios.post('/api/notifications/refresh')
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    } catch (error) {
      console.error('Failed to refresh notifications:', error)
    }
  }, [queryClient])

  useEffect(() => {
    if (options.enabled !== false && !initialLoadDone.current) {
      refreshNotificationsWithThrottling()
      initialLoadDone.current = true
    }

    // Set up periodic refresh (every 10 minutes)
    const refreshInterval = setInterval(
      () => {
        if (document.visibilityState === 'visible') {
          refreshNotificationsWithThrottling()
        }
      },
      10 * 60 * 1000,
    )

    let visibilityTimeout: NodeJS.Timeout | null = null
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        visibilityTimeout === null
      ) {
        visibilityTimeout = setTimeout(() => {
          refreshNotificationsWithThrottling()
          visibilityTimeout = null
        }, 1000)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshNotificationsWithThrottling, options.enabled])

  const result = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axios.get<Notification[]>('/api/notifications')
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    refetchIntervalInBackground: false,
    retry: 1,
    ...options,
  })

  return {
    ...result,
    refreshNotifications: refreshNotificationsWithThrottling,
    forceRefreshNotifications,
  }
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
function useRef<T>(initialValue: T): { current: T } {
  return { current: initialValue }
}
