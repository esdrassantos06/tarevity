import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { showSuccess, showError } from '@/lib/toast'

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
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axios.get('/api/notifications')
      return response.data
    },
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
    refetchInterval: 3 * 60 * 1000,
    refetchIntervalInBackground: false,
    retry: 1,
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
    mutationFn: async ({ id, all }: { id?: string; all?: boolean }) => {
      return axios.post('/api/notifications/mark-read', { id, all })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      showSuccess('Notification marked as read')
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error)
      showError('Failed to mark notification as read')
    },
  })
}

export function useDismissNotificationMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, all }: { id?: string; all?: boolean }) => {
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