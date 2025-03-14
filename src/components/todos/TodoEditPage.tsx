'use client'
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaFlag,
  FaClock,
  FaExclamationCircle,
} from 'react-icons/fa'
import { useTodosQuery, useUpdateTodoMutation } from '@/hooks/useTodosQuery'
import ConfirmationDialog, { useConfirmationDialog } from '@/components/common/ConfirmationDialog'

// Define interface for our Todo item
interface Todo {
  id: string
  title: string
  description: string | null
  priority: number
  due_date: string | null
  is_completed: boolean
  status?: 'active' | 'review' | 'completed' // Added status field
}

// Define form data interface
interface TodoFormData {
  title: string
  description: string
  priority: number
  due_date: string
  is_completed: boolean
  status: 'active' | 'review' | 'completed'
}

// Define props interface
interface TodoEditPageProps {
  todoId: string
}

const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return ''
  // Convert date to yyyy-MM-dd format for date input
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

const TodoEditPage: React.FC<TodoEditPageProps> = ({ todoId }) => {
  const router = useRouter()
  const { data: todos = [] as Todo[], isLoading } = useTodosQuery()
  const updateTodoMutation = useUpdateTodoMutation()

  const [formData, setFormData] = useState<TodoFormData>({
    title: '',
    description: '',
    priority: 1,
    due_date: '',
    is_completed: false,
    status: 'active',
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Find the todo when data is loaded
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
      } else {
        // Todo not found, redirect to dashboard
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

    // If checkbox is checked, set status to completed
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Format the data for submission
    const updateData = {
      ...formData,
      priority: Number(formData.priority),
      due_date: formData.due_date || null,
    }

    updateTodoMutation.mutate(
      { id: todoId, data: updateData },
      {
        onSuccess: () => {
          setHasUnsavedChanges(false)
          router.push(`/todo/${todoId}`)
        },
      },
    )
  }

const { dialogState, openConfirmDialog, closeConfirmDialog } = useConfirmationDialog()

  const handleCancel = () => {
  if (hasUnsavedChanges) {
    openConfirmDialog({
      title: 'Discard Changes',
      description: 'You have unsaved changes. Are you sure you want to leave?',
      variant: 'warning',
      confirmText: 'Discard',
      cancelText: 'Stay',
      onConfirm: () => {
        router.push(`/todo/${todoId}`)
        closeConfirmDialog()
      }
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
      <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-BlackLight">
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
                value={formData.status === 'completed' ? 'active' : formData.status}
                onChange={handleChange}
                disabled={formData.is_completed}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="active">Active</option>
                <option value="review">In Review</option>
              </select>
              {formData.is_completed && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Status is set to completed because the task is marked as complete
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
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FaTimes className="mr-1 inline" /> Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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