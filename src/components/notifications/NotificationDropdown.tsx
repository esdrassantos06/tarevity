'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { IoNotificationsOutline } from 'react-icons/io5'
import { FaCalendar, FaBell, FaTrash, FaCheck } from 'react-icons/fa'
import { useTodosQuery } from '@/hooks/useTodosQuery'
import {
  formatDistanceToNow,
  isPast,
  isWithinInterval,
  addDays,
} from 'date-fns'
import { showSuccess, showError } from '@/lib/toast'
import { useSession } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useNotificationsQuery,
  useCreateNotificationsMutation,
  useMarkNotificationReadMutation,
  useDismissNotificationMutation,
  useResetNotificationsMutation,
  type Notification,
} from '@/hooks/useNotificationsQuery'
import ConfirmationDialog, {
  useConfirmationDialog,
} from '@/components/common/ConfirmationDialog'

// Define a NotificationData interface para o que criamos e enviamos para a API
interface NotificationData {
  todo_id: string
  notification_type: 'danger' | 'warning' | 'info'
  title: string
  message: string
  due_date: string
  origin_id: string
}

export default function NotificationDropdown() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const lastProcessedRef = useRef<Set<string>>(new Set())

  // Use custom hooks for notificações
  const { data: todos = [] } = useTodosQuery()
  const { data: notifications = [], isLoading } = useNotificationsQuery()
  const createNotificationsMutation = useCreateNotificationsMutation()
  const markReadMutation = useMarkNotificationReadMutation()
  const dismissMutation = useDismissNotificationMutation()
  const resetMutation = useResetNotificationsMutation()

  // Use o hook de diálogo de confirmação
  const { dialogState, openConfirmDialog, closeConfirmDialog, setLoading } =
    useConfirmationDialog()

  // Atualiza a contagem de não lidos quando as notificações mudam
  useEffect(() => {
    const unread = notifications.filter((n: Notification) => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  // Trata clique fora para fechar o dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const createRelevantNotifications = useCallback(
    (todo: {
      id: string
      title: string
      is_completed: boolean
      due_date: string | null
    }): NotificationData[] => {
      if (todo.is_completed || !todo.due_date) return []

      const dueDate = new Date(todo.due_date)
      const now = new Date()
      const notifications: NotificationData[] = []

      if (isPast(dueDate)) {
        notifications.push({
          todo_id: todo.id,
          notification_type: 'danger',
          title: 'Overdue Task',
          message: `"${todo.title}" is due ${formatDistanceToNow(dueDate, { addSuffix: true })}`,
          due_date: todo.due_date,
          origin_id: `danger-${todo.id}`,
        })
      } else if (
        isWithinInterval(dueDate, { start: now, end: addDays(now, 1) })
      ) {
        notifications.push({
          todo_id: todo.id,
          notification_type: 'warning',
          title: 'Due Soon',
          message: `"${todo.title}" is due ${formatDistanceToNow(dueDate, { addSuffix: true })}`,
          due_date: todo.due_date,
          origin_id: `warning-${todo.id}`,
        })
      } else if (
        isWithinInterval(dueDate, {
          start: addDays(now, 1),
          end: addDays(now, 3),
        })
      ) {
        notifications.push({
          todo_id: todo.id,
          notification_type: 'info',
          title: 'Upcoming Deadline',
          message: `"${todo.title}" is due ${formatDistanceToNow(dueDate, { addSuffix: true })}`,
          due_date: todo.due_date,
          origin_id: `info-${todo.id}`,
        })
      }

      return notifications
    },
    [],
  )

  const processNotificationBatch = useCallback(
    async (notifications: NotificationData[]) => {
      if (notifications.length === 0) return

      const batchSize = 5
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize)

        await createNotificationsMutation.mutateAsync(batch, {
          onError: (error) => {
            console.error('Erro ao criar lote de notificações:', error)
          },
        })
      }
    },
    [createNotificationsMutation],
  )

  useEffect(() => {
    if (!session?.user?.id || todos.length === 0) return

    const timer = setTimeout(() => {
      const allNotifications: NotificationData[] = []
      const processedIds = new Set<string>()

      todos.forEach((todo) => {
        if (lastProcessedRef.current.has(todo.id)) return

        if (!todo.is_completed && todo.due_date) {
          const todoNotifications = createRelevantNotifications(todo)

          if (todoNotifications.length > 0) {
            allNotifications.push(...todoNotifications)
            processedIds.add(todo.id)
          }
        }
      })

      // Atualiza a referência de tarefas processadas
      lastProcessedRef.current = processedIds

      // Processa as notificações em lotes
      if (allNotifications.length > 0) {
        processNotificationBatch(allNotifications)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
          })
          .catch((error) => {
            console.error('Erro ao processar notificações:', error)
          })
      }
    }, 2000) // Espera 2 segundos antes de processar

    return () => clearTimeout(timer)
  }, [
    todos,
    session?.user?.id,
    createRelevantNotifications,
    processNotificationBatch,
    queryClient,
  ])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const markAllAsRead = () => {
    markReadMutation.mutate({ all: true })
  }

  const markAsRead = (id: string) => {
    markReadMutation.mutate({ id })
  }

  const deleteNotification = (id: string) => {
    dismissMutation.mutate({ id })
  }

  // Completely delete all notifications using the reset endpoint
  const clearAllNotifications = () => {
    // Show confirmation dialog
    openConfirmDialog({
      title: 'Delete All Notifications',
      description: 'This will permanently delete all notifications from your account. This action cannot be undone. Continue?',
      variant: 'danger',
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      onConfirm: () => {
        setLoading(true)
        
        // Use the reset endpoint which completely removes notifications from database
        fetch('/api/notifications/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to delete notifications')
            }
            return response.json()
          })
          .then(() => {
            showSuccess('All notifications deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            setIsOpen(false)
            closeConfirmDialog()
            // Reset the processed tasks set to allow new notifications to be created
            lastProcessedRef.current = new Set()
          })
          .catch(error => {
            console.error('Error deleting all notifications:', error)
            showError('Failed to delete notifications')
            closeConfirmDialog()
          })
          .finally(() => {
            setLoading(false)
          })
      }
    })
  }

  const resetNotifications = () => {
    // Use o diálogo personalizado em vez de window.confirm
    openConfirmDialog({
      title: 'Reset Notifications',
      description:
        'This will reset all notifications. Your tasks will not be affected. Continue?',
      variant: 'warning',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      onConfirm: () => {
        setLoading(true)
        resetMutation.mutate(undefined, {
          onSuccess: () => {
            showSuccess('Notifications reset successfully')
            setIsOpen(false) // Fecha o dropdown após o reset
            closeConfirmDialog()
            // Limpa o registro de tarefas processadas para permitir recriação
            lastProcessedRef.current = new Set()
          },
          onError: (error) => {
            console.error('Error resetting notifications:', error)
            closeConfirmDialog()
          },
          onSettled: () => {
            setLoading(false)
          },
        })
      },
    })
  }

  // Obtem cor de fundo da notificação baseada no tipo
  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) {
      return 'bg-gray-100 dark:bg-gray-800/50'
    }

    switch (type) {
      case 'danger':
        return 'bg-red-100 dark:bg-red-900/30'
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900/30'
      case 'info':
      default:
        return 'bg-blue-100 dark:bg-blue-900/30'
    }
  }

  // Obtem ícone da notificação baseado no tipo
  const getNotificationIcon = (type: string, isRead: boolean) => {
    if (isRead) {
      return <FaCheck className="text-gray-500" />
    }

    switch (type) {
      case 'danger':
        return <FaBell className="text-red-500" />
      case 'warning':
        return <FaCalendar className="text-amber-500" />
      case 'info':
      default:
        return <FaBell className="text-blue-500" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="border-BorderLight hover:bg-BorderLight dark:border-BorderDark dark:hover:bg-BorderDark relative mr-3 cursor-pointer rounded-lg border-2 p-2 transition-all duration-300"
        aria-label="Notifications"
      >
        <IoNotificationsOutline className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="dark:bg-BlackLight absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg sm:w-96 dark:border-gray-700">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex space-x-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Mark all as read
                    </button>
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Clear all
                    </button>
                  </>
                )}
                <button
                  onClick={resetNotifications}
                  className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="mb-2 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                  <FaBell className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No notifications
                </p>
              </div>
            ) : (
              notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`mb-2 rounded-lg ${getNotificationBgColor(
                    notification.notification_type,
                    notification.read,
                  )} p-3`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="mt-1 mr-3">
                        {getNotificationIcon(
                          notification.notification_type,
                          notification.read,
                        )}
                      </div>
                      <div>
                        <h4
                          className={`text-sm font-medium ${
                            notification.read
                              ? 'text-gray-600 dark:text-gray-400'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {notification.title}
                          {notification.read && (
                            <span className="ml-2 text-xs text-gray-500">
                              (Read)
                            </span>
                          )}
                        </h4>
                        <p
                          className={`text-xs ${
                            notification.read
                              ? 'text-gray-500 dark:text-gray-500'
                              : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(
                            new Date(notification.due_date),
                            {
                              addSuffix: true,
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                          className="text-blue-500 hover:text-blue-700"
                          title="Mark as read"
                        >
                          <FaCheck size={12} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="text-red-500 hover:text-red-700"
                        title="Delete notification"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Adiciona o componente ConfirmationDialog */}
      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        description={dialogState.description}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
        isLoading={dialogState.isLoading}
      />
    </div>
  )
}