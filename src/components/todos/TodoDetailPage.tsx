'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HiPencilAlt, HiTrash  } from "react-icons/hi";
import {
  FaArrowLeft,
  FaClock,
  FaFlag,
  FaCheck,
  FaShare,
  FaUser,
  FaExclamationCircle,
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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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
        <button
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
        <button
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

  // New function to get status information
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

  const isInReview = todo.status === 'review'

  return (
    <div className="mx-auto flex max-w-4xl flex-col px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-2 justify-around sm:justify-between">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Dashboard</span>
        </button>

        <div className="grid place-items-center grid-cols-2 gap-2">
          <button
            className="bg-primary flex items-center rounded-md p-3 text-white hover:bg-blue-900"
            onClick={() => router.push(`/todo/${todo.id}/edit`)}
          >
            <HiPencilAlt  />
          </button>
          <button
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
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div
                className={`${priority.color} flex h-12 w-12 items-center justify-center rounded-md p-1 text-white`}
              >
                <FaFlag />
              </div>
              <div>
                <h1
                  className={`mr-4 text-2xl font-bold ${todo.is_completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}
                >
                  {todo.title}
                </h1>
                <div className="mt-1 flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
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
            <div>
              <button
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
        <div className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Description
          </h2>
          <div className="prose prose-blue dark:prose-invert">
            {todo.description ? (
              <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                {todo.description}
              </p>
            ) : (
              <p className="text-gray-500 italic">No description provided</p>
            )}
          </div>
        </div>

        {/* Status note for review tasks */}
        {isInReview && (
          <div className={`mx-6 rounded-md p-4 ${status.bgColor} mb-4`}>
            <div className="flex items-start">
              <FaExclamationCircle
                className={`mt-1 mr-2 ${status.textColor}`}
              />
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-300">
                  This task is currently under review
                </h3>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                  The task has been submitted for review. Once approved, it will
                  return to active status.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Details section */}
        <div className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Details
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-md bg-white p-4 shadow dark:bg-gray-800">
              <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </h3>
              <div className="flex items-center">
                <div
                  className={`h-3 w-3 rounded-full ${status.color} mr-2`}
                ></div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {status.label}
                </p>
              </div>
            </div>
            <div className="rounded-md bg-white p-4 shadow dark:bg-gray-800">
              <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Due Date
              </h3>
              <p className="font-medium text-gray-900 dark:text-white">
                {dueDate}
              </p>
            </div>
            <div className="rounded-md bg-white p-4 shadow dark:bg-gray-800">
              <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Last Updated
              </h3>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(todo.updated_at)}
              </p>
            </div>
            <div className="rounded-md bg-white p-4 shadow dark:bg-gray-800">
              <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Assigned To
              </h3>
              <div className="flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                  <FaUser />
                </div>
                <p className="font-medium text-gray-900 dark:text-white">You</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions section */}
        <div className="border-t border-gray-200 p-6 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center rounded-md bg-blue-100 px-4 py-2 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800">
              <FaShare className="mr-2" />
              Share
            </button>

            {/* Status change action buttons */}
            {!isInReview && !todo.is_completed && (
              <button
                onClick={() =>
                  updateTodoMutation.mutate({
                    id: todo.id,
                    data: { status: 'review' },
                  })
                }
                className="flex items-center rounded-md bg-amber-100 px-4 py-2 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:hover:bg-amber-800"
              >
                <FaExclamationCircle className="mr-2" />
                Submit for Review
              </button>
            )}

            {isInReview && (
              <button
                onClick={() =>
                  updateTodoMutation.mutate({
                    id: todo.id,
                    data: { status: 'active' },
                  })
                }
                className="flex items-center rounded-md bg-green-800 px-4 py-2 text-green-100 hover:bg-green-700"
              >
                <FaCheck className="mr-2" />
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
          <DialogFooter>
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TodoDetailPage
