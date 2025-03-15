'use client'
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaFlag,
  FaClock,
  FaExclamationCircle,
} from 'react-icons/fa'
import { useTodosQuery, useUpdateTodoMutation } from '@/hooks/useTodosQuery'
import { useCreateNotificationsMutation } from '@/hooks/useNotificationsQuery'
import { formatDistanceToNow } from 'date-fns'
import ConfirmationDialog, {
  useConfirmationDialog,
} from '@/components/common/ConfirmationDialog'

interface Todo {
  id: string
  title: string
  description: string | null
  priority: number
  due_date: string | null
  is_completed: boolean
  status?: 'active' | 'review' | 'completed'
}

interface TodoFormData {
  title: string
  description: string
  priority: number
  due_date: string
  is_completed: boolean
  status: 'active' | 'review' | 'completed'
}

interface TodoEditPageProps {
  todoId: string
}

// Interface for notification updates
interface NotificationData {
  todo_id: string
  notification_type: 'danger' | 'warning' | 'info'
  title: string
  message: string
  due_date: string
  origin_id: string
}

const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

const TodoEditPage: React.FC<TodoEditPageProps> = ({ todoId }) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: todos = [] as Todo[], isLoading } = useTodosQuery()
  const updateTodoMutation = useUpdateTodoMutation()
  const createNotificationsMutation = useCreateNotificationsMutation()

  const [formData, setFormData] = useState<TodoFormData>({
    title: '',
    description: '',
    priority: 1,
    due_date: '',
    is_completed: false,
    status: 'active',
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [originalDueDate, setOriginalDueDate] = useState<string | null>(null)

  useEffect(() => {
    if (todos.length > 0) {
      const todo = todos.find((t) => t.id === todoId)
      if (todo) {
        setFormData({
          title: todo.title || '',
          description: todo.description || '',
          priority: todo.priority || 1,
          due_date: todo.due_date ? formatDateForInput(todo.due_date) : '',
          is_completed: todo.is_completed || false,
          status: todo.status || 'active',
        })

        // Store the original due date for comparison
        setOriginalDueDate(todo.due_date)
      } else {
        router.push('/dashboard')
      }
    }
  }, [todos, todoId, router])

  // Check for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (name === 'is_completed' && type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked,
        status: checked ? 'completed' : 'active',
      })
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      })
    }

    setHasUnsavedChanges(true)
  }

  // Function to create or update notifications for a todo based on due date
  const updateNotificationsForTodo = (todo: Todo) => {
    // Skip if todo is completed
    if (todo.is_completed) {
      return
    }

    // We need a due date to create notifications
    if (!todo.due_date) {
      return
    }

    // IMPORTANT: Create all notification types regardless of date
    // This allows the server to determine which ones should be shown
    const dueDate = new Date(todo.due_date)
    const notifications: NotificationData[] = []

    // Always create all three notification types with consistent origin_ids
    // This ensures the server has all the data it needs

    // Create danger notification (overdue)
    notifications.push({
      todo_id: todo.id,
      notification_type: 'danger',
      title: 'Overdue Task',
      message: `"${todo.title}" is due ${formatDistanceToNow(dueDate, { addSuffix: true })}`,
      due_date: todo.due_date,
      origin_id: `danger-${todo.id}`,
    })

    // Create warning notification (due soon)
    notifications.push({
      todo_id: todo.id,
      notification_type: 'warning',
      title: 'Due Soon',
      message: `"${todo.title}" is due ${formatDistanceToNow(dueDate, { addSuffix: true })}`,
      due_date: todo.due_date,
      origin_id: `warning-${todo.id}`,
    })

    // Create info notification (upcoming)
    notifications.push({
      todo_id: todo.id,
      notification_type: 'info',
      title: 'Upcoming Deadline',
      message: `"${todo.title}" is due ${formatDistanceToNow(dueDate, { addSuffix: true })}`,
      due_date: todo.due_date,
      origin_id: `info-${todo.id}`,
    })

    // Send notifications to be created or updated
    createNotificationsMutation.mutate(notifications, {
      onSuccess: () => {
        // Invalidate notifications query to update UI immediately
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      },
      onError: (error) => {
        console.error('Failed to update notifications:', error)
      },
    })
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const updateData = {
      ...formData,
      priority: Number(formData.priority),
      due_date: formData.due_date || null,
    }

    updateTodoMutation.mutate(
      { id: todoId, data: updateData },
      {
        onSuccess: (response) => {
          setHasUnsavedChanges(false)

          // This is the fix for the type error - ensure response.data exists before using it
          if (!response.data) {
            console.error('No data returned from update mutation')
            router.push(`/todo/${todoId}`)
            return
          }

          // Check if relevant fields have changed that would affect notifications
          const hasDueDateChanged = originalDueDate !== updateData.due_date
          const hasTitleChanged =
            todos.find((t) => t.id === todoId)?.title !== updateData.title
          const hasCompletionChanged =
            todos.find((t) => t.id === todoId)?.is_completed !==
            updateData.is_completed

          // If todo is now completed, dismiss all its notifications
          if (updateData.is_completed) {
            fetch('/api/notifications/dismiss-for-todo', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ todoId }),
            }).catch((error) => {
              console.error('Error dismissing notifications:', error)
            })
          }
          // If any relevant field changed for an incomplete todo, recreate notifications
          else if (
            hasDueDateChanged ||
            hasTitleChanged ||
            hasCompletionChanged
          ) {
            // First delete all existing notifications for this todo
            fetch(`/api/notifications/delete-for-todo/${todoId}`, {
              method: 'DELETE',
            })
              .then((response) => {
                if (!response.ok)
                  throw new Error('Failed to delete notifications')
                return response.json()
              })
              .then(() => {
                // Short delay to ensure deletion completes before creating new ones
                setTimeout(() => {
                  // Another type safety check
                  if (response.data) {
                    updateNotificationsForTodo(response.data)
                  }
                }, 300)
              })
              .catch((error) => {
                console.error('Error managing notifications:', error)
                // Still try to update notifications as fallback, with type safety check
                if (response.data) {
                  updateNotificationsForTodo(response.data)
                }
              })
          }

          router.push(`/todo/${todoId}`)
        },
      },
    )
  }

  const { dialogState, openConfirmDialog, closeConfirmDialog } =
    useConfirmationDialog()

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      openConfirmDialog({
        title: 'Discard Changes',
        description:
          'You have unsaved changes. Are you sure you want to leave?',
        variant: 'warning',
        confirmText: 'Discard',
        cancelText: 'Stay',
        onConfirm: () => {
          router.push(`/todo/${todoId}`)
          closeConfirmDialog()
        },
      })
    } else {
      router.push(`/todo/${todoId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handleCancel}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Details</span>
        </button>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          Edit Task
        </div>
      </div>

      {/* Edit Form */}
      <div className="dark:bg-BlackLight overflow-hidden rounded-lg bg-white shadow-lg">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Title field */}
          <div className="mb-4">
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Task title"
            />
          </div>

          {/* Description field */}
          <div className="mb-4">
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Task description"
            ></textarea>
          </div>

          {/* Priority, Status and Due date */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="priority"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <FaFlag className="mr-1 inline text-blue-500" />
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="1">Low Priority</option>
                <option value="2">Medium Priority</option>
                <option value="3">High Priority</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <FaExclamationCircle className="mr-1 inline text-blue-500" />
                Status
              </label>
              <select
                id="status"
                name="status"
                value={
                  formData.status === 'completed' ? 'active' : formData.status
                }
                onChange={handleChange}
                disabled={formData.is_completed}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="review">In Review</option>
              </select>
              {formData.is_completed && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Status is set to completed because the task is marked as
                  complete
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="due_date"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <FaClock className="mr-1 inline text-blue-500" />
                Due Date
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Status checkbox */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_completed"
                name="is_completed"
                checked={formData.is_completed}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="is_completed"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Mark as completed
              </label>
            </div>
          </div>

          {/* Form buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FaTimes className="mr-1 inline" /> Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              disabled={updateTodoMutation.isPending}
            >
              {updateTodoMutation.isPending ? (
                <>
                  <svg
                    className="mr-2 -ml-1 inline h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-1 inline" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
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

export default TodoEditPage
