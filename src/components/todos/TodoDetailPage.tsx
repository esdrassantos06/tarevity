'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HiPencilAlt, HiTrash } from 'react-icons/hi'
import axiosClient from '@/lib/axios'
import {
  FaArrowLeft,
  FaClock,
  FaFlag,
  FaCheck,
  FaShare,
  FaUser,
  FaExclamationCircle,
  FaCalendarTimes,
} from 'react-icons/fa'
import {
  useTodosQuery,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} from '@/hooks/useTodosQuery'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/common/Dialog'
import ConfirmationDialog, {
  useConfirmationDialog,
} from '@/components/common/ConfirmationDialog'
import { useQueryClient } from '@tanstack/react-query'

interface TodoDetailPageProps {
  todoId: string
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return null
  const date = new Date(dateString)
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

const TodoDetailPage: React.FC<TodoDetailPageProps> = ({ todoId }) => {
  const router = useRouter()
  const { data: todos = [], isLoading, error } = useTodosQuery()
  const updateTodoMutation = useUpdateTodoMutation()
  const deleteTodoMutation = useDeleteTodoMutation()
  const queryClient = useQueryClient()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)


  const { dialogState, openConfirmDialog, closeConfirmDialog, setLoading } =
    useConfirmationDialog()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>
          Error loading task details:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <button aria-label='Go back to dashboard'
          onClick={() => router.push('/dashboard')}
          className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const todo = todos.find((t) => t.id === todoId)

