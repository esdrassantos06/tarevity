'use client'
import React, { useState, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { FaArrowLeft, FaSave, FaTimes, FaFlag, FaClock } from 'react-icons/fa'
import { useCreateTodoMutation } from '@/hooks/useTodosQuery'
import { showError, showLoading, updateToast, showInfo } from '@/lib/toast'
import ConfirmationDialog, { useConfirmationDialog } from '@/components/common/ConfirmationDialog'

// Define interface for our form data
interface TodoFormData {
  title: string;
  description: string;
  priority: number;
  due_date: string;
  is_completed: boolean;
  status: 'active' | 'review' | 'completed';
}

// Define the Todo interface that matches your API
interface Todo {
  id: string
  title: string
  description: string | null
  priority: number
  due_date: string | null
  is_completed: boolean
}

// Define interface for API response with generic type parameter
interface ApiResult<T = Todo> {
  data: T | null
  error?: unknown // Using unknown instead of any for type safety
}

const NewTodoPage: React.FC = () => {
  const router = useRouter()
  const createTodoMutation = useCreateTodoMutation()

  const [formData, setFormData] = useState<TodoFormData>({
    title: '',
    description: '',
    priority: 2, // Default to medium priority
    due_date: '',
    is_completed: false,
    status: 'active' // Default to active
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target
    const checked =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validation check
    if (!formData.title.trim()) {
      showError('Please enter a title for the task')
      return
    }

    const toastId = showLoading('Creating task...')

    // Format the data for submission
    const todoData = {
      ...formData,
      priority: Number(formData.priority),
      due_date: formData.due_date || null,
    }

    createTodoMutation.mutate(todoData, {
      onSuccess: (data: ApiResult<Todo>) => {
        updateToast(toastId, 'Task created successfully!', {
          type: 'success',
          isLoading: false,
          autoClose: 3000
        })
        
        if (data.data && data.data.id) {
          // Navigate to the new todo detail page
          router.push(`/todo/${data.data.id}`)
        } else {
          // Fallback to dashboard
          router.push('/dashboard')
        }
      },
      onError: (error) => {
        updateToast(toastId, 'Failed to create task', {
          type: 'error',
          isLoading: false,
          autoClose: 5000
        })
        
        showError(error instanceof Error ? error.message : 'An error occurred while creating the task')
      },
    })
  }

const { dialogState, openConfirmDialog, closeConfirmDialog } = useConfirmationDialog()

  const handleCancel = () => {
    // Show confirmation if form has data
    if (formData.title.trim() || formData.description.trim() || formData.due_date) {
      openConfirmDialog({
      title: 'Discard Changes',
      description: 'Discard changes? Any unsaved changes will be lost.',
      variant: 'warning',
      confirmText: 'Discard',
      cancelText: 'Cancel',
      onConfirm: () => {
        showInfo('Changes discarded')
        router.push('/dashboard')
        closeConfirmDialog()
      }
    })
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Dashboard</span>
        </button>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          Create New Task
        </div>
      </div>

      {/* Create Form */}
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
              placeholder="Enter task title"
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
              placeholder="Enter task description (optional)"
            ></textarea>
          </div>

          {/* Priority and due date */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
              disabled={createTodoMutation.isPending}
            >
              {createTodoMutation.isPending ? (
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
                  Creating...
                </>
              ) : (
                <>
                  <FaSave className="mr-1 inline" /> Create Task
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

export default NewTodoPage