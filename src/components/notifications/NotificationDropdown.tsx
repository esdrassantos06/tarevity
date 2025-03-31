'use client'

import { useState, useEffect } from 'react'
import { IoNotificationsOutline } from 'react-icons/io5'
import {
  FaCalendar,
  FaBell,
  FaCheck,
  FaEnvelope,
  FaEnvelopeOpen,
  FaTrash,
  FaCheckCircle,
  FaSyncAlt,
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
import { useTranslations } from 'next-intl'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export default function NotificationDropdown() {
  const t = useTranslations('notifications')
  const { status } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const {
    data: notifications = [],
    isLoading,
    refreshNotifications,
    forceRefreshNotifications,
  } = useNotificationsQuery({
    enabled: status === 'authenticated',
  })

  const markReadMutation = useMarkNotificationReadMutation()
  const dismissMutation = useDismissNotificationMutation()

  const { dialogState, openConfirmDialog, closeConfirmDialog, setLoading } =
    useConfirmationDialog()

  const [allRead, setAllRead] = useState(false)

  const handleRefresh = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      await forceRefreshNotifications()
      showSuccess(t('success.updated'))
    } catch (error) {
      console.error('Error updating notifications:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (open) {
      refreshNotifications().catch((error: unknown) => {
        console.error('Error updating notifications when opening:', error)
      })
    }
  }, [open, refreshNotifications])

  useEffect(() => {
    const unread = notifications.filter((n: Notification) => !n.read).length
    setUnreadCount(unread)

    setAllRead(unread === 0 && notifications.length > 0)
  }, [notifications])

  const handleToggleRead = (notification: Notification) => {
    markReadMutation.mutate(
      {
        id: notification.id,
        markAsUnread: notification.read,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
          queryClient.refetchQueries({ queryKey: ['notifications'] })
        },
        onError: (error) => {
          showError(t('error.updateFailed'))
          console.error('Error updating notification:', error)
        },
      },
    )
  }

  const handleDeleteNotification = (notificationId: string) => {
    dismissMutation.mutate(
      { id: notificationId },
      {
        onSuccess: () => {
          showSuccess(t('success.removed'))
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
          queryClient.refetchQueries({ queryKey: ['notifications'] })
        },
        onError: (error) => {
          showError(t('error.removeFailed'))
          console.error('Error removing notification:', error)
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
            queryClient.refetchQueries({ queryKey: ['notifications'] })
          },
          onError: (error) => {
            console.error('Error marking notifications as unread:', error)
            showError(t('error.markUnreadFailed'))
          },
        },
      )
    } else {
      markReadMutation.mutate(
        { all: true },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.refetchQueries({ queryKey: ['notifications'] })
          },
          onError: (error) => {
            console.error('Error marking notifications as read:', error)
            showError(t('error.markReadFailed'))
          },
        },
      )
    }
  }

  const deleteAllNotifications = () => {
    openConfirmDialog({
      title: t('dialog.removeAll.title'),
      description: t('dialog.removeAll.description'),
      variant: 'danger',
      confirmText: t('dialog.removeAll.confirm'),
      cancelText: t('dialog.removeAll.cancel'),
      onConfirm: () => {
        setLoading(true)

        dismissMutation.mutate(
          { all: true },
          {
            onSuccess: () => {
              showSuccess(t('success.allRemoved'))
              setOpen(false)
              closeConfirmDialog()
              queryClient.invalidateQueries({ queryKey: ['notifications'] })
              queryClient.refetchQueries({ queryKey: ['notifications'] })
            },
            onError: (error) => {
              console.error('Error removing all notifications:', error)
              showError(t('error.removeAllFailed'))
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
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="border-BorderLight hover:bg-BorderLight dark:border-BorderDark dark:hover:bg-BorderDark relative mr-2 size-10 p-2"
            aria-label={t('aria.notifications')}
          >
            <IoNotificationsOutline className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="dark:bg-BlackLight w-[calc(100vw-2rem)] sm:w-100 md:w-120"
          sideOffset={8}
          align="end"
        >
          <div className="flex items-center justify-between px-4 py-2">
            <DropdownMenuLabel className="mb-2 font-medium text-gray-900 sm:mb-0 dark:text-white">
              {t('title')}
            </DropdownMenuLabel>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 text-xs"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <FaSyncAlt
                  className={`mr-1 size-3 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                {t('actions.refresh')}
              </Button>

              {notifications.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={toggleReadStatus}
                  >
                    {allRead ? (
                      <>
                        <FaEnvelope className="mr-1 size-3" />
                        {t('actions.markUnread')}
                      </>
                    ) : (
                      <>
                        <FaEnvelopeOpen className="mr-1 size-3" />
                        {t('actions.markRead')}
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-red-500 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                    onClick={deleteAllNotifications}
                  >
                    <FaTrash className="mr-1 size-3" />
                    {t('actions.removeAll')}
                  </Button>
                </>
              )}
            </div>
          </div>

          <DropdownMenuSeparator />

          <div className="max-h-[50vh] overflow-y-auto py-2 sm:max-h-80">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="size-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="mb-2 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                  <FaBell className="size-6 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">{t('empty')}</p>
              </div>
            ) : (
              <DropdownMenuGroup>
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={`mx-2 mb-2 rounded-lg ${getNotificationBgColor(
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
                              {t('status.read')}
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

                        {/* Action buttons */}
                        <div className="mt-2 flex justify-end space-x-2">
                          <Button
                            variant={
                              notification.read ? 'outline' : 'secondary'
                            }
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleRead(notification)
                            }}
                            title={
                              notification.read
                                ? t('tooltip.markAsUnread')
                                : t('tooltip.markAsRead')
                            }
                          >
                            {notification.read ? (
                              <>
                                <FaEnvelope className="mr-1 size-3" />
                                <span className="truncate">
                                  {t('actions.unread')}
                                </span>
                              </>
                            ) : (
                              <>
                                <FaCheckCircle className="mr-1 size-3" />
                                <span className="truncate">
                                  {t('actions.read')}
                                </span>
                              </>
                            )}
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteNotification(notification.id)
                            }}
                            title={t('tooltip.removeNotification')}
                          >
                            <FaTrash className="mr-1 size-3" />
                            <span className="truncate">
                              {t('actions.remove')}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </DropdownMenuGroup>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation dialog */}
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