  if (!todo) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-700 dark:text-gray-300">Task not found</p>
        <button aria-label='Go back to dashboard'
          onClick={() => router.push('/dashboard')}
          className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3:
        return { color: 'bg-red-500', label: 'High', textColor: 'text-red-500' }
      case 2:
        return {
          color: 'bg-yellow-500',
          label: 'Medium',
          textColor: 'text-yellow-500',
        }
      case 1:
      default:
        return {
          color: 'bg-green-500',
          label: 'Low',
          textColor: 'text-green-500',
        }
    }
  }

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'review':
        return {
          color: 'bg-amber-500',
          label: 'In Review',
          textColor: 'text-amber-500',
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        }
      case 'completed':
        return {
          color: 'bg-green-500',
          label: 'Completed',
          textColor: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
        }
      case 'active':
      default:
        return {
          color: 'bg-blue-500',
          label: 'Active',
          textColor: 'text-blue-500',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        }
    }
  }

  const priority = getPriorityColor(todo.priority)
  const status = getStatusInfo(todo.status)
  const dueDate = todo.due_date ? formatDate(todo.due_date) : 'No due date'
  const createdDate = formatDate(todo.created_at)

  const handleToggleComplete = () => {
    updateTodoMutation.mutate({
      id: todo.id,
      data: {
        is_completed: !todo.is_completed,
        status: !todo.is_completed ? 'completed' : 'active',
      },
    })
  }

  const handleDelete = () => {
    deleteTodoMutation.mutate(todo.id, {
      onSuccess: () => {
        router.push('/dashboard')
      },
    })
  }

  const handleClearDueDate = () => {
    if (!todo.due_date) return

    openConfirmDialog({
      title: 'Clear Due Date',
      description:
        'Clearing the due date will also remove all notifications for this task. Continue?',
      variant: 'warning',
      confirmText: 'Clear',
      cancelText: 'Cancel',
      onConfirm: () => {
        setLoading(true)

        updateTodoMutation.mutate(
          {
            id: todo.id,
            data: { due_date: null },
          },
          {
            onSuccess: () => {
              axiosClient.delete(`/api/notifications/delete-for-todo/${todo.id}`)
              .then(() => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] })
                closeConfirmDialog()
              })
              .catch((error) => {
                console.error('Error deleting notifications:', error)
                closeConfirmDialog()
              })
            },
            onError: (error) => {
              console.error('Error clearing due date:', error)
              closeConfirmDialog()
            },
          },
        )
      },
    })
  }

  const isInReview = todo.status === 'review'

  return (
    <div className="mx-auto flex w-full flex-col px-2 py-4 sm:w-220 sm:px-4 sm:py-6">
      {/* Header */}
      <div className="mb-2 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <button aria-label='Go back to dashboard'
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Dashboard</span>
        </button>

        <div className="grid grid-cols-2 place-items-center gap-2 sm:w-auto">
          <button aria-label='Edit task'
            className="bg-primary flex items-center rounded-md p-3 text-white hover:bg-blue-900"
            onClick={() => router.push(`/todo/${todo.id}/edit`)}
          >
            <HiPencilAlt />
          </button>
          <button aria-label='Delete task'
            className="flex items-center rounded-md bg-red-500 p-3 text-white hover:bg-red-600"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <HiTrash />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`dark:bg-BlackLight overflow-hidden rounded-lg bg-white shadow-lg ${isInReview ? 'border-l-4 border-amber-500' : ''}`}
      >
        {/* Company header - resembling job detail layout */}
        <div className="border-b border-gray-200 p-4 sm:p-6 dark:border-gray-700">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div
                className={`${priority.color} flex h-10 w-10 items-center justify-center rounded-md p-1 text-white sm:h-12 sm:w-12`}
              >
                <FaFlag />
              </div>
              <div>
                <h1
                  className={`text-xl font-bold sm:text-2xl ${todo.is_completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}
                >
                  {todo.title}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:gap-3 sm:text-sm dark:text-gray-400">
                  <span className="flex items-center">
                    <FaClock className="mr-1" />
                    Created: {createdDate}
                  </span>
                  <span className="flex items-center">
                    <FaFlag className={`mr-1 ${priority.textColor}`} />
                    {priority.label} Priority
                  </span>
                  {/* Status indicator */}
                  <span className={`flex items-center ${status.textColor}`}>
                    {isInReview ? (
                      <FaExclamationCircle className="mr-1" />
                    ) : (
                      <FaCheck className="mr-1" />
                    )}
                    {status.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2 sm:mt-0">
              <button aria-label='Mark as complete'
                onClick={handleToggleComplete}
                className={`flex items-center rounded-md px-3 py-1 ${
                  todo.is_completed
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                <FaCheck className="mr-1" />
                {todo.is_completed ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
          </div>
        </div>

        {/* Description section */}
        <div className="p-4 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 dark:text-white">
            Description
          </h2>
          <div className="prose prose-blue dark:prose-invert max-w-full">
            {todo.description ? (
              <p className="text-sm whitespace-pre-line text-gray-700 sm:text-base dark:text-gray-300">
                {todo.description}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic sm:text-base">
                No description provided
              </p>
            )}
          </div>
        </div>

        {/* Status note for review tasks */}
        {isInReview && (
          <div
            className={`mx-4 rounded-md p-3 sm:mx-6 sm:p-4 ${status.bgColor} mb-4`}
          >
            <div className="flex items-start">
              <FaExclamationCircle
                className={`mt-1 mr-2 ${status.textColor}`}
              />
              <div>
                <h3 className="text-sm font-medium text-amber-800 sm:text-base dark:text-amber-300">
                  This task is currently under review
                </h3>
                <p className="mt-1 text-xs text-amber-700 sm:text-sm dark:text-amber-400">
                  The task has been submitted for review. Once approved, it will
                  return to active status.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Details section */}
        <div className="p-4 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 dark:text-white">
            Details
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            <div className="rounded-md bg-white p-3 shadow sm:p-4 dark:bg-gray-800">
              <h3 className="mb-2 text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">
                Status
              </h3>
              <div className="flex items-center">
                <div
                  className={`h-3 w-3 rounded-full ${status.color} mr-2`}
                ></div>
                <p className="text-sm font-medium text-gray-900 sm:text-base dark:text-white">
                  {status.label}
                </p>
              </div>
            </div>
            <div className="rounded-md bg-white p-3 shadow sm:p-4 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="mb-2 text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">
                  Due Date
                </h3>
                {todo.due_date && (
                  <button aria-label='Clear due date'
                    onClick={handleClearDueDate}
                    className="mb-2 flex items-center text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Clear due date"
                  >
                    <FaCalendarTimes className="mr-1" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 sm:text-base dark:text-white">
                {dueDate}
              </p>
            </div>
            <div className="rounded-md bg-white p-3 shadow sm:p-4 dark:bg-gray-800">
              <h3 className="mb-2 text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">
                Last Updated
              </h3>
              <p className="text-sm font-medium text-gray-900 sm:text-base dark:text-white">
                {formatDate(todo.updated_at)}
              </p>
            </div>
            <div className="rounded-md bg-white p-3 shadow sm:p-4 dark:bg-gray-800">
              <h3 className="mb-2 text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">
                Assigned To
              </h3>
              <div className="flex items-center">
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white sm:h-8 sm:w-8">
                  <FaUser />
                </div>
                <p className="text-sm font-medium text-gray-900 sm:text-base dark:text-white">
                  You
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions section */}
        <div className="border-t border-gray-200 p-4 sm:p-6 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            <button aria-label='Share' className="flex items-center rounded-md bg-blue-100 px-3 py-1.5 text-xs text-blue-800 hover:bg-blue-200 sm:px-4 sm:py-2 sm:text-sm dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800">
              <FaShare className="mr-1 sm:mr-2" />
              Share
            </button>

            {/* Status change action buttons */}
            {!isInReview && !todo.is_completed && (
              <button aria-label='Mark as completed'
                onClick={() =>
                  updateTodoMutation.mutate({
                    id: todo.id,
                    data: { status: 'review' },
                  })
                }
                className="flex items-center rounded-md bg-amber-100 px-3 py-1.5 text-xs text-amber-800 hover:bg-amber-200 sm:px-4 sm:py-2 sm:text-sm dark:bg-amber-900 dark:text-amber-100 dark:hover:bg-amber-800"
              >
                <FaExclamationCircle className="mr-1 sm:mr-2" />
                Submit for Review
              </button>
            )}

            {isInReview && (
              <button aria-label='Mark as Approved'
                onClick={() =>
                  updateTodoMutation.mutate({
                    id: todo.id,
                    data: { status: 'active' },
                  })
                }
                className="flex items-center rounded-md bg-green-800 px-3 py-1.5 text-xs text-green-100 hover:bg-green-700 sm:px-4 sm:py-2 sm:text-sm"
              >
                <FaCheck className="mr-1 sm:mr-2" />
                Approve
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog using the Dialog component */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
            <button aria-label='Cancel'
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button aria-label='Delete'
              onClick={handleDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Clear Due Date */}
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

export default TodoDetailPage
