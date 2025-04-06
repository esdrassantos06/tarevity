'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { showSuccess, showError } from '@/lib/toast'
import { Notification } from '@/lib/notifications'
import { useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'

interface QueryOptions {
  enabled?: boolean
  [key: string]: unknown
}

async function refreshNotificationsLocal(): Promise<void> {
  try {
    await axios.post('/api/notifications/refresh')
  } catch (error) {
    console.error('Error refreshing notifications:', error)
  }
}

export function useNotificationsQuery(options: QueryOptions = {}) {
  const t = useTranslations('notificationsQuery')
  const queryClient = useQueryClient()
  const lastRefreshRef = useRef<number>(Date.now())
  const initialLoadDone = useRef<boolean>(false)

  const forceRefreshNotifications = useCallback(async () => {
    try {
      await refreshNotificationsLocal()
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
      await queryClient.refetchQueries({ queryKey: ['notifications'] })

      lastRefreshRef.current = Date.now()
      return true
    } catch (error) {
      console.error(t('failedToForceRefresh'), error)
      return false
    }
  }, [queryClient, t])

  const refreshNotificationsWithThrottling = useCallback(async () => {
    const now = Date.now()

    if (now - lastRefreshRef.current < 60000) {
      return
    }
    try {
      lastRefreshRef.current = now
      await refreshNotificationsLocal()
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
      await queryClient.refetchQueries({ queryKey: ['notifications'] })
    } catch (error) {
      console.error(t('failedToRefresh'), error)
    }
  }, [queryClient, t])

  useEffect(() => {
    if (options.enabled !== false && !initialLoadDone.current) {
      refreshNotificationsWithThrottling()
      initialLoadDone.current = true
    }

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
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000,
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
  const t = useTranslations('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notifications: unknown[]) => {
      return axios.post('/api/notifications', { notifications })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.refetchQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => {
      console.error(t('errorCreatingNotifications'), error)
    },
  })
}

export function useMarkNotificationReadMutation() {
  const t = useTranslations('notifications')
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
      showSuccess(message || t('notificationReadStatusUpdated'))
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.refetchQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => {
      console.error(t('errorUpdatingNotificationStatus'), error)
      showError(t('failedToUpdateNotificationStatus'))
    },
  })
}

export function useDismissNotificationMutation() {
  const t = useTranslations('notifications')
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
      queryClient.refetchQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => {
      console.error(t('errorDismissingNotification'), error)
      showError(t('failedToDismissNotification'))
    },
  })
}

export function useDeleteNotificationsForTodoMutation() {
  const t = useTranslations('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (todoId: string) => {
      return axios.delete(`/api/notifications/delete-for-todo/${todoId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.refetchQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => {
      console.error(t('errorDeletingNotifications'), error)
      showError(t('failedToDeleteNotifications'))
    },
  })
}

function useRef<T>(initialValue: T): { current: T } {
  return { current: initialValue }
}
