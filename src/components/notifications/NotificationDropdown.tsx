'use client'

import { useState, useEffect, useRef } from 'react'
import { IoNotificationsOutline } from 'react-icons/io5'
import { FaCalendar, FaBell, FaTrash, FaCheck } from 'react-icons/fa'
import { useTodosQuery } from '@/hooks/useTodosQuery'
import { formatDistanceToNow, isPast, isWithinInterval, addDays } from 'date-fns'
import { showSuccess } from '@/lib/toast'
import { useSession } from 'next-auth/react'
import { 
  useNotificationsQuery, 
  useCreateNotificationsMutation, 
  useMarkNotificationReadMutation, 
  useDismissNotificationMutation, 
  useResetNotificationsMutation,
  type Notification
} from '@/hooks/useNotificationsQuery'
import ConfirmationDialog, { useConfirmationDialog } from '@/components/common/ConfirmationDialog'

// Define a NotificationData interface for what we create and send to the API
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
  const { data: todos = [] } = useTodosQuery()
  
  // Use custom hooks for notifications
  const { data: notifications = [], isLoading } = useNotificationsQuery()
  const createNotificationsMutation = useCreateNotificationsMutation()
  const markReadMutation = useMarkNotificationReadMutation()
  const dismissMutation = useDismissNotificationMutation()
  const resetMutation = useResetNotificationsMutation()
  
  // Use the confirmation dialog hook
  const {
    dialogState,
    openConfirmDialog,
    closeConfirmDialog,
    setLoading
  } = useConfirmationDialog()

  // Add debug logging for notification creation
  useEffect(() => {
    // Log notifications data fetched
    if (notifications && notifications.length > 0) {
      console.log('Fetched notifications:', notifications.length);
    }
  }, [notifications]);

  // Update unread count whenever notifications change
  useEffect(() => {
    const unread = notifications.filter((n: Notification) => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Generate new notifications from todos
  useEffect(() => {
    if (!session?.user?.id || todos.length === 0) return;
  
    // Add a debounce mechanism to prevent excessive API calls
    const timer = setTimeout(() => {
      const now = new Date();
      const newNotifications: NotificationData[] = [];
      
      // Limit the number of notifications created at once
      const todosToProcess = todos.slice(0, 10); // Only process 10 todos at a time
      
      console.log('Processing todos for notifications:', todosToProcess.length);
      
      // Only create notifications for certain conditions
      todosToProcess.forEach((todo) => {
        if (todo.due_date && !todo.is_completed) {
          const dueDate = new Date(todo.due_date);
          
          // Only create notifications for tasks due within 3 days
          const threeDaysFromNow = new Date();
          threeDaysFromNow.setDate(now.getDate() + 3);
          
          if (dueDate <= threeDaysFromNow) {
            // Add your notification logic here, but with a limit
            // This prevents creating too many notifications at once
            
            // Example: only create one notification per todo
            const notificationType = isPast(dueDate) ? 'danger' : 
                                    isWithinInterval(dueDate, { start: now, end: addDays(now, 1) }) ? 
                                    'warning' : 'info';
            
            newNotifications.push({
              todo_id: todo.id,
              notification_type: notificationType,
              title: notificationType === 'danger' ? 'Overdue Task' : 
                    notificationType === 'warning' ? 'Due Soon' : 'Upcoming Deadline',
              message: `"${todo.title}" is due ${formatDistanceToNow(dueDate, { addSuffix: true })}`,
              due_date: dueDate.toISOString(),
              origin_id: `${notificationType}-${todo.id}`
            });
          }
        }
      });
  
      // Only make one API call with a reasonable number of notifications
      if (newNotifications.length > 0) {
        // Don't send more than 5 notifications at once
        const batchSize = 5;
        const firstBatch = newNotifications.slice(0, batchSize);
        
        console.log('Sending notifications to API:', firstBatch);
        
        createNotificationsMutation.mutate(firstBatch, {
          onSuccess: (data) => {
            console.log('Successfully created notifications:', data);
          },
          onError: (error) => {
            console.error('Failed to create notifications:', error);
          }
        });
        
        // Log information about batching for debugging
        if (newNotifications.length > batchSize) {
          console.log(`Created ${batchSize} notifications out of ${newNotifications.length} potential notifications.`);
        }
      } else {
        console.log('No new notifications to create.');
      }
    }, 2000); // Wait 2 seconds before processing
    
    return () => clearTimeout(timer);
  }, [todos, session?.user?.id, createNotificationsMutation]);

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

  const clearAllNotifications = () => {
    dismissMutation.mutate({ all: true })
    showSuccess('All notifications cleared')
  }

  const resetNotifications = () => {
    // Use the custom dialog instead of window.confirm
    openConfirmDialog({
      title: 'Reset Notifications',
      description: 'This will reset all notifications. Your tasks will not be affected. Continue?',
      variant: 'warning',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      onConfirm: () => {
        setLoading(true);
        resetMutation.mutate(undefined, {
          onSuccess: () => {
            showSuccess('Notifications reset successfully');
            setIsOpen(false); // Close the dropdown after reset
            closeConfirmDialog();
          },
          onError: (error) => {
            console.error('Error resetting notifications:', error);
            closeConfirmDialog();
          },
          onSettled: () => {
            setLoading(false);
          }
        });
      }
    });
  }

  // Get notification background color based on type
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

  // Get notification icon based on type
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
        className="border-BorderLight hover:bg-BorderLight dark:border-BorderDark mr-3 cursor-pointer rounded-lg border-2 p-2 transition-all duration-300 relative"
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
        <div className="dark:bg-BlackLight absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 sm:w-96">
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
                  className={`mb-2 rounded-lg ${
                    getNotificationBgColor(notification.notification_type, notification.read)
                  } p-3`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        {getNotificationIcon(notification.notification_type, notification.read)}
                      </div>
                      <div>
                        <h4 className={`text-sm font-medium ${
                          notification.read 
                            ? 'text-gray-600 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {notification.title}
                          {notification.read && <span className="ml-2 text-xs text-gray-500">(Read)</span>}
                        </h4>
                        <p className={`text-xs ${
                          notification.read 
                            ? 'text-gray-500 dark:text-gray-500' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(notification.due_date), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                          title="Mark as read"
                        >
                          <FaCheck size={12} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
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
      
      {/* Add the ConfirmationDialog component */}
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