'use client'

import { useState, useRef, useEffect } from 'react'
import { IoNotificationsOutline } from 'react-icons/io5'
import {
  FaCalendar,
  FaBell,
  FaCheck,
  FaEnvelope,
  FaEnvelopeOpen,
  FaTrash,
  FaCheckCircle,
  FaSyncAlt
} from 'react-icons/fa'
import { formatDistanceToNow } from 'date-fns'
import { showSuccess, showError } from '@/lib/toast'
import { useQueryClient } from '@tanstack/react-query'
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useDismissNotificationMutation,
} from '@/hooks/useNotificationsQuery'
import ConfirmationDialog, {
  useConfirmationDialog,
} from '@/components/common/ConfirmationDialog'
import { useSession } from 'next-auth/react'
import { Notification } from '@/lib/notifications'
import { refreshNotificationsClient } from '@/lib/notification-updater'

export default function NotificationDropdown() {
  const { status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data: notifications = [], isLoading } = useNotificationsQuery({
    enabled: status === 'authenticated',
  })

  const markReadMutation = useMarkNotificationReadMutation()
  const dismissMutation = useDismissNotificationMutation()

  const { dialogState, openConfirmDialog, closeConfirmDialog, setLoading } =
    useConfirmationDialog()

  const [allRead, setAllRead] = useState(false)

  // Manualmente atualiza notificações via API
  const handleRefresh = async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    try {
      await refreshNotificationsClient()
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
      showSuccess('Notificações atualizadas')
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Atualiza notificações quando o dropdown é aberto
  useEffect(() => {
    if (isOpen) {
      refreshNotificationsClient().catch(error => {
        console.error('Erro ao atualizar notificações ao abrir:', error)
      })
    }
  }, [isOpen])

  useEffect(() => {
    const unread = notifications.filter((n: Notification) => !n.read).length
    setUnreadCount(unread)

    setAllRead(unread === 0 && notifications.length > 0)
  }, [notifications])

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

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleToggleRead = (notification: Notification) => {
    markReadMutation.mutate(
      {
        id: notification.id,
        markAsUnread: notification.read,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
        onError: (error) => {
          showError('Falha ao atualizar notificação')
          console.error('Erro ao atualizar notificação:', error)
        },
      },
    )
  }

  const handleDeleteNotification = (notificationId: string) => {
    dismissMutation.mutate(
      { id: notificationId },
      {
        onSuccess: () => {
          showSuccess('Notificação removida')
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
        onError: (error) => {
          showError('Falha ao remover notificação')
          console.error('Erro ao remover notificação:', error)
        },
      },
    )
  }

  const toggleReadStatus = () => {
    if (allRead) {
      markReadMutation.mutate(
        { all: true, markAsUnread: true },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
          },
          onError: (error) => {
            console.error('Erro ao marcar notificações como não lidas:', error)
            showError('Falha ao marcar notificações como não lidas')
          },
        },
      )
    } else {
      markReadMutation.mutate(
        { all: true },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
          },
          onError: (error) => {
            console.error('Erro ao marcar notificações como lidas:', error)
            showError('Falha ao marcar notificações como lidas')
          },
        },
      )
    }
  }

  const deleteAllNotifications = () => {
    openConfirmDialog({
      title: 'Remover Todas as Notificações',
      description:
        'Isso removerá todas as suas notificações atuais. Esta ação não pode ser desfeita. Continuar?',
      variant: 'danger',
      confirmText: 'Remover Todas',
      cancelText: 'Cancelar',
      onConfirm: () => {
        setLoading(true)

        dismissMutation.mutate(
          { all: true },
          {
            onSuccess: () => {
              showSuccess('Todas as notificações foram removidas')
              setIsOpen(false)
              closeConfirmDialog()
              queryClient.invalidateQueries({ queryKey: ['notifications'] })
            },
            onError: (error) => {
              console.error('Erro ao remover todas as notificações:', error)
              showError('Falha ao remover notificações')
              closeConfirmDialog()
            },
            onSettled: () => {
              setLoading(false)
            },
          },
        )
      },
    })
  }

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
        aria-label="Notificações"
      >
        <IoNotificationsOutline className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="dark:bg-BlackLight fixed inset-x-0 top-[60px] z-50 mx-auto w-[90%] max-w-md rounded-lg border border-gray-200 bg-white shadow-lg sm:absolute sm:inset-auto sm:top-auto sm:right-0 sm:mx-0 sm:w-96 dark:border-gray-700"
          style={{
            maxHeight: 'calc(100vh - 80px)',
          }}
        >
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Notificações
              </h3>
              <div className="flex space-x-4">
                <button
                  aria-label="Atualizar notificações"
                  onClick={handleRefresh}
                  className="flex items-center text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  disabled={isRefreshing}
                >
                  <FaSyncAlt className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Atualizar
                </button>
                {notifications.length > 0 && (
                  <>
                    <button
                      aria-label={
                        allRead ? 'Marcar todas como não lidas' : 'Marcar todas como lidas'
                      }
                      onClick={toggleReadStatus}
                      className="flex items-center text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      {allRead ? (
                        <>
                          <FaEnvelope className="mr-1" />
                          Marcar não lidas
                        </>
                      ) : (
                        <>
                          <FaEnvelopeOpen className="mr-1" />
                          Marcar lidas
                        </>
                      )}
                    </button>
                    <button
                      aria-label="Remover todas as notificações"
                      onClick={deleteAllNotifications}
                      className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remover todas
                    </button>
                  </>
                )}
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
                  Nenhuma notificação
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
                  <div className="flex items-start">
                    <div className="mt-1 mr-3">
                      {getNotificationIcon(
                        notification.notification_type,
                        notification.read,
                      )}
                    </div>
                    <div className="flex-1">
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
                            (Lida)
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
                        {formatDistanceToNow(new Date(notification.due_date), {
                          addSuffix: true,
                        })}
                      </p>

                      {/* Botões de ação */}
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          aria-label={
                            notification.read
                              ? 'Marcar como não lida'
                              : 'Marcar como lida'
                          }
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleRead(notification)
                          }}
                          className={`flex items-center rounded-md px-2 py-1 text-xs ${
                            notification.read
                              ? 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50'
                          }`}
                          title={
                            notification.read
                              ? 'Marcar como não lida'
                              : 'Marcar como lida'
                          }
                        >
                          {notification.read ? (
                            <>
                              <FaEnvelope className="mr-1 h-3 w-3" />
                              <span>Não lida</span>
                            </>
                          ) : (
                            <>
                              <FaCheckCircle className="mr-1 h-3 w-3" />
                              <span>Lida</span>
                            </>
                          )}
                        </button>

                        <button
                          aria-label="Remover notificação"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNotification(notification.id)
                          }}
                          className="flex items-center rounded-md bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/50"
                          title="Remover notificação"
                        >
                          <FaTrash className="mr-1 h-3 w-3" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Diálogo de confirmação */}
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