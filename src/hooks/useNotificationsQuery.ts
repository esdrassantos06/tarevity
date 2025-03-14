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
  origin_id: string
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axios.get('/api/notifications')
      return response.data
    },
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
      showError('Failed to sync notifications')
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
      showSuccess('Notification(s) marked as read')
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

export function useResetNotificationsMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      return axios.post('/api/notifications/reset')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      showSuccess('Notification system reset')
    },
    onError: (error) => {
      console.error('Error resetting notifications:', error)
      showError('Failed to reset notifications')
    },
  })
}