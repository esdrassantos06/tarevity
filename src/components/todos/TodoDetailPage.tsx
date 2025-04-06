'use client'
import React, { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
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
import { useTranslations } from 'next-intl'

interface TodoDetailPageProps {
  todoId: string
}

const TodoDetailPage: React.FC<TodoDetailPageProps> = ({ todoId }) => {
  const t = useTranslations('todoDetail')
  const router = useRouter()
  const { data: todos = [], isLoading, error } = useTodosQuery()
  const updateTodoMutation = useUpdateTodoMutation()
  const deleteTodoMutation = useDeleteTodoMutation()
  const queryClient = useQueryClient()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { dialogState, openConfirmDialog, closeConfirmDialog, setLoading } =
    useConfirmationDialog()

  const formatDateLocalized = (dateString: string | null) => {
    if (!dateString) return t('noDueDate')
    const date = new Date(dateString)
    const months = [
      t('months.jan'),
      t('months.feb'),
      t('months.mar'),
      t('months.apr'),
      t('months.may'),
      t('months.jun'),
      t('months.jul'),
      t('months.aug'),
      t('months.sep'),
      t('months.oct'),
      t('months.nov'),
      t('months.dec'),
    ]
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>
          {t('errorLoadingTaskDetails')}:{' '}
          {error instanceof Error ? error.message : t('unknownError')}
        </p>
        <button
          aria-label={t('goBackToDashboard')}
          onClick={() => router.push('/dashboard')}
          className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          {t('backToDashboard')}
        </button>
      </div>
    )
  }

  const todo = todos.find((t) => t.id === todoId)

  if (!todo) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-700 dark:text-gray-300">{t('taskNotFound')}</p>
        <button
          aria-label={t('goBackToDashboard')}
          onClick={() => router.push('/dashboard')}
          className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          {t('backToDashboard')}
        </button>
      </div>
    )
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3:
        return {
          color: 'bg-red-500',
          label: t('priority.high'),
          textColor: 'text-red-500',
        }
      case 2:
        return {
          color: 'bg-yellow-500',
          label: t('priority.medium'),
          textColor: 'text-yellow-500',
        }
      case 1:
      default:
        return {
          color: 'bg-green-500',
          label: t('priority.low'),
          textColor: 'text-green-500',
        }
    }
  }

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'review':
        return {
          color: 'bg-amber-500',
          label: t('status.inReview'),
          textColor: 'text-amber-500',
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        }
      case 'completed':
        return {
          color: 'bg-green-500',
          label: t('status.completed'),
          textColor: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
        }
      case 'active':
      default:
        return {
          color: 'bg-blue-500',
          label: t('status.active'),
          textColor: 'text-blue-500',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        }
    }
  }

  const priority = getPriorityColor(todo.priority)
  const status = getStatusInfo(todo.status)
  const dueDate = todo.due_date
    ? formatDateLocalized(todo.due_date)
    : t('noDueDate')
  const createdDate = formatDateLocalized(todo.created_at)

  const handleToggleComplete = async () => {
    const newIsCompleted = !todo.is_completed
    const newStatus = newIsCompleted ? 'completed' : 'active'

    updateTodoMutation.mutate(
      {
        id: todo.id,
        data: {
          is_completed: newIsCompleted,
          status: newStatus,
        },
      },
      {
        onSuccess: async () => {
          try {
            if (newIsCompleted) {
              await axiosClient.post('/api/notifications/dismiss-for-todo', {
                todoId: todo.id,
              })
            } else if (todo.due_date) {
              await queryClient.refetchQueries({ queryKey: ['notifications'] })
            }
          } catch (error) {
            console.error('Error managing notifications:', error)
          }
        },
      },
    )
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(false)
    deleteTodoMutation.mutate(todo.id, {
      onSuccess: async () => {
        try {
          await axiosClient.delete(
            `/api/notifications/delete-for-todo/${todo.id}`,
          )
        } catch (error) {
          console.error('Error deleting notifications:', error)
        }
        router.push('/dashboard')
      },
    })
  }

  const handleClearDueDate = () => {
    if (!todo.due_date) return

    openConfirmDialog({
      title: t('clearDueDate'),
      description: t('clearDueDateDescription'),
      variant: 'warning',
      confirmText: t('clear'),
      cancelText: t('cancel'),
      onConfirm: () => {
        setLoading(true)

        updateTodoMutation.mutate(
          {
            id: todo.id,
            data: { due_date: null },
          },
          {
            onSuccess: async () => {
              try {
                await axiosClient.delete(
                  `/api/notifications/delete-for-todo/${todo.id}`,
                )
              } catch (error) {
                console.error('Error deleting notifications:', error)
              } finally {
                closeConfirmDialog()
              }
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

  const handleStatusChange = async (newStatus: 'active' | 'review') => {
    updateTodoMutation.mutate(
      {
        id: todo.id,
        data: { status: newStatus },
      },
      {
        onSuccess: async () => {
          try {
            if (newStatus === 'active' && todo.due_date) {
              await queryClient.refetchQueries({ queryKey: ['notifications'] })
            }
          } catch (error) {
            console.error('Error managing notifications:', error)
          }
        },
      },
    )
  }

  const isInReview = todo.status === 'review'

  return (
    <div className="mx-auto flex w-full flex-col px-2 py-4 sm:w-220 sm:px-4 sm:py-6">
      {/* Header */}
      <div className="mb-2 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <button
          aria-label={t('goBackToDashboard')}
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <FaArrowLeft className="mr-2" />
          <span>{t('backToDashboard')}</span>
        </button>

        <div className="grid grid-cols-2 place-items-center gap-2 sm:w-auto">
          <button
            aria-label={t('editTask')}
            className="bg-primary flex items-center rounded-md p-3 text-white hover:bg-blue-900"
            onClick={() => router.push(`/todo/${todo.id}/edit`)}
          >
            <HiPencilAlt />
          </button>
          <button
            aria-label={t('deleteTask')}
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
                className={`${priority.color} flex size-10 flex-shrink-0 items-center justify-center rounded-md p-1 text-white sm:size-12`}
              >
                <FaFlag />
              </div>
              <div className="min-w-0 flex-1">
                <h1
                  className={`text-xl font-bold break-words sm:text-2xl ${todo.is_completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}
                >
                  {todo.title}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:gap-3 sm:text-sm dark:text-gray-400">
                  <span className="flex items-center">
                    <FaClock className="mr-1" />
                    {t('created')}: {createdDate}
                  </span>
                  <span className="flex items-center">
                    <FaFlag className={`mr-1 ${priority.textColor}`} />
                    {t('priorityWithLabel', { priority: priority.label })}
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
              <button
                aria-label={t('markAsComplete')}
                onClick={handleToggleComplete}
                className={`flex items-center rounded-md px-3 py-1 ${
                  todo.is_completed
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                <FaCheck className="mr-1" />
                {todo.is_completed ? t('completed') : t('markComplete')}
              </button>
            </div>
          </div>
        </div>

        {/* Description section */}
        <div className="p-4 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 dark:text-white">
            {t('description')}
          </h2>
          <div className="prose prose-blue dark:prose-invert max-w-full">
            {todo.description ? (
              <p className="text-sm whitespace-pre-line text-gray-700 sm:text-base dark:text-gray-300">
                {todo.description}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic sm:text-base">
                {t('noDescriptionProvided')}
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
                  {t('taskUnderReview')}
                </h3>
                <p className="mt-1 text-xs text-amber-700 sm:text-sm dark:text-amber-400">
                  {t('taskUnderReviewDescription')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Details section */}
        <div className="p-4 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 dark:text-white">
            {t('details')}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            <div className="rounded-md bg-white p-3 shadow sm:p-4 dark:bg-gray-800">
              <h3 className="mb-2 text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">
                {t('status.label')}
              </h3>
              <div className="flex items-center">
                <div
                  className={`size-3 rounded-full ${status.color} mr-2`}
                ></div>
                <p className="text-sm font-medium text-gray-900 sm:text-base dark:text-white">
                  {status.label}
                </p>
              </div>
            </div>
            <div className="rounded-md bg-white p-3 shadow sm:p-4 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="mb-2 text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">
                  {t('dueDate')}
                </h3>
                {todo.due_date && (
                  <button
                    aria-label={t('clearDueDate')}
                    onClick={handleClearDueDate}
                    className="mb-2 flex items-center text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title={t('clearDueDate')}
                  >
                    <FaCalendarTimes className="mr-1" />
                    <span>{t('clear')}</span>
                  </button>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 sm:text-base dark:text-white">
                {dueDate}
              </p>
            </div>
            <div className="rounded-md bg-white p-3 shadow sm:p-4 dark:bg-gray-800">
              <h3 className="mb-2 text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">
                {t('lastUpdated')}
              </h3>
              <p className="text-sm font-medium text-gray-900 sm:text-base dark:text-white">
                {formatDateLocalized(todo.updated_at)}
              </p>
            </div>
            <div className="rounded-md bg-white p-3 shadow sm:p-4 dark:bg-gray-800">
              <h3 className="mb-2 text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">
                {t('assignedTo')}
              </h3>
              <div className="flex items-center">
                <div className="mr-2 flex size-6 items-center justify-center rounded-full bg-blue-500 text-white sm:size-8">
                  <FaUser />
                </div>
                <p className="text-sm font-medium text-gray-900 sm:text-base dark:text-white">
                  {t('you')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions section */}
        <div className="border-t border-gray-200 p-4 sm:p-6 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            <button
              aria-label={t('share')}
              className="flex items-center rounded-md bg-blue-100 px-3 py-1.5 text-xs text-blue-800 hover:bg-blue-200 sm:px-4 sm:py-2 sm:text-sm dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
            >
              <FaShare className="mr-1 sm:mr-2" />
              {t('share')}
            </button>

            {/* Status change action buttons */}
            {!isInReview && !todo.is_completed && (
              <button
                aria-label={t('submitForReview')}
                onClick={() => handleStatusChange('review')}
                className="flex items-center rounded-md bg-amber-100 px-3 py-1.5 text-xs text-amber-800 hover:bg-amber-200 sm:px-4 sm:py-2 sm:text-sm dark:bg-amber-900 dark:text-amber-100 dark:hover:bg-amber-800"
              >
                <FaExclamationCircle className="mr-1 sm:mr-2" />
                {t('submitForReview')}
              </button>
            )}

            {isInReview && (
              <button
                aria-label={t('approve')}
                onClick={() => handleStatusChange('active')}
                className="flex items-center rounded-md bg-green-800 px-3 py-1.5 text-xs text-green-100 hover:bg-green-700 sm:px-4 sm:py-2 sm:text-sm"
              >
                <FaCheck className="mr-1 sm:mr-2" />
                {t('approve')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog using the Dialog component */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteTask')}</DialogTitle>
            <DialogDescription>{t('deleteTaskConfirmation')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
            <button
              aria-label={t('cancel')}
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {t('cancel')}
            </button>
            <button
              aria-label={t('delete')}
              onClick={handleDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              {t('delete')}
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
