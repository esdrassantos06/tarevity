import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { showSuccess, showError } from '@/lib/toast'
import { Notification } from '@/lib/notifications'

interface QueryOptions {
  enabled?: boolean
  [key: string]: unknown
}

export function useNotificationsQuery(options: QueryOptions = {}) {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axios.get<Notification[]>('/api/notifications')
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 3 * 60 * 1000,
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
